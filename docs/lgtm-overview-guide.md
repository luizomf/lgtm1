# LGTM Demo Overview Guide

This is the fastest dashboard to open when you want to explain the basic story
of the demo API without showing too much detail at once.

Dashboard path in Grafana:

- `Dashboards > LGTM Demo > LGTM Demo Overview`

## What this dashboard is for

Use this dashboard when you want to answer four simple questions:

- Is the API receiving traffic?
- Are errors happening?
- Is latency getting worse?
- Do the logs show the same story?

It is the cleanest "first dashboard" in the project.

## Panel-by-panel

### Request Rate by Status

What it measures:

- requests per second grouped by scenario status

What the query is doing:

- it calculates `rate(demo_api_requests_total[1m])`
- it groups the result by `demo_scenario_status`

What that means in practice:

- you can see the API split into `ok`, `warn`, `slow`, and `error`
- if `error` grows, you know failures are becoming part of normal traffic
- if `slow` grows, latency pain is spreading even if everything is not failing

How to explain it:

- "This is my behavior distribution chart."
- "It shows not just traffic volume, but what kind of traffic is happening."

### Error Ratio (%)

What it measures:

- percentage of requests that are errors

What the query is doing:

- it divides the error request rate by the total request rate
- it multiplies the result by `100`

What that means in practice:

- this is the health-quality view of the API
- the absolute number of errors matters less here than the proportion

How to explain it:

- "This tells me how much of my traffic is failing."
- "Five errors can be irrelevant or catastrophic depending on the total volume, so the ratio matters."

### API Delay (ms)

What it measures:

- p50 latency
- p95 latency

What the query is doing:

- one line calculates `p95`
- the other line calculates `p50`
- both come from the histogram metric `demo_api_response_delay_ms`

What that means in practice:

- `p50` is the normal user experience
- `p95` is the slow tail
- if `p95` climbs while `p50` stays calm, a smaller group of users is suffering

How to explain it:

- "The p50 tells me what is typical; the p95 tells me where the bad edge cases start to show up."
- "This is why averages alone are not enough."

### Scenario Logs

What it measures:

- it does not measure a number
- it shows the raw application logs for the scenario flow

What the query is doing:

- it pulls Loki logs matching `api.presentation.http`

What that means in practice:

- this is your evidence panel
- the charts above show trend; this panel shows the actual events behind the trend

How to explain it:

- "Now I can leave the chart and read the event."
- "Metrics tell me there is a problem; logs tell me what happened."

## Suggested recording flow

If you want a simple walkthrough on camera:

1. Start with `Request Rate by Status` to show that the app is alive.
2. Move to `Error Ratio (%)` to show service quality.
3. Open `API Delay (ms)` to explain p50 versus p95.
4. End with `Scenario Logs` to show the evidence underneath the chart.

## Short talk tracks

- "This dashboard is the quickest health story of the API."
- "Traffic, error ratio, latency, then logs."
- "It is the high-level monitoring view before deeper investigation."
