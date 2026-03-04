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


# Run prettier or ruff to format files
[group('format')]
format *ARGS:
  just compose down

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



