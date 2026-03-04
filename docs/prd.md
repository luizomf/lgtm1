# PRD Enxuto: Base LGTM para Observabilidade

## Status

Rascunho inicial alinhado ao prazo de filmagem e ao posicionamento do video.

## Visao do produto

Construir uma base reutilizavel de observabilidade com a stack LGTM (`Loki`,
`Grafana`, `Tempo` e `Mimir`) que rode localmente e tenha caminho claro para
deploy em um unico VPS via Docker Compose.

Essa base precisa servir a dois objetivos ao mesmo tempo:

1. Ser um projeto tecnicamente correto, com padrao de crescimento saudavel.
2. Ser o alicerce narrativo de um video que ensina os "porques" da
   observabilidade sem virar tutorial.

## Problema

Projetos pequenos e medios costumam adiar observabilidade porque ela parece
"coisa de empresa grande", complexa ou cara de manter. O resultado e previsivel:

- logs espalhados
- erros intermitentes dificeis de reproduzir
- lentidao sem contexto
- falta de confianca para publicar e evoluir a aplicacao

O projeto resolve isso oferecendo uma base pronta, didatica e realista, que
reduz a friccao inicial e mostra que observabilidade pode nascer cedo, com boas
praticas, sem depender de Kubernetes ou arquitetura complexa.

## Objetivo principal

Entregar uma base de observabilidade simples de subir, facil de entender e
pronta para demonstrar valor rapidamente em video e em uso real.

## Publico-alvo

- Devs junior e pleno aprendendo observabilidade
- Pessoas em transicao para tarefas de `DevOps`
- Desenvolvedores que querem uma base pronta para reaproveitar em projetos
  futuros

## Promessa central

Observabilidade deixou de ser opcional. Com uma base pronta e bem pensada, fica
mais facil publicar sistemas confiaveis e evoluir sem trabalhar no escuro.

## Escopo da V1

### Entrega tecnica

- Rodar a stack LGTM localmente via Docker Compose
- Instrumentar uma aplicacao demo simples, com foco em sinais observaveis reais
- Expor logs, metricas e traces em um painel funcional no Grafana
- Garantir caminho claro de deploy em um unico VPS
- Isolar o acesso administrativo do Grafana por WireGuard sempre que isso nao
  comprometer o prazo
- Organizar o repositorio para crescimento futuro (documentacao, estrutura,
  padrao de evolucao)

### Aplicacao demo

Uma API simples, preferencialmente em `FastAPI`, com endpoints que simulem
comportamento comum de producao:

- sucesso normal
- resposta lenta
- warning
- erro intermitente
- endpoint controlado para forcar cenarios especificos em demonstracao

Essa aplicacao existe para gerar sinais observaveis, nao para competir com a
stack principal em complexidade de negocio.

### Entrega de conteudo

- Explicar por que observabilidade importa antes de mostrar ferramentas
- Mostrar que logs sozinhos nao bastam
- Apresentar a stack LGTM como uma base coesa, nao como quatro produtos
  desconectados
- Conduzir a narrativa ate o momento natural de "agora precisamos de um VPS"

## Fora de escopo agora

- Kubernetes
- Docker Swarm
- Alta disponibilidade real
- Multi-VPS para a primeira versao
- Tutorial detalhado em video
- Features de negocio complexas na aplicacao demo

## Requisitos de arquitetura

- Local-first: deve rodar localmente antes do deploy
- Single VPS para a primeira entrega
- Docker Compose como orquestracao inicial
- Separacao clara entre aplicacao demo e stack de observabilidade
- Grafana tratado como superficie administrativa, preferencialmente protegido
  por rede privada WireGuard
- Decisoes tecnicas precisam ser defensaveis em comentario publico, mesmo quando
  simplificadas por prazo

## Requisitos de comunicacao

- O video deve priorizar "motivos" e "decisoes"
- O passo a passo tecnico fica em material complementar em Markdown
- Solucoes simplificadas precisam ser contextualizadas para evitar leitura de
  "gambiarra sem criterio"
- O discurso precisa continuar tecnico, mas visualmente leve e orientado a
  entretenimento

## Criterios de sucesso

### Sucesso tecnico

- A stack sobe de forma repetivel em ambiente local
- A API demo gera sinais suficientes para demonstrar valor
- O Grafana mostra, no minimo, uma leitura util de logs, metricas e traces
- O deploy em VPS e viavel sem refazer a arquitetura

### Sucesso de conteudo

- O video deixa claro por que observabilidade importa
- O espectador entende que existe uma base pronta para acelerar projetos
- A narrativa leva naturalmente ao uso de um VPS
- O material e suficientemente solido para evitar critica tecnica obvia de quem
  ja e avancado

### Sucesso de negocio

- O video fica publicavel com um rascunho convincente ate sexta-feira,
  06/03/2026
- O projeto tem potencial de long tail por utilidade pratica
- Views e comentarios servem como termometro primario de recepcao

## Riscos

- Prazo curto pode forcar cortes em hardening e refinamento visual
- WireGuard pode competir com o prazo se tentarmos sofisticar cedo demais
- Mimir pode adicionar peso desnecessario se a instrumentacao inicial ainda
  estiver crua
- Como a stack ainda esta em fase de descoberta, existe risco de aprender e
  implementar ao mesmo tempo

## Assuncoes que vamos usar

- A V1 sera otimizada para clareza e valor demonstravel, nao para producao
  enterprise
- O `kvm8` e o candidato natural para o primeiro deploy por estar aberto em
  `80/443` e ter maior folga de recursos
- O Grafana pode ficar fora da internet publica e ainda cumprir perfeitamente o
  objetivo do projeto
- O repositorio atual ja serve como ponto de partida, pois a stack base de
  containers ja comecou a ser desenhada

## Decisao editorial

Este projeto nao vai vender "como configurar ferramenta". Ele vai vender
entendimento, criterio e uma base pronta. O tutorial completo pode existir como
documentacao complementar, mas o video principal precisa permanecer narrativo.
