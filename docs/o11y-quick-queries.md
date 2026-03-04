# O11y Quick Queries

Use this as a fast cheat sheet while recording or validating the stack.

## PromQL (Mimir)

### Request rate by status

```promql
sum(rate(demo_api_requests_total[1m])) by (demo_scenario_status)
```

### Error ratio (%)

```promql
100 * sum(rate(demo_api_requests_total{demo_scenario_status="error"}[5m])) / clamp_min(sum(rate(demo_api_requests_total[5m])), 0.0001)
```

### P95 simulated delay (ms)

```promql
histogram_quantile(0.95, sum(rate(demo_api_response_delay_ms_milliseconds_bucket[5m])) by (le))
```

### Total requests by scenario mode

```promql
sum(increase(demo_api_requests_total[30m])) by (demo_scenario_mode)
```

## LogQL (Loki)

### Scenario logs only

```logql
{job="docker"} |= "api.presentation.http"
```

### Error scenarios only

```logql
{job="docker"} |= "api.presentation.http" |= "scenario=error"
```

### Slow scenarios only

```logql
{job="docker"} |= "api.presentation.http" |= "scenario=slow"
```

### Count error logs over time

```logql
sum(count_over_time({job="docker"} |= "api.presentation.http" |= "scenario=error" [5m]))
```

## TraceQL (Tempo)

Go to Explore, choose `Tempo`, then run:

### All API traces

```traceql
{ resource.service.name = "lgtm-demo-api" }
```

### Slow traces

```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.scenario.status = "slow" }
```

### Error traces

```traceql
{ resource.service.name = "lgtm-demo-api" && span.demo.scenario.status = "error" }
```

## Traffic commands (Justfile)

Use these to generate data quickly before opening dashboards:

```bash
just smoke
just traffic 50 0.1
just traffic-scenarios 20 0.1
just o11ycheck
```

## Talk track in one line

"We are not looking at random charts. We are validating behavior: request volume, error ratio, latency distribution, logs with scenario context, and traces for request-level causality."
