set shell := ["bash", "-cu"]

set dotenv-load := true

compose_file := "docker/compose.yaml"
compose_prod_file := "docker/compose.kvm2.yaml"
env_file := ".env"
local_api_base_url := "http://127.0.0.1:8000"

# Change for your use cases
grafana_domain := env('GRAFANA_DOMAIN', 'grafana.example.com')
api_domain := env('API_DOMAIN', 'api.example.com')
api_base_url := env('API_BASE_URL', 'https://api.example.com')

GRAFANA_USER := env('GRAFANA_USER', 'admin')
GRAFANA_PASSWD := env('GRAFANA_PASSWD', 'admin')

# List all just recipes
[group('just')]
@list:
  just -l

# Alias to `docker ...`
[group('docker')]
docker *ARGS:
  docker {{ ARGS }}

# Alias to `docker compose ...`
[group('docker')]
compose *ARGS:
  just docker compose -f {{ compose_file }} --env-file {{ env_file }} {{ ARGS }}

# Alias to `docker compose down`
[group('docker')]
down *ARGS:
  just compose down {{ ARGS }}

# 🚨 DELETE ALL THINGS DOCKER
[group('🚨 danger')]
nukeall: down
  @-just docker stop $(docker ps -a -q) > /dev/null 2>&1 || true
  @-just docker rm $(docker ps -a -q) > /dev/null 2>&1 || true

  @-just docker volume rm $(docker volume ls -q) > /dev/null 2>&1 || true
  @-just docker network rm $(docker network ls -q) > /dev/null 2>&1 || true

  @-just docker system prune -f > /dev/null 2>&1 || true
  @-just docker volume prune -f > /dev/null 2>&1 || true
  @-just docker builder prune -f > /dev/null 2>&1 || true
  @-just docker network prune -f > /dev/null 2>&1 || true

  @-just docker builder history rm --all > /dev/null 2>&1 || true


# Run prettier or ruff to format files
[group('format')]
format *ARGS:
  just prettierfmt {{ ARGS }}
  just rufffmt {{ ARGS }}

# Run prettier to format files
[group('format')]
prettierfmt *ARGS:
  prettier --write --config ./.prettierrc.json {{ ARGS }}

# Run prettier to format files
[group('format')]
prettiercheck *ARGS:
  prettier --check --config ./.prettierrc.json {{ ARGS }}

# Run ruff to format python files
[group('format')]
rufffmt *ARGS:
  ruff format {{ ARGS }}

# Run ruff to format python files
[group('format')]
ruffcheck *ARGS:
  ruff check {{ ARGS }}

# 🔉 Terminal TTS: uses Kokoro to speak in terminal (English only)
[group('misc')]
say *ARGS:
  #!/bin/bash
  echo "{{ ARGS }}" | ~/Desktop/tutoriais_e_cursos/loudterm/.venv/bin/python ~/Desktop/tutoriais_e_cursos/loudterm/src/loudterm/backend/kokoro82m/cliplay.py -i -

# 🔉 Terminal TTS: uses Kokoro to speak in terminal (PT-BR only)
[group('misc')]
say-pt *ARGS:
  #!/bin/bash
  echo "{{ ARGS }}" | ~/Desktop/tutoriais_e_cursos/loudterm/.venv/bin/python ~/Desktop/tutoriais_e_cursos/loudterm/src/loudterm/backend/kokoro82m/cliplay.py -v pm_alex -l p -i -

# Dev: Start the full LGTM stack with the demo API
[group('stack')]
up *ARGS:
  just compose up -d --build {{ ARGS }}

# Stop and remove containers, network, and anonymous volumes
[group('stack')]
stop *ARGS:
  just compose down {{ ARGS }}

# Restart one or more services
[group('stack')]
restart *ARGS:
  just compose restart {{ ARGS }}

# Show current stack status
[group('stack')]
ps:
  just compose ps

# Follow service logs (example: `just logs api alloy`)
[group('stack')]
logs *ARGS:
  just compose logs -f --tail 100 {{ ARGS }}

# Quick API smoke test for demo flow
[group('demo')]
smoke:
  curl -fsS {{ local_api_base_url }}/health
  curl -fsS "{{ local_api_base_url }}/scenario?mode=warn"
  curl -fsS "{{ local_api_base_url }}/scenario?mode=slow&delay_ms=200"
  curl -fsS "{{ local_api_base_url }}/scenario?mode=error" || true

