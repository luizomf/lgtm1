# LGTM Flight Deck Guide

Use this document while recording or exploring the dashboard for the first time.
It explains what each panel is measuring in plain language and gives you a
short talk track that sounds natural on camera.

Dashboard path in Grafana:

- `Dashboards > LGTM Demo > LGTM Flight Deck`

## Dashboard filters

### Scenario mode

This filter uses the `demo_scenario_mode` label from the API metrics.

- `All` shows every scenario together
- `ok`, `warn`, `slow`, or `error` narrow the dashboard to one behavior

Use it when you want to tell a cleaner story instead of mixing every traffic
type in the same view.

### Log keyword

This is a free-text filter for Loki logs.

Examples:

- `error`
- `slow`
- `trace_id=...`
- `endpoint=/unstable`

Use it to reduce noise in the log panels while keeping the charts visible.

## Top row: volume and average behavior

### Total Requests

What it measures:

- total number of requests in the selected time range

What the query is doing:

- it sums the increase of `demo_api_requests_total` over the active dashboard
  range

How to explain it:

- "This tells me how much traffic the API handled in this time window."
- "It is volume, not speed."

### Request Rate by Status

What it measures:

- current request rate split by scenario status

What the query is doing:

- it calculates requests per second with `rate(...)`
- it groups the result by `demo_scenario_status`

How to explain it:

- "This is where I see the distribution between healthy, warning, slow, and error requests."
- "It tells me what kind of traffic is happening right now, not just how much."

### Average Request Duration (ms)

What it measures:

- average request duration in milliseconds

What the query is doing:

- it divides the total observed duration by the total request count
- this produces the arithmetic average

How to explain it:

- "This panel shows the average latency in milliseconds."
- "It is useful, but I never trust the average alone because a few very slow requests can hide inside it."

## Second row: reliability and failure quality

### Total Exceptions

What it measures:

- total number of error requests in the selected range

What the query is doing:

- it sums the increase of `demo_api_requests_total`
- it filters only `demo_scenario_status="error"`

How to explain it:

- "This is the raw count of failures."
- "It is the size of the damage, not the percentage."

### Healthy Request Ratio

What it measures:

- percentage of healthy requests over time

What the query is doing:

- it divides the rate of non-error requests by the total request rate

How to explain it:

- "This is my success ratio over time."
- "When this drops, the system is still serving traffic, but quality is getting worse."

### Error Request Ratio

What it measures:

- percentage of error requests over time

What the query is doing:

- it divides the error request rate by the total request rate

How to explain it:

- "This is my failure ratio."
- "If this spikes, I know the problem is not isolated anymore."

## Third row: latency tail and throughput

### P99 Request Duration (ms)

What it measures:

- p99 request duration by endpoint in milliseconds

What the query is doing:

- it uses `histogram_quantile(0.99, ...)` over the request duration histogram
- it groups by `demo_endpoint`

Why it matters:

- p99 shows the worst 1% of experiences
- this catches pain that the average can hide

How to explain it:

- "The average can look fine while a small group of users is suffering."
- "p99 tells me what the worst tail looks like."

### Short-Window Request Rate

What it measures:

- very short-window request throughput

What the query is doing:

- it calculates request rate with a `10s` window

How to explain it:

- "This behaves like a near-real-time pulse of the API."
- "It is more nervous and more immediate than the regular requests-per-second chart."

### Request Per Sec

What it measures:

- overall request throughput per second

What the query is doing:

- it calculates request rate with a `1m` window

How to explain it:

- "This is the stable throughput line."
- "It tells me the general rhythm of the API without as much short-term noise."

## Bottom row: logs as evidence

### Log Type Rate

What it measures:

- log volume per severity level over time

What the query is doing:

- it reads logs from Loki
- it parses the log level from the log line
- it turns matching logs into a rate grouped by `level`

How to explain it:

- "This turns logs into something I can graph."
- "Instead of reading one line at a time, I can see whether error logs are spiking."

### Log of All FastAPI App

What it measures:

- the actual application log lines, formatted for reading

What the query is doing:

- it filters FastAPI application logs in Loki
- it parses key/value pairs with `logfmt`
- it reformats the line to show `scenario`, `status`, `http`, `delay_ms`,
  `trace_id`, and `detail`

How to explain it:

- "This is where I stop looking at trends and look at concrete events."
- "The charts tell me that something is wrong; the logs tell me what happened."

## A simple narration flow

If you want a clean recording flow, follow this order:

1. Start with `Total Requests` and `Request Rate by Status` to establish traffic volume.
2. Move to `Healthy Request Ratio` and `Error Request Ratio` to talk about quality.
3. Use `P99 Request Duration (ms)` to explain why averages are not enough.
4. Show `Log Type Rate` to prove the incident is visible in logs too.
5. End in `Log of All FastAPI App` to read one concrete example.

## Short talk tracks

- "Top row is volume and average behavior."
- "Middle row is service quality and failure ratio."
- "Bottom row is operational evidence in logs."
- "Metrics show trend, logs show detail."
- "The dashboard helps me move from symptom to evidence quickly."
