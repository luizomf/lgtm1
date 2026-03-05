# Custom Signals (Metrics + Traces) in this API

This is the shortest path to explain "how to create your own telemetry data"
without turning the video into a coding tutorial.

## Where signals are created in this project

- Telemetry bootstrap: [api/src/api/infrastructure/telemetry.py](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/api/src/api/infrastructure/telemetry.py)
- HTTP scenario flow (where we emit data): [api/src/api/presentation/http.py](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/api/src/api/presentation/http.py)
- App startup (telemetry enabled): [api/src/api/main.py](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/api/src/api/main.py)

## Metrics (what to do)

1. Create instruments once in `_ensure_metrics` (counter/histogram/gauge).
2. Record values in request/business flow (`record_scenario` style).
3. Add useful attributes (`endpoint`, `status`, `mode`) to make filters usable in Grafana.

Minimal example (same pattern already used):

```python
# create once
retries_counter = meter.create_counter(
  name="demo_api_retries_total",
  description="Retry attempts by endpoint.",
  unit="{retry}",
)

# record many times
retries_counter.add(1, attributes={"endpoint": "/checkout", "status": "retry"})
```

## Traces (what to do)

You already get request spans from FastAPI instrumentation.
For custom business steps, create manual spans around important blocks.

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("payment_authorization") as span:
  span.set_attribute("payment.provider", "sandbox")
  # do the business action here
```

In this project, we also enrich the current span with demo attributes via
`annotate_current_span(...)`.

## One-liner for the video

"If you want your own telemetry, this is the pattern: create instruments once,
record metrics at business points, and add manual spans only where the business
step matters."
