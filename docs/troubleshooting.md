# Troubleshooting Quick Guide

Use this when something "looks up" but data is missing or behavior is weird.

## 1) Grafana shows "No data"

Check:

```bash
docker compose -f docker/compose.yaml ps
just smoke
```

If smoke fails, fix ingestion first before debugging dashboards.

## 2) Tempo trace drilldown fails

Check Tempo and collector path:

```bash
docker logs docker-tempo-1 --tail 100
docker logs alloy --tail 100
```

Then generate traffic:

```bash
just traffic-scenarios 20 0.1
```

## 3) Loki logs appear but `detected_level` is `unknown`

This is usually log parsing/heuristics in Grafana UI.
Filter explicitly with LogQL:

```bash
{job="docker"} |= "api.presentation.http" |= "ERROR"
```

## 4) Alert rules page fails to load from Mimir

Check rule API and Mimir health:

```bash
just rules-list
docker logs mimir --tail 120
```

If rule path errors, reload demo rules:

```bash
just rules-load
just rules-state
```

## 5) API works but traces are missing

Check OTLP environment and collector endpoint:

```bash
docker inspect docker-api-1 --format '{{json .Config.Env}}' | jq
docker logs alloy --tail 120
```

Verify `OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4317`.

## 6) Public exposure seems wrong on VPS

Check host listeners and published container ports:

```bash
sudo ss -tulpen
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Expected on `kvm2`: public `80/443`, Grafana on `10.100.0.2:3000`, no public `8000/3100/3200/9009`.

## 7) Grafana should be private, but public access works

Check Traefik middleware labels in `docker/compose.kvm2.yaml`:

- `traefik.http.routers.lgtm.middlewares=grafana-allow`
- `traefik.http.middlewares.grafana-allow.ipallowlist.sourcerange=...`

Then recreate:

```bash
docker compose -f docker/compose.kvm2.yaml up -d
```

## 8) HTTPS certificate not issuing

Check DNS, HTTP reachability, and Traefik ACME logs:

```bash
dig +short api.inprod.cloud
dig +short lgtm.inprod.cloud
docker logs traefik --tail 200
```

LE HTTP challenge requires public reachability on port `80`.

## 9) WireGuard is up but Grafana still unreachable

Check WG status and bind address:

```bash
sudo wg show
sudo ss -tulpen | grep 3000
```

Expected: Grafana bound to `10.100.0.2:3000`.

## 10) Fail2ban is inactive after reboot

Check service and jail parse:

```bash
sudo systemctl status fail2ban --no-pager
sudo fail2ban-client status sshd
```

Common cause: invalid `jail.local` syntax (for example broken values or inline formatting).
