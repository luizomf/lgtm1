# Video Story - Study Mode (15 min)

## North Star

Nao vender imagem de guru.
Vender honestidade + criterio + base pronta.

Frase de posicionamento:
"Eu nao sou especialista em LGTM. Estou estudando isso agora, e esse setup aqui e o meu laboratorio real."

## Estrutura macro (o que voce descreveu, lapidado)

1. Dor + contexto humano
2. Como (arquivos importantes, sem tutorial)
3. O que e cada peca (LGTM + onde entra Prometheus)
4. Teste local rapido
5. Transicao natural para VPS
6. Anuncio Hostinger
7. Validacao no Grafana (UI, sinais e alerta)
8. Fechamento com CTA + gancho de continuidade

## Brechas fechadas

### Brecha 1: "Cadê o Prometheus?"

Resposta curta para video:
"Aqui a gente usa Mimir como backend de metricas. Ele fala a lingua do Prometheus (PromQL e endpoints compativeis), mas com foco em armazenamento escalavel e stack integrada com Grafana."

Resposta ainda mais curta:
"Prometheus e o padrao de consulta, Mimir e o motor que estamos usando aqui."

### Brecha 2: "Isso virou tutorial?"

Blindagem:
"Nao vou fazer passo a passo na tela. Vou te mostrar o mapa: onde cada coisa mora e por que isso importa. O como completo esta no markdown do projeto."

### Brecha 3: "Setup simples demais"

Blindagem:
"Isso aqui e setup de estudo consciente: 1 VPS, sem HA, sem Kubernetes. O objetivo e clareza e base reutilizavel."

### Brecha 4: "E se a demo nao disparar alerta na hora?"

Plano B na gravacao:
- rodar `just alert-demo 30 0.1`
- abrir Alerting e mostrar `Pending -> Firing`
- se demorar, mostrar `just rules-state` no terminal por 2 segundos e voltar para UI

## Beat sheet (15 min)

## 0:00-1:40 - Hook + dor + honestidade

Objetivo: ganhar confianca rapido.

Talk track:
"Eu passei tempo demais tentando entender essa interface e me senti perdido. Entao esse video nao e de guru, e de campo: o setup que eu estou usando pra estudar observabilidade sem me enganar."

"Se a aplicacao quebra em producao e voce nao enxerga o motivo, voce nao tem software, voce tem loteria."

Humor leve:
"Eu apanhei da tela do Grafana por umas boas horas. Se eu entendi, voce tambem entende."

## 1:40-3:40 - O mapa do projeto (como sem tutorial)

Objetivo: orientar sem cansar.

Mostrar rapido:
- `docker/compose.yaml`
- `docker/alloy-config.alloy`
- `docker/tempo-config.yaml`
- `docker/mimir-config.yaml`
- `docker/grafana/provisioning/datasources/default.yaml`
- `docker/mimir-rules/demo-api.yaml`
- `Justfile`

Frase:
"Se voce precisar mexer, esses sao os arquivos vivos. Nao precisa decorar, precisa saber onde mora cada decisao."

## 3:40-6:00 - O que e cada peca (LGTM sem enrolar)

Objetivo: dar clareza conceitual.

- Loki: logs (o que aconteceu)
- Tempo: traces (onde aconteceu dentro da requisicao)
- Mimir: metricas (com que frequencia e impacto)
- Grafana: camada de leitura e correlacao
- Alloy: coletor/roteador de sinais

Linha de ouro:
"Log te conta o evento, metrica te conta o padrao, trace te conta a causalidade."

Pergunta dramatica:
"E o Prometheus?"
Resposta:
"Aqui o padrao Prometheus continua vivo em consulta e modelo mental. So trocamos o backend para Mimir."

## 6:00-7:20 - Local quick test

Objetivo: provar que nao e teoria.

Comandos:
- `just up`
- `just smoke`
- `just traffic-scenarios 20 0.1`
- `just alert-demo 30 0.1`

Frase:
"Em menos de dois minutos a gente gera sucesso, warning, lentidao, erro e alerta."

## 7:20-8:10 - Ponte para VPS

Objetivo: encaixar publi com naturalidade.

Frase:
"Local validou meu estudo. Mas local nao ensina tudo sobre operacao real. Agora a gente precisa colocar isso no ar."

"E e aqui que entra o VPS."

## 8:10-9:30 - ANUNCIO HOSTINGER

Curto e direto.

Regra editorial:
Nao quebrar narrativa tecnica. O anuncio e continuidade do problema real: colocar no ar com custo/controle.

## 9:30-13:30 - Grafana UI tour (a parte que segura audiencia)

### Bloco 1: Dashboard
- abrir `LGTM Demo Overview`
- mostrar request rate, error ratio, delay

Frase:
"Nao e sobre grafico bonito. E sobre saber se a confiabilidade esta melhorando ou piorando."

### Bloco 2: Explore + Loki
- query de erro

Frase:
"Agora eu saio de sintoma agregado e vou para evidencia textual."

### Bloco 3: Explore + Tempo
- query de slow trace

Frase:
"Aqui eu vejo exatamente onde o tempo queimou dentro da requisicao."

### Bloco 4: Alerting
- mostrar regra `DemoApiHighErrorRatio`
- explicar estados: `Normal`, `Pending`, `Firing`, `Recovering`

Frase:
"Firing significa: confirmou condicao e disparou."

## 13:30-15:00 - Fechamento com CTA inteligente

Script:
"Nao da pra esgotar observabilidade em um video, mas da pra sair do zero sem caos."

"Se fizer sentido, comenta que eu continuo essa serie com:
1) hardening real (seguranca e persistencia)
2) deploy limpo em VPS
3) leitura de incidentes reais com essa base."

"Link da Hostinger na descricao. E o repositorio com os markdowns esta junto pra voce reproduzir."

## Frases curtas de transicao (cola de gravacao)

- "Agora que o problema esta claro, vamos pro mapa."
- "Mapa visto, vamos entender cada peca."
- "Conceito claro, bora validar local rapido."
- "Local validado, hora do mundo real: VPS."
- "Infra no ar, agora sim vamos para a interface."
- "Vimos o suficiente para tomar decisao tecnica sem chute."

## Checklist pre-gravacao (evita retrabalho)

1. `just up`
2. `just smoke`
3. `just traffic-scenarios 20 0.1`
4. `just alert-demo 30 0.1`
5. confirmar no Grafana:
- dashboard com dados
- logs com eventos de erro
- traces de slow
- alerta em `Pending` ou `Firing`

## Tom editorial (importante)

- Mais "estou aprendendo com criterio" e menos "aula definitiva".
- Humor de auto-zueira, nao de deboche com audiencia.
- Falar em blocos curtos, 1 ideia por bloco.
- Sempre traduzir ferramenta para decisao pratica.
