# LGTM Demo Stack

Este repositório é uma base prática para estudar observabilidade com a stack
LGTM. A ideia não é só subir Grafana, mas ter uma aplicação pequena que gera
sinais úteis de propósito para você explorar logs, métricas, traces e alertas em
um ambiente local e em uma VPS real.

## O que tem aqui

- `Loki` para logs
- `Grafana` para visualização e investigação
- `Tempo` para traces
- `Mimir` para métricas
- `Alloy` como coletor e roteador dos sinais
- `FastAPI` como aplicação de demonstração

## Fluxo real dos sinais

### Logs

A API escreve logs em `stdout`. O Docker expõe esses logs, o Alloy coleta tudo
pela socket do Docker e encaminha para o Loki.

`api -> stdout -> Docker -> Alloy -> Loki -> Grafana`

### Métricas

A API emite métricas com `OpenTelemetry`. Além disso, o Alloy coleta métricas do
host e dos containers. Tudo vai para o Mimir.

`api -> OTLP -> Alloy -> Mimir -> Grafana`

`containers -> cAdvisor -> Alloy -> Mimir -> Grafana`

`host -> node_exporter -> Alloy -> Mimir -> Grafana`

### Traces

A API envia traces com `OpenTelemetry` para o Alloy via `OTLP gRPC`. O Alloy
encaminha esses traces para o Tempo.

`api -> OTLP -> Alloy -> Tempo -> Grafana`

## Subindo localmente

Em um clone novo, crie primeiro o arquivo `.env`:

```bash
cp .env.example .env
```

Depois suba a stack:

```bash
just up
```

Se quiser validar rapidamente:

```bash
just smoke
just traffic-scenarios 20 0.1
```

## Recipes mais úteis

### Tráfego e sinais

- `just traffic 30 0.2`
  Gera tráfego aleatório via `/unstable`.
- `just traffic-scenarios 20 0.1`
  Gera um ciclo determinístico de `ok -> warn -> slow -> error`.
- `just chaos 90 0.1`
  Gera erros e lentidão de propósito para deixar dashboards e alertas bem visíveis.
- `just calm 60 0.1`
  Gera apenas tráfego saudável para ajudar alertas a se recuperarem.

### Alertas locais

```bash
just rules-load
just rules-list
just rules-state
just alert-demo 30 0.1
```

### Alertas na VPS

No perfil de VPS, as recipes de alertas conversam com o `mimir` pela rede
interna do Docker, sem depender de uma porta pública:

```bash
just rules-load-prod
just rules-list-prod
just rules-state-prod
just alert-demo-prod 30 0.1
```

## Endpoints locais

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Grafana: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Alloy admin/metrics: [http://127.0.0.1:12345](http://127.0.0.1:12345)

## Rotas da API de demo

- `GET /health`
- `GET /unstable`
- `GET /scenario?mode=ok`
- `GET /scenario?mode=warn`
- `GET /scenario?mode=error`
- `GET /scenario?mode=slow&delay_ms=1500`

## Dashboards provisionados

Ao subir a stack, o Grafana já recebe automaticamente os datasources e estes
dashboards:

- `LGTM Signals Tour`
- `LGTM Demo Overview`
- `LGTM Flight Deck`
- `VPS Health`

Login padrão do Grafana no ambiente local:

- Usuário: `admin`
- Senha: `admin`

## Local x VPS

### Local

- Grafana em `http://127.0.0.1:3000`
- API em `http://127.0.0.1:8000`
- ideal para aprender a stack e validar a instrumentação

### VPS (`kvm2`)

- API pública via Traefik em `80/443`
- Grafana privado em `${GRAFANA_BIND_IP}:${GRAFANA_BIND_PORT}`
- Loki, Tempo, Mimir e Alloy expostos apenas internamente
- bom para estudar sinais mais realistas e deploy privado do Grafana via WireGuard

## Superfícies públicas e privadas no perfil `kvm2`

| Superfície | Endereço/porta | Visibilidade | Motivo |
| --- | --- | --- | --- |
| Traefik HTTP | `0.0.0.0:80` | Pública | desafio ACME + redirecionamento para HTTPS |
| Traefik HTTPS | `0.0.0.0:443` | Pública | entrada pública da API |
| Porta da API | `8000` | Interna | acessada pelo Traefik |
| Grafana UI | `${GRAFANA_BIND_IP}:${GRAFANA_BIND_PORT}` | Privada | superfície administrativa |
| node-exporter | `9100` | Interna | métricas do host para o Alloy |
| Loki | `3100` | Interna | backend |
| Tempo | `3200` | Interna | backend |
| Mimir | `9009` | Interna | backend |
| WireGuard | `51820/udp` | Peers autorizados | rede privada |

## Documentação complementar

- [Guia técnico do projeto](./docs/project-guide.md)
- [Guia completo da VPS](./docs/DEV_GUIDE.md)
- [Guia rápido da VPS](./docs/DEV_GUIDE_SENIOR.md)
