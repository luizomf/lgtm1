# Brief do Video

## Tese

Nao basta publicar uma aplicacao. Ela precisa continuar confiavel depois que vai ao ar. Observabilidade e a base que permite enxergar o que esta acontecendo de verdade.

## Promessa de clique

"Observabilidade nao e opcional em 2026. Aqui esta uma base pronta com LGTM para voce entender o que importa e acelerar seus proximos projetos."

## Formato

Construcao do zero com narrativa, focando em decisoes e consequencias, nao em passo a passo.

## O que o video precisa fazer o publico sentir

- "Agora eu entendi por que isso importa."
- "Nao parece mais um bicho de sete cabecas."
- "Eu consigo partir dessa base depois."

## Arco narrativo sugerido

### 1. Problema

Abrir com a ideia de que publicar sem observabilidade e operar no escuro. Uma aplicacao pode "funcionar" e ainda assim estar falhando, ficando lenta ou gerando ruido sem que voce perceba.

### 2. Virada

Mostrar que o ponto nao e decorar ferramenta. O ponto e ter visibilidade para tomar decisao quando algo sai do normal.

### 3. Solucao

Apresentar a stack LGTM como um sistema de visao:

- `Loki` para logs
- `Tempo` para traces
- `Mimir` para metricas
- `Grafana` como a camada de leitura e correlacao

### 4. Demonstracao

Usar a API demo para provocar comportamentos reais:

- erro intermitente
- resposta lenta
- warning
- sucesso normal

Aqui, o foco nao e "olha o comando". O foco e "olha como agora conseguimos entender o comportamento da aplicacao".

### 5. Necessidade de infraestrutura

Quando a base fizer sentido, a narrativa encaixa naturalmente em:

"Agora precisamos colocar isso no ar com confianca, e para isso vamos usar um VPS."

Esse e o gancho para a integracao comercial com a Hostinger.

### 6. Fechamento

Reforcar que o principal ganho nao e o painel bonito. E a capacidade de evoluir um projeto com menos cegueira, menos chute e mais confianca.

## O que evitar

- Cara de tutorial
- Longas cenas de terminal
- Mergulhar cedo em configuracoes avancadas
- Prometer arquitetura enterprise
- Tratar a stack como se ela se resumisse a "instalar dashboard"

## Mensagens-chave para repetir

- Observabilidade e investimento em confiabilidade
- A base pronta acelera projetos
- Logs isolados contam so parte da historia
- Ferramenta sem criterio nao resolve o problema
- Estamos simplificando onde faz sentido, com consciencia

## Blindagem contra critica tecnica previsivel

Quando houver simplificacao por prazo ou didatica, o video deve antecipar isso de forma madura:

- estamos usando um unico VPS por escopo e velocidade
- nao estamos buscando alta disponibilidade nesta primeira versao
- a arquitetura foi escolhida para ser base de aprendizado e crescimento, nao para simular uma empresa gigante

Isso reduz a chance de a audiencia avancada interpretar simplificacao como desconhecimento.

## Material complementar

O passo a passo tecnico completo fica em documentacao Markdown separada. No video, basta mencionar que os detalhes de implementacao estao organizados para quem quiser reproduzir tudo depois.

## Meta realista para o rascunho

Ate sexta-feira, 06/03/2026, o video precisa ter:

- narrativa clara
- demonstracao minima convincente
- transicao natural para a publi
- linguagem segura o bastante para aprovar internamente