# Internal: verify that the target API is responding before traffic generation.
[private]
_require-api-health base_url:
  #!/usr/bin/env bash
  curl -fsS "{{ base_url }}/health" > /dev/null || {
    echo "API healthcheck failed at {{ base_url }}/health. Check the target URL and your deploy."
    exit 1
  }

# Internal: hit the random unstable endpoint repeatedly.
[private]
_traffic-random base_url rounds sleep_seconds:
  #!/usr/bin/env bash
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c 'curl -fsS "{{ base_url }}/unstable" > /dev/null 2>&1 || true; sleep {{ sleep_seconds }}'

# Internal: send a deterministic ok/warn/slow/error scenario cycle.
[private]
_traffic-scenarios base_url rounds sleep_seconds:
  #!/usr/bin/env bash
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c 'curl -fsS "{{ base_url }}/scenario?mode=ok" > /dev/null 2>&1 || true; curl -fsS "{{ base_url }}/scenario?mode=warn" > /dev/null 2>&1 || true; curl -fsS "{{ base_url }}/scenario?mode=slow&delay_ms=600" > /dev/null 2>&1 || true; curl -fsS "{{ base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; sleep {{ sleep_seconds }}'

# Internal: send concentrated errors and slow requests to trip alerts.
[private]
_traffic-chaos base_url rounds sleep_seconds:
  #!/usr/bin/env bash
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c '\
    curl -fsS "{{ base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "{{ base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "{{ base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "{{ base_url }}/scenario?mode=slow&delay_ms=2000" > /dev/null 2>&1 || true; \
    sleep {{ sleep_seconds }}'

# Internal: send only healthy traffic to help alerts recover.
[private]
_traffic-calm base_url rounds sleep_seconds:
  #!/usr/bin/env bash
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c '\
    curl -fsS "{{ base_url }}/scenario?mode=ok" > /dev/null 2>&1 || true; \
    sleep {{ sleep_seconds }}'

# Generate random unstable traffic via `/unstable` for dashboard activity.
[group('demo')]
traffic rounds="30" sleep_seconds="0.2":
  just _require-api-health {{ local_api_base_url }}
  just _traffic-random {{ local_api_base_url }} {{ rounds }} {{ sleep_seconds }}

# Generate a deterministic ok/warn/slow/error traffic cycle.
[group('demo')]
traffic-scenarios rounds="10" sleep_seconds="0.2":
  just _require-api-health {{ local_api_base_url }}
  just _traffic-scenarios {{ local_api_base_url }} {{ rounds }} {{ sleep_seconds }}

# Verify collector ingestion counters from Alloy
[group('o11y')]
o11ycheck:
  curl -fsS http://127.0.0.1:12345/metrics | rg "otelcol_receiver_accepted_(metric_points|spans)_total|otelcol_exporter_sent_spans_total|otelcol_exporter_send_failed_spans_total"

# Load demo alert rules into Mimir ruler storage
[group('o11y')]
rules-load namespace="demo" file="docker/mimir-rules/demo-api.yaml":
  curl -fsS -X POST "http://127.0.0.1:9009/prometheus/config/v1/rules/{{ namespace }}" --data-binary "@{{ file }}"

# Show configured Mimir rule groups
[group('o11y')]
rules-list:
  curl -fsS http://127.0.0.1:9009/prometheus/config/v1/rules

# Show evaluated rule state from Mimir ruler
[group('o11y')]
rules-state:
  curl -fsS http://127.0.0.1:9009/prometheus/api/v1/rules

# End-to-end alert demo: load rules and run alert-firing traffic.
[group('o11y')]
alert-demo rounds="30" sleep_seconds="0.2":
  just rules-load
  just chaos {{ rounds }} {{ sleep_seconds }}
  just rules-state

# Show Grafana datasources to confirm provisioning
[group('o11y')]
datasources:
  curl -fsS -u $GRAFANA_USER:$GRAFANA_PASSWD http://127.0.0.1:3000/api/datasources

# End-to-end local workflow for quick validation
[group('o11y')]
demo-ready:
  just up
  just smoke
  just traffic-scenarios 10 0.1
  just o11ycheck


################################################################################
# PRODUCTION RECIPES
################################################################################

# Prod: Alias to `docker compose ...`
[group('prod')]
compose-prod *ARGS:
  just docker compose -f {{ compose_prod_file }} --env-file {{ env_file }} {{ ARGS }}

# Prod: Start the full LGTM stack with the demo API
[group('prod')]
deploy *ARGS:
  just compose-prod up -d --build {{ ARGS }}

