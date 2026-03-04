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
uv run uvicorn api.main:app --reload
```

## Tests

```bash
uv run pytest
```
