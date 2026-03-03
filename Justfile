set shell := ["bash", "-cu"]
set dotenv-load := true

compose_file := "compose.yaml"
env_file := ".env"

# List all just recipes
[group('just')]
@list:
  just -l

# Alias to `docker ...`
[group('docker')]
_docker *ARGS:
  docker {{ ARGS }}

# Alias to `docker compose ...`
[group('docker')]
compose *ARGS:
  just _docker compose -f {{ compose_file }} --env-file {{ env_file }} {{ ARGS }}

# WIP: 🚨 DELETE ALL THINGS DOCKER
[group('🚨 danger')]
nukeall:
  @-just _docker stop `docker ps -a -q` >/dev/null 2&>1 || true

  @echo "OK"

# curl to post
# post *ARGS:
#   #!/bin/bash
#   curl -X POST http://localhost:3100/loki/api/v1/push \
#     -H "Content-Type: application/json" \
#     -d '{
#       "streams": [
#         {
#           "stream": { "job": "teste", "service": "minha-api" },
#           "values": [
#             ["'"$(date +%s)000000000"'", "Primeiro log no Loki! Funcionou!"]
#           ]
#         }
#       ]
#     }'

