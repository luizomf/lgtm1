# O11y Quick Queries

Cheat sheet of ready-to-paste queries for Grafana Explore. Each section covers
one of the three query languages: **PromQL** (metrics), **LogQL** (logs), and
**TraceQL** (traces).

> **Where to run these:** In Grafana, go to **Explore** (compass icon on the
> left sidebar), pick the datasource (Mimir, Loki, or Tempo), paste the query,
> and hit **Run query**.

---

## PromQL (Mimir) — metrics

PromQL is the query language for Prometheus-compatible backends like Mimir. It
works with numeric time series: counters that go up, gauges that go up and down,
and histograms that track distributions.

Key concepts used below:

- **`rate(counter[window])`** — how fast a counter grows per second over a time
  window. A counter only goes up (e.g., total requests), so `rate` turns it into
  a useful "requests per second" number.
- **`increase(counter[window])`** — similar to `rate`, but gives you the total
  increase (absolute count) over the window instead of per-second.
- **`sum(...) by (label)`** — aggregate multiple series into one, grouped by a
  label. Like a SQL `GROUP BY`.
- **`histogram_quantile(q, ...)`** — given a histogram, returns the value at
  quantile `q`. For example, `0.95` means "the value that 95% of observations
  fall below" (a.k.a. **p95**).
- **`clamp_min(value, min)`** — if `value` is below `min`, return `min` instead.
  Used to avoid division by zero.

### Request rate by status

How many requests per second is the API handling right now, broken down by
outcome (ok, degraded, error, slow)?

```promql
sum(rate(demo_api_requests_total[1m])) by (demo_scenario_status)
```

### Error ratio (%)

What percentage of all requests are errors? If this is above 10% for 30 seconds,
the `DemoApiHighErrorRatio` alert fires.

```promql
100
  * sum(rate(demo_api_requests_total{demo_scenario_status="error"}[5m]))
  / clamp_min(sum(rate(demo_api_requests_total[5m])), 0.0001)
```

### P50 response delay (ms) — the median

Half of the requests were faster than this value, half were slower. This is the
"typical" experience most users have.

```promql
histogram_quantile(0.50, sum(rate(demo_api_response_delay_ms_milliseconds_bucket[5m])) by (le))
```

### P95 response delay (ms) — the slow tail

95% of requests were faster than this value. The remaining 5% were slower. If
this number is high, some users are having a bad time even if the average looks
fine. The `DemoApiHighLatency` alert fires when p95 exceeds 1000 ms.

```promql
histogram_quantile(0.95, sum(rate(demo_api_response_delay_ms_milliseconds_bucket[5m])) by (le))
```

### P99 response delay (ms) — the worst tail

99% of requests were faster than this. This catches the absolute worst
experiences. Useful when you need to guarantee SLAs.

```promql
histogram_quantile(0.99, sum(rate(demo_api_response_delay_ms_milliseconds_bucket[5m])) by (le))
```

### Total requests by scenario mode (last 30 min)

How many times each scenario was triggered in the last 30 minutes. Good for
getting an overview after running traffic recipes.

```promql
sum(increase(demo_api_requests_total[30m])) by (demo_scenario_mode)
```

### Requests per second (total throughput)

Overall throughput of the API, regardless of status. If this drops to zero,
something is very wrong.

```promql
sum(rate(demo_api_requests_total[1m]))
```

### Error vs success rate side by side

Use this in a Grafana panel with two queries (A and B) to see the contrast:

**Query A — success rate:**

```promql
sum(rate(demo_api_requests_total{demo_scenario_status!="error"}[5m]))
```

**Query B — error rate:**

```promql
sum(rate(demo_api_requests_total{demo_scenario_status="error"}[5m]))
```

### Host CPU used (%)

How much CPU the VPS is using. The node-exporter tracks time spent in each CPU
mode; we subtract idle time from 100%.