# Prod: Load demo alert rules into the internal Mimir ruler on the VPS.
[group('prod')]
rules-load-prod namespace="demo" file="docker/mimir-rules/demo-api.yaml":
  #!/usr/bin/env bash
  mimir_ip=$(docker inspect -f '{{"{{"}}range .NetworkSettings.Networks{{"}}"}}{{"{{"}}.IPAddress{{"}}"}}{{"{{"}}end{{"}}"}}' mimir)
  curl -fsS -X POST "http://${mimir_ip}:9009/prometheus/config/v1/rules/{{ namespace }}" --data-binary "@{{ file }}"

# Prod: Show configured Mimir rule groups from inside the Docker network.
[group('prod')]
rules-list-prod:
  #!/usr/bin/env bash
  mimir_ip=$(docker inspect -f '{{"{{"}}range .NetworkSettings.Networks{{"}}"}}{{"{{"}}.IPAddress{{"}}"}}{{"{{"}}end{{"}}"}}' mimir)
  curl -fsS "http://${mimir_ip}:9009/prometheus/config/v1/rules"

# Prod: Show evaluated rule state from the internal Mimir ruler on the VPS.
[group('prod')]
rules-state-prod:
  #!/usr/bin/env bash
  mimir_ip=$(docker inspect -f '{{"{{"}}range .NetworkSettings.Networks{{"}}"}}{{"{{"}}.IPAddress{{"}}"}}{{"{{"}}end{{"}}"}}' mimir)
  curl -fsS "http://${mimir_ip}:9009/prometheus/api/v1/rules"

# Prod: End-to-end alert demo on the VPS.
[group('prod')]
alert-demo-prod rounds="30" sleep_seconds="0.2":
  just rules-load-prod
  just chaos-prod {{ rounds }} {{ sleep_seconds }}
  just rules-state-prod

# Prod: Generate random unstable traffic via `/unstable`.
[group('prod')]
traffic-prod rounds="30" sleep_seconds="0.2":
  just _require-api-health {{ api_base_url }}
  just _traffic-random {{ api_base_url }} {{ rounds }} {{ sleep_seconds }}

# Prod: Generate a deterministic ok/warn/slow/error traffic cycle.
[group('prod')]
traffic-scenarios-prod rounds="10" sleep_seconds="0.2":
  just _require-api-health {{ api_base_url }}
  just _traffic-scenarios {{ api_base_url }} {{ rounds }} {{ sleep_seconds }}

# 🔥 Trigger alert demo: flood errors + slow requests to fire both alerts.
[group('demo')]
chaos rounds="90" sleep_seconds="0.1":
  #!/bin/bash
  echo "🔥 Chaos mode: sending errors + slow requests for ~{{ rounds }}s..."
  echo "   Watch Grafana Alerting — alerts should fire within ~60s."
  just _require-api-health {{ local_api_base_url }}
  just _traffic-chaos {{ local_api_base_url }} {{ rounds }} {{ sleep_seconds }}
  echo "✅ Done. Alerts should be firing now."

# 🔥 Prod: Trigger alert demo traffic on the VPS.
[group('prod')]
chaos-prod rounds="90" sleep_seconds="0.1":
  #!/bin/bash
  echo "🔥 Chaos mode (prod): sending errors + slow requests..."
  just _require-api-health {{ api_base_url }}
  just _traffic-chaos {{ api_base_url }} {{ rounds }} {{ sleep_seconds }}
  echo "✅ Done. Check Grafana Alerting."

# 🕊️ Send only healthy traffic to help alerts recover.
[group('demo')]
calm rounds="60" sleep_seconds="0.1":
  #!/bin/bash
  echo "🕊️ Calm mode: sending only healthy requests..."
  just _require-api-health {{ local_api_base_url }}
  just _traffic-calm {{ local_api_base_url }} {{ rounds }} {{ sleep_seconds }}
  echo "✅ Done. Alerts should resolve soon."

# 🕊️ Prod: Send only healthy traffic to help alerts recover on the VPS.
[group('prod')]
calm-prod rounds="60" sleep_seconds="0.1":
  #!/bin/bash
  echo "🕊️ Calm mode (prod): sending only healthy requests..."
  just _require-api-health {{ api_base_url }}
  just _traffic-calm {{ api_base_url }} {{ rounds }} {{ sleep_seconds }}
  echo "✅ Done. Alerts should resolve soon."
