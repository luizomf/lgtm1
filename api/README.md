# API

Small FastAPI service used to generate realistic application behavior for the LGTM demo.

## Endpoints

- `GET /` describes the API surface.
- `GET /health` returns a stable success response.
- `GET /unstable` emits random `ok`, `warn`, `error`, or `slow` behavior.
- `GET /scenario?mode=ok|warn|error|slow|random` forces a specific demo path.
- `GET /scenario?mode=slow&delay_ms=1500` simulates latency on demand.

## Local development

```bash
uv sync --all-groups
uv run uvicorn api.main:create_app --factory --reload
```

## Docker

```bash
docker build -t lgtm-demo-api .
docker run --rm -p 8000:8000 lgtm-demo-api
```

The root Compose stack also exposes this service on port `8000`.

## Telemetry

This service exports traces and metrics through OTLP gRPC.

- Default local collector endpoint: `http://127.0.0.1:4317`
- Compose collector endpoint: `http://alloy:4317`
- Service name: `lgtm-demo-api`

Logs stay on standard output so Docker and Alloy can ship them to Loki.

## Tests

```bash
uv run pytest
```