```promql
100 * (1 - avg(rate(node_cpu_seconds_total{job="node-exporter", mode="idle"}[5m])))
```

### Host memory used (%)

How much RAM is in use. `MemAvailable` is what the OS considers free (including
cache that can be reclaimed).

```promql
100 * (1 - (
  node_memory_MemAvailable_bytes{job="node-exporter"}
  / node_memory_MemTotal_bytes{job="node-exporter"}
))
```

### Host disk used (%)

Percentage of disk space consumed, excluding virtual filesystems (tmpfs, overlay,
etc.).

```promql
100 * (1 - (
  sum(node_filesystem_avail_bytes{job="node-exporter", fstype!~"tmpfs|overlay|squashfs|ramfs"})
  / sum(node_filesystem_size_bytes{job="node-exporter", fstype!~"tmpfs|overlay|squashfs|ramfs"})
))
```

### Host network throughput (B/s)

Total bytes per second flowing in and out, excluding loopback and Docker virtual
interfaces.

```promql
sum(rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|docker.*|veth.*|br-.*"}[5m]))
  + sum(rate(node_network_transmit_bytes_total{job="node-exporter", device!~"lo|docker.*|veth.*|br-.*"}[5m]))
```

---

## LogQL (Loki) — logs

LogQL is the query language for Loki. It starts with a **log stream selector**
(which containers/jobs to look at) and then applies **filters** and
**transformations** via pipes (`|`).

Key concepts used below:

- **`{job="docker"}`** — select all logs collected from Docker containers.
- **`|= "text"`** — keep only lines that contain this text (like grep).
- **`!= "text"`** — drop lines that contain this text.
- **`| logfmt`** — parse key=value structured logs into searchable fields.
- **`| line_format`** — reformat the log line for display.
- **`count_over_time({...}[window])`** — count how many log lines match in a
  time window. Turns logs into a metric you can graph.
- **`rate({...}[window])`** — same as count_over_time but divided by the window
  duration, giving you lines per second.

### All scenario logs

Every log line emitted by the API when a scenario endpoint is hit. This is the
starting point for investigation.

```logql
{job="docker"} |= "api.presentation.http"
```

### Error scenarios only

Only the error scenarios. Useful when an alert fires and you want to see what
happened.

```logql
{job="docker"} |= "api.presentation.http" |= "scenario=error"
```

### Slow scenarios only

```logql
{job="docker"} |= "api.presentation.http" |= "scenario=slow"
```

### Warning scenarios only

```logql
{job="docker"} |= "api.presentation.http" |= "scenario=warn"
```

### Pretty-printed scenario logs

Parse the structured key=value pairs and reformat the line for easier reading.
Great for live demos.

```logql
{job="docker"}
  |= "api.presentation.http"
  | logfmt
  | line_format "{{.scenario}} [{{.http_status}}] delay={{.delay_ms}}ms trace={{.trace_id}}"
```

### Error log rate (lines/sec)

How many error log lines per second. Useful as a Grafana panel to see error
spikes visually.

```logql
rate({job="docker"} |= "api.presentation.http" |= "scenario=error" [1m])
```

### Count errors in the last 5 minutes

A single number: how many error log lines were produced in the last 5 minutes.

```logql
sum(count_over_time({job="docker"} |= "api.presentation.http" |= "scenario=error" [5m]))
```

### Log volume by severity

Graph showing how many log lines per second at each severity level (info,
warning, error). Lets you spot anomalies in log patterns.

```logql
sum by (detected_level) (rate({job="docker"} |= "api.presentation.http" [1m]))
```

### Exclude noisy logs

If health check logs are cluttering the view, filter them out:

```logql
{job="docker"} |= "api.presentation.http" != "health"
```

---

## TraceQL (Tempo) — traces

TraceQL is the query language for Tempo. A **trace** is the full journey of a
request through the system. Each trace is made of **spans** (individual
operations). Our API creates one span per HTTP request and enriches it with
custom attributes like `demo.scenario.mode`.

