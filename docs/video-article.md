## 1. Intro (1-2 min): "reagir a log é caro e lento"

> (SEO para o vídeo) Finalmente decidi estudar observabilidade mais a fundo.
>
> Neste vídeo, vou te mostrar como estou usando a stack LGTM (Loki, Grafana,
> Tempo e Mimir) para estudo real, inclusive em servidor real. Também vou deixar
> todas as configurações e explicações para você não começar no escuro.

---

Se você trabalha com aplicações reais, provavelmente já viveu isso: dá erro,
você corre para os logs, tenta entender no susto, corrige na correria e torce
para não acontecer de novo. Independente do dia ou do horário.

Normal. Eu também fiz isso por muito tempo.

O problema é que isso custa caro: estresse, tempo e paz. Pode te arrancar da
cama de madrugada, interromper férias, ou destruir teu foco no meio de qualquer
momento importante.

Depois de anos futricando logs com `grep`, `ps`, `tail` e afins, decidi estudar
observabilidade de verdade.

Preciso sair do modo "reagir ao erro" e ir para o modo "entender o sistema antes
da falha escalar".

Observabilidade, por si só, não deve resolver 100% dos problemas. Ainda terei
sustos. Mas tenho certeza de que terei uma visão antecipada do sistema.

Com essa visão, consigo melhorar continuamente métricas, alertas e decisões
técnicas.

## 2. O problema real (2-3 min): "log sozinho não fecha diagnóstico"

Se você já fez debug em produção, sabe que log responde muito bem o "o que
aconteceu".

Mas aí vêm perguntas que log sozinho não responde tão bem:

- Quantas vezes isso aconteceu na semana?
- Qual foi a tendência ao longo do tempo?
- Em qual etapa da requisição o problema começou?

E aqui começa a dor real.

Tem gente que diz que "log resolve tudo". Eu responderia com o menor violino do
mundo... ou melhor, o menor cluster do mundo.

Eu só estou estudando isso mais a fundo agora porque, nas últimas semanas, sofri
bastante tentando buscar log na mão em cluster pequeno, com 3 nodes.

Agora imagina isso em ambientes com 12, 24, 48+ nodes. Não existe mundo real
onde você vai fazer `tail -f` em tudo e chamar isso de estratégia.

Então o que falta?

**Métricas** respondem frequência e tendência. Exemplo: "todo dia, das 20h às
00h, o tráfego do carrinho sobe 50%". Aí você cruza com negócio: "as vendas
também subiram 50% ou só o erro aumentou?". Esse tipo de pergunta muda decisão
técnica e decisão de produto.

**Traces** mostram o caminho da requisição ponta a ponta. Você consegue ver onde
ficou lento, onde falhou e qual serviço puxou tudo para baixo.

Quando junta os três, logs, métricas e traces, você para de chutar e começa a
diagnosticar com contexto. E fecha com **alertas**: em vez de descobrir pelo
cliente reclamando, você é avisado antes.

Esses são os três pilares da observabilidade. E é justamente essa separação que
torna o diagnóstico mais rápido e mais confiável.

## 3. A stack que escolhi (1-2 min): "Cada problema, uma peça"

Existem muitas opções para observabilidade. Depois de pesquisar bastante,
comunidade, documentação e potencial de escala, decidi focar na **LGTM Stack**.

E olha que legal: cada peça responde exatamente um dos problemas que acabei de
descrever.

- Preciso guardar logs de forma pesquisável? **Loki**.
- Preciso guardar métricas com histórico? **Mimir**.
- Preciso rastrear o caminho de cada requisição? **Tempo**.
- Preciso visualizar tudo, explorar e configurar alertas? **Grafana**.

Quatro peças, quatro responsabilidades claras. E juntas, a sigla: **L**oki,
**G**rafana, **T**empo, **M**imir.

## 4. Como tudo se conecta? (1-2 min): "OpenTelemetry + Alloy"

Beleza, a stack guarda os dados. Mas como esses dados saem da sua aplicação e
chegam lá?

Por muito tempo, a instrumentação ficava acoplada ao provedor do serviço:
Datadog, New Relic, entre outros (o famoso _vendor lock-in_). Funcionava, mas
migrar depois era doloroso.

### OpenTelemetry

É aí que entra o **OpenTelemetry**. Pensa nele como um _idioma universal_: sua
aplicação fala nele, e depois você escolhe quem escuta. Mudou de provedor? Muda
o destino, não o código.

### Alloy

Só que os sinais não vêm de um lugar só. Métrica pode vir da aplicação, do
container ou da VPS. Log pode vir da stdout. Trace pode vir da instrumentação
HTTP.

Sem um coletor central, você acaba espalhando configuração e duplicando esforço.

O **Grafana Alloy** é o _carteiro da telemetria_: pega cada sinal, separa por
tipo e entrega na porta certa, logs para o Loki, métricas para o Mimir, traces
para o Tempo.

No projeto deste vídeo, o fluxo real fica assim:

