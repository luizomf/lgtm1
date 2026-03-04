# Roadmap Tecnico Inicial

## Objetivo operacional

Ter uma versao filmavel rapidamente, sem sacrificar a base estrutural do
projeto.

## Direcao recomendada

Usar o que ja existe no repositorio como ponto de partida:

- `docker/compose.yaml` ja tem esqueleto da stack LGTM com `Alloy`
- `frontend/` ja existe e pode virar vitrine futura, mas nao precisa bloquear a
  V1
- falta definir a aplicacao demo e amarrar a historia entre sinal gerado e
  leitura no Grafana

## Recorte da V1

### Infraestrutura

- Docker Compose local
- Um unico VPS para deploy inicial
- Candidato principal: `kvm8`

Motivo: ja esta aberto em `80/443`, tem mais recursos e reduz friccao para
chegar em algo filmavel no prazo.

### Rede

- Aplicacao demo publica
- Eventual proxy publico para a API
- Grafana preferencialmente exposto apenas na interface `wg0` do WireGuard

Se o WireGuard consumir tempo demais na primeira passada, priorizamos a entrega
filmavel e tratamos o isolamento como etapa imediatamente seguinte.

### Aplicacao demo

Recomendacao: criar um app `FastAPI` simples em um diretorio proprio dentro do
monorepo.

Motivos:

- rapido de subir
- facil de instrumentar
- boa legibilidade para documentacao complementar
- suficiente para gerar logs, metricas e traces sem inventar complexidade

## Fases

### Fase 1: Base filmavel local

- Confirmar e estabilizar a stack LGTM local
- Criar a API demo
- Instrumentar a API com OpenTelemetry
- Fazer o `Alloy` receber e encaminhar sinais
- Conectar o Grafana a `Loki`, `Tempo` e `Mimir`
- Montar uma visualizacao minima que prove valor

Saida esperada: um fluxo local em que voce provoca comportamento na API e
consegue "enxergar" isso no Grafana.

### Fase 2: Cenarios de demonstracao

Implementar endpoints orientados a narrativa:

- `/health` para sucesso previsivel
- `/unstable` para erro e lentidao intermitentes
- `/scenario` para forcar comportamento por parametro (`ok`, `warn`, `error`,
  `slow`)

Saida esperada: capacidade de demonstrar no video, com pouco tempo de tela, por
que observabilidade importa.

### Fase 3: Deploy em VPS

- Escolher `kvm8` como primeiro alvo
- Subir Docker e Compose se necessario
- Levar a stack para o servidor
- Publicar a API
- Restringir o Grafana ao acesso administrativo

Saida esperada: ambiente online suficiente para sustentar a narrativa "agora
isso esta no ar".

### Fase 4: Polimento e documentacao

- Organizar README principal
- Escrever guia manual em Markdown com os "comos"
- Documentar limites da arquitetura
- Preparar trechos de fala do video com base nos "porques"

Saida esperada: base reaproveitavel e blindada contra interpretacoes erradas.

## Ordem de implementacao recomendada para hoje e amanha

1. Fazer a stack local funcionar de forma observavel de ponta a ponta.
2. Criar a API demo minima e os endpoints de demonstracao.
3. Validar o fluxo no Grafana.
4. Subir a mesma ideia no `kvm8`.
5. Decidir se o WireGuard entra no rascunho de sexta ou fica para refinamento da
   semana seguinte.

## Decisoes tecnicas iniciais

- Comecar simples e defensavel e melhor do que tentar alta sofisticacao antes da
  validacao
- O projeto deve provar valor antes de otimizar seguranca e hardening
- `Mimir` permanece no escopo inicial, mas podemos reduzir seu protagonismo se
  ele atrapalhar o prazo
- O frontend nao precisa entrar na primeira demonstracao; a API observavel e
  suficiente para sustentar a tese

## Riscos de execucao

- Falta de familiaridade com a stack pode travar se tentarmos aprender tudo ao
  mesmo tempo
- Integracao de logs, metricas e traces pode falhar em detalhes de configuracao
- Seguranca de rede pode expandir demais o escopo se entrar cedo demais

## Travas de escopo

Se o prazo apertar, preservar nesta ordem:

1. API demo instrumentada
2. Visualizacao funcional no Grafana
3. Deploy em um unico VPS
4. WireGuard
5. Polimento visual adicional

## Proxima acao recomendada

Fechar a definicao da API demo e, em seguida, implementar a primeira trilha
completa: requisicao, sinal gerado, sinal coletado, leitura no Grafana.
