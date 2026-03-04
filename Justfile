set shell := ["bash", "-cu"]
set dotenv-load := true

compose_file := "docker/compose.yaml"
env_file := ".env"

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
  just compose down

# 🚨 DELETE ALL THINGS DOCKER
[group('🚨 danger')]
nukeall: down
  @-just docker stop `docker ps -a -q` >/dev/null < 2&>1 || true
  @-just docker rm `docker ps -a -q` >/dev/null < 2&>1 || true

  @-just docker volume `docker volume ls -q` >/dev/null < 2&>1 || true
  @-just docker network `docker network ls -q` >/dev/null < 2&>1 || true

  @-just docker system prune -f >/dev/null < 2&>1 || true
  @-just docker volume prune -f >/dev/null < 2&>1 || true
  @-just docker builder prune -f >/dev/null < 2&>1 || true
  @-just docker network prune -f >/dev/null < 2&>1 || true

  @-just docker builder history rm --all > /dev/null < 2&>1 || true