Key concepts used below:

- **`resource.service.name`** — which service produced the trace.
- **`span.attribute`** — a custom attribute attached to a span. Our API adds
  `demo.endpoint`, `demo.scenario.mode`, `demo.scenario.status`, and
  `demo.scenario.delay_ms`.
- **`duration`** — how long the span took. Supports comparisons like `> 500ms`.
- **`status`** — the span status (ok, error, unset).

> **Where:** Grafana > Explore > Tempo. After running a TraceQL query, click
> any trace ID to see the full waterfall view with all spans.

### All API traces

Every trace produced by the demo API.

```traceql
{ resource.service.name = "lgtm-demo-api" }
```

### Error traces

Only traces where the scenario status was "error". Click one to see the full
span details and correlate with the log that was emitted at the same time.

```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.scenario.status = "error" }
```

### Slow traces

Traces where the scenario injected artificial delay.

```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.scenario.status = "slow" }
```

### Traces slower than 500ms

Find any trace that actually took more than 500ms, regardless of scenario mode.
This catches real slowness, not just simulated delays.

```traceql
{ resource.service.name = "lgtm-demo-api" && duration > 500ms }
```

### Traces slower than 1 second

The really slow ones. If the `DemoApiHighLatency` alert is firing, these traces
show you exactly which requests were slow.

```traceql
{ resource.service.name = "lgtm-demo-api" && duration > 1s }
```

### Traces for a specific endpoint

Filter traces by the endpoint that was hit:

```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.endpoint = "/unstable" }
```

### Traces with high delay injection

Find traces where the injected delay was above 1000ms:

```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.scenario.delay_ms > 1000 }
```

---

## Correlating signals

The real power of observability is crossing data between the three pillars.
Here's how to navigate between them in Grafana:

1. **Metric to Log:** You see a spike in the error ratio (PromQL). Switch to
   Loki Explore and filter by `scenario=error` around that timestamp to read the
   actual error messages.

2. **Log to Trace:** Each log line includes `trace_id=...`. Copy that ID, switch
   to Tempo Explore, and paste it in the search bar to see the full trace
   waterfall.

3. **Trace to Log:** In the trace waterfall view, look at the `trace_id` and
   `span_id` attributes. Search Loki for that trace_id to find the corresponding
   log line with full context.

4. **Alert to Root Cause:** An alert fires (e.g., high error ratio). Check the
   PromQL expression to confirm. Switch to Loki to see the error logs. Grab a
   trace_id from a log line. Open it in Tempo to see exactly where the failure
   happened in the request lifecycle.

---

## Traffic recipes (Justfile)

Generate data before exploring dashboards:

```bash
just smoke                          # Quick health check
just traffic 50 0.1                 # 50 rounds of random traffic
just traffic-scenarios 20 0.1       # Deterministic: ok + warn + slow + error
just chaos                          # 🔥 Flood errors + slow (fires alerts)
just calm                           # 🕊️ Healthy traffic (resolves alerts)
just o11ycheck                      # Verify Alloy is ingesting data
just rules-load                     # Load alert rules into Mimir
just rules-state                    # Check current alert state
```

---

## Quick reference: what is p50, p95, p99?

Percentiles tell you the experience of your users at different points of the
distribution:

| Percentile | Meaning | Use case |
| --- | --- | --- |
| **p50** (median) | 50% of requests were faster than this | The "typical" user experience |
| **p95** | 95% were faster, 5% were slower | Catches the "slow tail" that averages hide |
| **p99** | 99% were faster, 1% were slower | Worst-case guarantee, used for SLAs |

**Why not just use the average?** Because averages lie. If 99 requests take 10ms
and 1 request takes 10 seconds, the average is 109ms — looks fine. But p99 is
10 seconds — one user is suffering. Percentiles expose what averages hide.