- Logs: `API -> stdout -> Docker -> Alloy -> Loki -> Grafana`
- Métricas da API: `API -> OpenTelemetry -> Alloy -> Mimir -> Grafana`
- Métricas do host e containers: `node-exporter + cAdvisor (via Alloy) -> Alloy -> Mimir -> Grafana`
- Traces: `API -> OpenTelemetry -> Alloy -> Tempo -> Grafana`

Falo isso porque, no mundo real, nem todo sinal sai do mesmo lugar. E aqui eu
quero te mostrar exatamente o que este repositório faz, não um desenho bonito
que só existe no slide.

## 5. Como eu estudo isso? (3-5 min): "Em ambiente real, com risco controlado"

> (Cenas Hostinger VPS, hpanel, etc)

Não vou mentir para você: já tentei "parar para estudar observabilidade" várias
vezes no passado. Mas nem considero. Pelo menos para mim, sempre foi **chato pra
caramba**.

Sem dados reais, tudo fica artificial. Os dados sintéticos, quando é só você
gerando, acabam ficando monótonos. Cadê a emoção? 😅

Dessa vez fiz diferente: simplesmente subi um VPS real, com domínio, HTTPS,
proxy reverso com Traefik e tudo que existe no mundo real para manter servidor
de pé. (_Cara, tem VPN via WireGuard, coisa fina_).

A ideia é manter esse servidor ativo enquanto estiver estudando, e além (se
ninguém derrubar ele antes). Se eu colocar outras aplicações nele, a stack LGTM
continua junto. Assim eu ganho sinais mais realistas, inclusive tráfego de bot
tentando achar brecha.

E esse é exatamente o ponto: para estudar observabilidade de verdade, você
precisa de um servidor de verdade. Dados sintéticos no localhost não vão te dar
aquele alerta de madrugada que te faz entender por que tudo isso importa.

O servidor que eu estou usando é um **KVM 2** da **Hostinger**. Melhor custo
benefício para esse tipo de laboratório, sobra recurso para a stack inteira e
ainda cabe mais coisa.

Se você quiser montar o mesmo setup, o link e o cupom estão aqui:

