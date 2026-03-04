# Grafana Click Paths (Narration Guide)

Use this while recording to explain intent, not implementation details.

## 1) Health check of the stack

1. Open Grafana Home.
2. Go to `Connections > Data sources`.
3. Confirm `Mimir`, `Loki`, and `Tempo` are green.

Talk track:
"Before reading charts, we confirm if the signal pipelines are alive."

## 2) Dashboard story (high-level behavior)

1. Go to `Dashboards`.
2. Open `LGTM Demo Overview`.
3. Focus on:
- request rate by status
- error ratio
- response delay histogram

Talk track:
"This is behavior-level monitoring. We are checking reliability trends, not random numbers."

## 3) Logs investigation (Loki)

1. Go to `Explore`.
2. Select data source `Loki`.
3. Run query:
```logql
{job="docker"} |= "api.presentation.http" |= "scenario=error"
```

Talk track:
"Logs answer what happened and which request path produced the symptom."

## 4) Trace investigation (Tempo)

1. Go to `Explore`.
2. Select data source `Tempo`.
3. Run query:
```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.scenario.status = "slow" }
```
4. Open one trace and inspect span duration.

Talk track:
"Traces answer where time was spent inside a single request."

## 5) Alerting flow (Mimir ruler)

1. Ensure rules are loaded:
```bash
just rules-load
just alert-demo 30 0.1
```
2. Go to `Alerting > Alert rules`.
3. Filter by `Data source-managed` if needed.
4. Find `DemoApiHighErrorRatio`.
5. Watch state transition from `Normal` to `Pending` to `Firing`.

Talk track:
"Alerting is our early warning layer. It converts behavior degradation into an operational signal."

## 6) Vocabulary that sounds natural on camera

- "signal quality"
- "request-level causality"
- "failure pattern"
- "latency budget"
- "from symptom to root cause"
