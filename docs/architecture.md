# LGTM Architecture Companion

This document is a visual companion for the video and blog post.
It focuses on *why things exist* and *how signals move*, without turning into a tutorial.

## 1) LGTM: what is what

| Component | Primary role | Signal type |
| --- | --- | --- |
| Loki | Log storage and query engine | Logs |
| Grafana | UI, correlation, dashboards, alerting | Reads all |
| Tempo | Distributed tracing backend | Traces |
| Mimir | Time-series metrics backend | Metrics |
| Alloy | Collection and routing pipeline | Ingest + forward |
| OpenTelemetry | Vendor-neutral instrumentation standard | Logs, metrics, traces |

## 2) LGTM + OTel in one picture

```mermaid
flowchart LR
    User["User Request"] --> API["Demo API (FastAPI)"]
    API --> OTel["OpenTelemetry SDK"]
    OTel -- "OTLP gRPC" --> Alloy["Grafana Alloy (Collector)"]

    API -- "stdout logs" --> Docker["Docker Engine Logs"]
    Docker --> Alloy

    Alloy --> Loki["Loki"]
    Alloy --> Tempo["Tempo"]
    Alloy --> Mimir["Mimir"]

    Grafana["Grafana UI"] --> Loki
    Grafana --> Tempo
    Grafana --> Mimir
```

## 3) How components connect (control vs data)

```mermaid
flowchart TB
    subgraph DataPlane["Data plane (signals)"]
      API["API"] --> OTel["OTel SDK"]
      OTel --> Alloy["Alloy"]
      Alloy --> Loki["Loki"]
      Alloy --> Tempo["Tempo"]
      Alloy --> Mimir["Mimir"]
    end

    subgraph ControlPlane["Control plane (human interaction)"]
      Admin["Admin / Developer"] --> Grafana["Grafana"]
      Grafana --> Loki
      Grafana --> Tempo
      Grafana --> Mimir
    end
```

## 4) OpenTelemetry vs plain logging

OpenTelemetry does not replace logs. It standardizes telemetry production and export.

- Logging only: "something happened" (text/event).
- OTel traces: "where the request went and where it slowed/fail".
- OTel metrics: "how often/how much over time".
- All three together: fast diagnosis instead of guessing.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant O as OTel SDK
    participant Y as Alloy
    participant L as Loki
    participant T as Tempo
    participant M as Mimir
    participant G as Grafana

    C->>A: HTTP request
    A->>A: Write app log (stdout)
    A->>O: Create span + metric
    O->>Y: Export OTLP
    Y->>T: Forward trace
    Y->>M: Forward metric
    Y->>L: Forward logs (from Docker)
    G->>L: Query logs
    G->>T: Query traces
    G->>M: Query metrics
```

## 5) Log journey: from point A to Grafana

```mermaid
sequenceDiagram
    participant API as API Logger
    participant STD as Container stdout
    participant DOC as Docker socket/log stream
    participant ALL as Alloy
    participant LOK as Loki
    participant GRA as Grafana Explore

    API->>STD: Emit structured log line
    STD->>DOC: Persist container log
    DOC->>ALL: Tail log stream
    ALL->>LOK: Push log entry + labels
    GRA->>LOK: Run LogQL query
    LOK-->>GRA: Return matching lines
```

## 6) "How does a log become a metric?"

Short answer: by default, it does not magically become a metric.

There are two valid paths:

1. App emits metrics directly with OTel SDK (recommended baseline).
2. You derive metrics from logs with LogQL queries/recording rules (useful for legacy systems).

```mermaid
flowchart LR
    A["API Event"] --> B["Log line"]
    A --> C["OTel metric point"]

    B --> D["Loki"]
    D --> E["LogQL metric query / recording rule"]
    E --> F["Metric series"]

    C --> G["Alloy"]
    G --> H["Mimir"]
    F --> H
```

## 7) Grafana screen map (quick orientation)

```mermaid
flowchart TB
    Home["Grafana Home"] --> Explore["Explore"]
    Home --> Dash["Dashboards"]
    Home --> Alert["Alerting"]

    Explore --> Logs["Logs (Loki)"]
    Explore --> Traces["Traces (Tempo)"]
    Explore --> Metrics["Metrics (Mimir/PromQL)"]

    Dash --> Flight["LGTM Flight Deck"]
    Dash --> Overview["LGTM Demo Overview"]

    Alert --> Rules["Alert Rules"]
    Alert --> Contacts["Contact Points"]
    Alert --> Policy["Notification Policies"]
```

## 8) The 60-second debugging path

When something breaks:

1. Check `Dashboards` for spikes and blast radius.
2. Go to `Explore > Metrics` to confirm error/latency trend.
3. Go to `Explore > Logs` and filter by service + `ERROR`.
4. Jump to `Explore > Traces` for one failing request path.
5. Validate if alert should fire (or why it did not).