> Desconto:
> [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
> Cupom: `OTAVIOMIRANDA`

Agora... vamos subir isso tudo na prática.

## 6. Indo para o terminal (5-10 min): "Git + pull + recipes"

> (Cenas do terminal / SSH no VPS)

A minha ideia é não perder tempo com infra, código, comando. E te dar algo
pronto para você não perder duas semanas criando este setup. O projeto inteiro
está no meu GitHub, o link está aqui (eu esqueci do link? Certeza que vou
esquecer).

A brincadeira no **VPS** é ridiculamente simples: você faz o **SSH** na sua
máquina, roda o git clone e entra na pasta. Sem exagero nenhum, já devo ter
explicado este processo umas 10 vezes no meu canal, exemplos:

- [Docker no VPS + Github Actions para CI/CD (Deploy em Produção)](https://youtu.be/yxxEk68EDgo?si=qu1Wv1v8YlXb7D0J)
- [Docker Swarm com 3 VPS do Zero a Produção](https://www.youtube.com/watch?v=3-MW6pkn7uA)

Pra não ter que lembrar de comandos gigantes do Docker, eu criei um arquivo
`Justfile` com algumas receitas. É só rodar `just up` (local, seu computador) ou
`just deploy` (no servidor) e ser feliz.

Mas, se você acabou de clonar o repositório em uma máquina nova, tem um detalhe
que vale falar antes para ninguém tomar erro bobo na cara: copie o
`.env.example` para `.env`.

`cp .env.example .env`

Nesse projeto, o arquivo de exemplo já vem com os defaults do Grafana. Então
isso aqui não é ritual místico de setup, é só o passinho inicial para o `just`
e o Docker Compose não reclamarem.

Sem drama, sem ritual estranho de _DevOps_. O Docker Compose vai baixar as
imagens e subir tudo: **Loki**, **Grafana**, **Tempo**, **Mimir**, **Alloy** e a
nossa **API em Python**.

Pronto... e... Subiu!

Mas tem um detalhe importante: stack vazia não rende demo. Depois de subir, eu
faço sempre esse check mínimo:

- No localhost: `just smoke`
- Pra encher os dashboards com sinais previsíveis: `just traffic-scenarios 20 0.1`
- Pra validar se o Alloy está recebendo métricas e traces: `just o11ycheck`
- Pra demo de alertas no local: `just rules-load` e depois `just alert-demo 30 0.1`
- No VPS, a versão equivalente é: `just traffic-scenarios-prod 20 0.1`
- Se eu quiser demo de alertas no VPS também, primeiro carrego as rules do
  Mimir com o bootstrap descrito em `docs/kvm2-runbook.md`, e só depois forço
  tráfego com `just chaos-prod`

Aí sim faz sentido abrir a interface.

No localhost, a API fica em `http://127.0.0.1:8000` e o Grafana em
`http://127.0.0.1:3000`. No VPS, a API entra pelo domínio HTTPS via Traefik e o
Grafana continua privado.

Agora é só a gente bater no que interessa. Nos dois vídeos acima eu explico
como configurar todo o **VPS**. Mesmo assim, aqui está um
[DEV_GUIDE](https://github.com/luizomf/vps_deploy_template/blob/main/DEV_GUIDE.md)
completo.

### Onde mexer quando precisar

Rápido, só pra você não ficar perdido no repositório:

- Precisa mexer na infra? Pasta `docker/`. Lá tem o `compose.yaml` que sobe
  tudo, as configs do Alloy, Loki, Tempo e Mimir, e os dashboards do Grafana.
- Precisa mexer no código? Pasta `api/`. A telemetria vive em
  `src/api/infrastructure/telemetry.py`, e os logs e métricas por requisição
  ficam em `src/api/presentation/http.py`.

Simples assim. Dois lugares, duas responsabilidades.

## 7. Tour rápido no Grafana (5-10 min): "Interface sem mistério"

> (Cenas de telas do Grafana)

Essa tela é intimidadora. Mas brinque com ela! Crie coisas, apague coisas só
para se acostumar. Você sempre pode usar a minha receita _(vou omitir o nome
para sua segurança)_ e começar do zero de novo.

> **Obs.:** é sério, no `Justfile` tem uma receita que detona (APAGA) tudo sem
> perguntar nada. CUIDADO 🚨.

Se você estiver no seu localhost (com `just up`), ao acessar a porta `3000`, é
só digitar `admin` e `admin` para usuário e senha e começar a brincar.

No perfil `kvm2` deste repositório, o Grafana em produção fica acessível apenas
pela rede privada do **WireGuard** (`http://<IP_DO_WIREGUARD>:3000`). É esse o
cenário pronto do projeto. Se você está dentro da VPN, acessa. Se não está,
nem sabe que existe.

A API, por outro lado, é pública de propósito (`api.inprod.cloud` via Traefik
com HTTPS). Troque esse domínio no arquivo:
[../docker/compose.kvm2.yaml](../docker/compose.kvm2.yaml)

Já deixei os Data Sources conectados para você. **Mimir**, **Loki** e **Tempo**
já estão conversando com o **Grafana** nativamente.

Também deixei três dashboards dentro de `LGTM Demo` prontos:

- `LGTM Demo Overview`: visão geral da API
- `LGTM Flight Deck`: painel mais completo para brincar com cenário, logs e taxa
- `VPS Health`: CPU, memória, disco e rede do servidor

Então, em vez de abrir o Grafana e sair clicando igual um maluco, eu seguiria
essa ordem:

- `Connections > Data sources`: confirmar que `Mimir`, `Loki` e `Tempo` estão verdes
- `Dashboards > LGTM Demo Overview`: ver request rate, error ratio e latência
- `Dashboards > LGTM Flight Deck`: cruzar comportamento da API com logs
- `Explore > Loki`: investigar erro com query pronta
- `Explore > Tempo`: abrir trace lenta e ver o waterfall
- `Alerting > Alert rules`: no local, depois de `just rules-load`, acompanhar `DemoApiHighErrorRatio` e `DemoApiHighLatency`

E não se apegue muito. Você encontra milhares de dashboards do Grafana pela
internet afora. É só baixar e importar um mísero arquivo `.json`.

## 8. Fechamento (2-3 min): "Do grep ao painel"

Lembra do cara que acordava de madrugada pra rodar `grep` em produção? Que
perdia horas navegando entre nodes tentando juntar pedaços de log?

Esse cara agora tem um painel que mostra métricas, traces e logs no mesmo lugar.
Tem regra de alerta pronta para avisar antes do cliente reclamar. Tem um
servidor real gerando dados reais, inclusive bot batendo na porta.

Esse cara sou eu. E esse setup é o mesmo que te entreguei aqui.

Claro que não dá pra ensinar Engenharia de Observabilidade inteira em um vídeo.
E eu também ainda preciso aprender muito sobre isso para cogitar te ensinar algo
útil. Mas confessa: essa base aqui já te tira do zero absoluto e te entrega uma
arquitetura moderna, funcional e que você pode evoluir no seu trabalho ou nos
seus projetos reais.

_(A época de caçar erro com `grep` e `tail` acabou, meu amigo. O pior é que eu
gosto desses comandos 🤫)_

Se a sua cabeça ferveu de ideias, comenta aí embaixo qual o próximo nível que
você quer ver: alertas avançados mandando mensagem no Telegram de madrugada?
Instrumentação mais pesada no código Python? Pede aí.

E se você quer sentir a dor (e a alegria) de ver dados reais caindo no seu
painel num servidor exposto pra internet, os VPS da Hostinger com meu cupom
exclusivo estão aqui:

> Desconto:
> [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
> Cupom: `OTAVIOMIRANDA`

Faz o laboratório, depois me conta se os hackers não tentaram derrubar seu
servidor!

Aquele abraço e até o próximo vídeo.
