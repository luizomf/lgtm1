set shell := ["bash", "-cu"]

set dotenv-load := true

compose_file := "docker/compose.yaml"
compose_prod_file := "docker/compose.kvm2.yaml"
env_file := ".env"

grafana_domain := env('GRAFANA_DOMAIN', 'grafana.example.com')
api_domain := env('API_DOMAIN', 'api.example.com')
api_base_url := env('API_BASE_URL', 'https://api.example.com')

GRAFANA_USER := env('GRAFANA_USER', 'admin')
GRAFANA_PASSWD := env('GRAFANA_PASSWD', 'admin')

# List all just recipes
[group('just')]
@list:
  just -l
  echo $OLLAMA_KEEP_ALIVE

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
  just compose down

# 🚨 DELETE ALL THINGS DOCKER
[group('🚨 danger')]
nukeall: down
  @-just docker stop $(docker ps -a -q) > /dev/null 2>&1 || true
  @-just docker rm $(docker ps -a -q) > /dev/null 2>&1 || true

  @-just docker volume $(docker volume ls -q) > /dev/null 2>&1 || true
  @-just docker network $(docker network ls -q) > /dev/null 2>&1 || true

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
  curl -fsS http://127.0.0.1:8000/health
  curl -fsS "http://127.0.0.1:8000/scenario?mode=warn"
  curl -fsS "http://127.0.0.1:8000/scenario?mode=slow&delay_ms=200"
  curl -fsS "http://127.0.0.1:8000/scenario?mode=error" || true

# Generate mixed request traffic for dashboards
[group('demo')]
traffic rounds="30" sleep_seconds="0.2":
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c 'curl -fsS "http://127.0.0.1:8000/unstable" > /dev/null 2>&1 || true; sleep {{ sleep_seconds }}'

# Generate deterministic scenario traffic
[group('demo')]
traffic-scenarios rounds="10" sleep_seconds="0.2":
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c 'curl -fsS "http://127.0.0.1:8000/scenario?mode=ok" > /dev/null 2>&1 || true; curl -fsS "http://127.0.0.1:8000/scenario?mode=warn" > /dev/null 2>&1 || true; curl -fsS "http://127.0.0.1:8000/scenario?mode=slow&delay_ms=600" > /dev/null 2>&1 || true; curl -fsS "http://127.0.0.1:8000/scenario?mode=error" > /dev/null 2>&1 || true; sleep {{ sleep_seconds }}'

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

# End-to-end alert demo: load rules and generate traffic that should fire alerts
[group('o11y')]
alert-demo rounds="30" sleep_seconds="0.2":
  just rules-load
  just traffic-scenarios {{ rounds }} {{ sleep_seconds }}
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

# Generate mixed request traffic for dashboards
[group('prod')]
traffic-prod rounds="30" sleep_seconds="0.2":
  #!/bin/bash
  curl -fsS "{{ api_base_url }}/health" > /dev/null || { echo "API healthcheck failed at {{ api_base_url }}/health. Check API_BASE_URL and your deploy."; exit 1; }
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c 'curl -fsS "{{ api_base_url }}/unstable" > /dev/null 2>&1 || true; sleep {{ sleep_seconds }}'

# Generate deterministic scenario traffic
[group('prod')]
traffic-scenarios-prod rounds="10" sleep_seconds="0.2":
  #!/bin/bash
  curl -fsS "{{ api_base_url }}/health" > /dev/null || { echo "API healthcheck failed at {{ api_base_url }}/health. Check API_BASE_URL and your deploy."; exit 1; }
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c 'curl -fsS "{{ api_base_url }}/scenario?mode=ok" > /dev/null 2>&1 || true; curl -fsS "{{ api_base_url }}/scenario?mode=warn" > /dev/null 2>&1 || true; curl -fsS "{{ api_base_url }}/scenario?mode=slow&delay_ms=600" > /dev/null 2>&1 || true; curl -fsS "{{ api_base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; sleep {{ sleep_seconds }}'

# 🔥 Trigger alert demo: flood errors + slow requests to fire both alerts
[group('demo')]
chaos rounds="90" sleep_seconds="0.1":
  #!/bin/bash
  echo "🔥 Chaos mode: sending errors + slow requests for ~{{ rounds }}s..."
  echo "   Watch Grafana Alerting — alerts should fire within ~60s."
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c '\
    curl -fsS "http://127.0.0.1:8000/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "http://127.0.0.1:8000/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "http://127.0.0.1:8000/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "http://127.0.0.1:8000/scenario?mode=slow&delay_ms=2000" > /dev/null 2>&1 || true; \
    sleep {{ sleep_seconds }}'
  echo "✅ Done. Alerts should be firing now."

# 🔥 Prod: Trigger alert demo on VPS
[group('prod')]
chaos-prod rounds="90" sleep_seconds="0.1":
  #!/bin/bash
  curl -fsS "{{ api_base_url }}/health" > /dev/null || { echo "API healthcheck failed at {{ api_base_url }}/health. Check API_BASE_URL and your deploy."; exit 1; }
  echo "🔥 Chaos mode (prod): sending errors + slow requests..."
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c '\
    curl -fsS "{{ api_base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "{{ api_base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "{{ api_base_url }}/scenario?mode=error" > /dev/null 2>&1 || true; \
    curl -fsS "{{ api_base_url }}/scenario?mode=slow&delay_ms=2000" > /dev/null 2>&1 || true; \
    sleep {{ sleep_seconds }}'
  echo "✅ Done. Check Grafana Alerting."

# 🕊️ Send healthy traffic to calm alerts back down
[group('demo')]
calm rounds="60" sleep_seconds="0.1":
  #!/bin/bash
  echo "🕊️ Calm mode: sending only healthy requests..."
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c '\
    curl -fsS "http://127.0.0.1:8000/scenario?mode=ok" > /dev/null 2>&1 || true; \
    sleep {{ sleep_seconds }}'
  echo "✅ Done. Alerts should resolve soon."

# 🕊️ Prod: Send healthy traffic to calm alerts on VPS
[group('prod')]
calm-prod rounds="60" sleep_seconds="0.1":
  #!/bin/bash
  curl -fsS "{{ api_base_url }}/health" > /dev/null || { echo "API healthcheck failed at {{ api_base_url }}/health. Check API_BASE_URL and your deploy."; exit 1; }
  echo "🕊️ Calm mode (prod): sending only healthy requests..."
  seq 1 {{ rounds }} | xargs -I{} -n1 sh -c '\
    curl -fsS "{{ api_base_url }}/scenario?mode=ok" > /dev/null 2>&1 || true; \
    sleep {{ sleep_seconds }}'
  echo "✅ Done. Alerts should resolve soon."
