# KVM2 Runbook (Hostinger ad-aligned)

This profile is tuned for `kvm2` (8 GB RAM, 2 vCPU) and keeps the narrative
consistent with the sponsored VPS shown in video.

## Topology

- Public Traefik: `0.0.0.0:80`
- Public API direct fallback: `0.0.0.0:8000`
- Private Grafana: `10.100.0.2:3000` (WireGuard `wg0` only)
- Internal-only services: Loki, Tempo, Mimir, Alloy (no public port publishing)

## Compose profile

Use:

```bash
docker compose -f docker/compose.kvm2.yaml up -d --build
```

Main differences from local profile:

- dedicated persistent volumes for `grafana`, `loki`, `tempo`, `mimir`
- Traefik enabled with Docker provider for HTTP ingress
- Grafana bound to `wg0` IP
- API reachable via Traefik `:80` and directly on `:8000`

## Validation checklist

On `kvm2`:

```bash
curl -fsS http://127.0.0.1/health
curl -fsS http://127.0.0.1:8000/health
ss -ltnp | grep -E '(:80|:8000|:3000)'
docker compose -f /opt/lgtm1/docker/compose.kvm2.yaml ps
```

Expected:

- `:80` listening on `0.0.0.0` (Traefik)
- `:8000` listening on `0.0.0.0`
- `:3000` listening on `10.100.0.2`
- all services `Up`

## Optional alert bootstrap

```bash
mimir_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mimir)
curl -fsS -X POST "http://$mimir_ip:9009/prometheus/config/v1/rules/demo" \
  --data-binary @/opt/lgtm1/docker/mimir-rules/demo-api.yaml
```
