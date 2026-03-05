# LGTM Demo Stack

This repository is a local-first observability base built around the LGTM stack:

- `Loki` for logs
- `Grafana` for visualization
- `Tempo` for traces
- `Mimir` for metrics
- `Alloy` as the collector and router
- `FastAPI` as the demo application that emits useful signals on purpose

## Why this exists

The goal is not just to "run Grafana". The goal is to have a small application that
can behave like a real system under stress so we can explain why observability
matters, not only how to install tools.

## Signal flow

### Logs

The API writes logs to standard output. Docker exposes those logs, Alloy tails them
from the Docker socket, and Alloy forwards them to Loki.

`api -> stdout -> Docker -> Alloy -> Loki -> Grafana`

### Metrics

The API emits OpenTelemetry metrics and Alloy also scrapes container + host metrics
through cAdvisor and node_exporter. Alloy forwards all streams to Mimir.

`api -> OTLP -> Alloy -> Mimir -> Grafana`

`containers -> cAdvisor -> Alloy -> Mimir -> Grafana`

`host (CPU/RAM/Disk/Network) -> node_exporter -> Alloy -> Mimir -> Grafana`

### Traces

The API emits OpenTelemetry traces to Alloy through OTLP gRPC. Alloy forwards those
traces to Tempo.

`api -> OTLP -> Alloy -> Tempo -> Grafana`

## Local startup

```bash
docker compose -f docker/compose.yaml up -d --build
```

Or use the shortcuts:

```bash
just up
just smoke
just traffic-scenarios 20 0.1
just alert-demo 30 0.1
```

## Useful endpoints

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Grafana: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Alloy admin/metrics: [http://127.0.0.1:12345](http://127.0.0.1:12345)

## Demo routes

- `GET /health`
- `GET /unstable`
- `GET /scenario?mode=ok`
- `GET /scenario?mode=warn`
- `GET /scenario?mode=error`
- `GET /scenario?mode=slow&delay_ms=1500`

## Grafana login

- User: `admin`
- Password: `admin`

Datasources for `Mimir`, `Loki`, and `Tempo` are provisioned automatically at startup.
The `LGTM Demo Overview`, `LGTM Flight Deck`, and `VPS Health` dashboards are also provisioned automatically.

## Demo alert rule

Load and validate the demo alert rule stored in `docker/mimir-rules/demo-api.yaml`:

```bash
just rules-load
just rules-list
just rules-state
```

To force traffic and watch state transitions in Grafana Alerting:

```bash
just alert-demo 30 0.1
```

## Public vs private exposure (kvm2 profile)

| Surface | Address/port | Visibility | Why |
| --- | --- | --- | --- |
| Traefik HTTP | `0.0.0.0:80` | Public | ACME HTTP challenge + redirect to HTTPS |
| Traefik HTTPS | `0.0.0.0:443` | Public | Public ingress for API |
| API app port | `8000` | Internal only | Accessed through Traefik service routing |
| Grafana UI | `10.100.0.2:3000` | Private (WireGuard + allowlist) | Admin surface, not public |
| Node exporter | `9100` | Internal only | Host metrics scraped by Alloy only |
| Loki | `3100` | Internal only | Backend component |
| Tempo | `3200` (service internal) | Internal only | Backend component |
| Mimir | `9009` (service internal) | Internal only | Backend component |
| WireGuard | `51820/udp` | Restricted peers | Private network transport |

## More docs

- [architecture.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/architecture.md)
- [custom-signals.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/custom-signals.md)
- [faq-video.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/faq-video.md)
- [troubleshooting.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/troubleshooting.md)
- [o11y-quick-queries.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/o11y-quick-queries.md)
- [grafana-click-paths.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/grafana-click-paths.md)
- [kvm2-runbook.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/kvm2-runbook.md)
- [security-checklist-kvm2.md](/Users/luizotavio/Desktop/tutoriais_e_cursos/lgtm1/docs/security-checklist-kvm2.md)
