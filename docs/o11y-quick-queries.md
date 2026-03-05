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

### Host CPU used (%)

```promql
100 * (1 - avg(rate(node_cpu_seconds_total{job="node-exporter", mode="idle"}[5m])))
```

### Host memory used (%)

```promql
100 * (1 - (node_memory_MemAvailable_bytes{job="node-exporter"} / node_memory_MemTotal_bytes{job="node-exporter"}))
```

### Host disk used (%)

```promql
100 * (1 - (sum(node_filesystem_avail_bytes{job="node-exporter", fstype!~"tmpfs|overlay|squashfs|ramfs"}) / sum(node_filesystem_size_bytes{job="node-exporter", fstype!~"tmpfs|overlay|squashfs|ramfs"})))
```

### Host network throughput (B/s)

```promql
sum(rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|docker.*|veth.*|br-.*"}[5m])) + sum(rate(node_network_transmit_bytes_total{job="node-exporter", device!~"lo|docker.*|veth.*|br-.*"}[5m]))
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
just rules-load
just rules-state
```

## Alerting check (Mimir ruler)

The demo alert expression is:

```promql
100 * sum(rate(demo_api_requests_total{demo_scenario_status="error"}[5m])) / clamp_min(sum(rate(demo_api_requests_total[5m])), 0.0001) > 10
```

Generate traffic and verify alert state:

```bash
just alert-demo 30 0.1
```

## Talk track in one line

"We are not looking at random charts. We are validating behavior: request volume, error ratio, latency distribution, logs with scenario context, and traces for request-level causality."
