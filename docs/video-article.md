## 1. Intro (1-2 min): "reagir a log é caro e lento"

> (SEO para o video) Finalmente decidi estudar observabilidade mais a fundo.
>
> Neste video, vou te mostrar como estou usando a stack LGTM (Loki, Grafana,
> Tempo e Mimir) para estudo real, inclusive em servidor real. Tambem vou deixar
> todas as configuracoes e explicacoes para voce nao comecar no escuro.

---

Se voce trabalha com aplicacoes reais, provavelmente ja viveu isso: da erro,
voce corre para os logs, tenta entender no susto, corrige na correria e torce
para nao acontecer de novo. Independente do dia ou do horario.

Normal. Eu tambem fiz isso por muito tempo.

O problema e que isso custa caro: estresse, tempo e paz. Pode te arrancar da
cama de madrugada, interromper ferias, ou destruir teu foco no meio de qualquer
momento importante.

Depois de anos futricando logs com `grep`, `ps`, `tail` e afins, decidi estudar
observabilidade de verdade.

Preciso sair do modo "reagir ao erro" e ir para o modo "entender o sistema antes
da falha escalar".

Observabilidade, por si so, nao deve resolver 100% dos problemas. Ainda terei
sustos. Mas, tenho certeza que terei uma visao antecipada do sistema.

Com essa visao, consigo melhorar continuamente metricas, alertas e decisoes
tecnicas.

## 2. O problema real (2-3 min): "log sozinho nao fecha diagnostico"

Se voce ja fez debug em producao, sabe que log responde muito bem o "o que
aconteceu".

Mas ai vem perguntas que log sozinho nao responde tao bem:

- Quantas vezes isso aconteceu na semana?
- Qual foi a tendencia ao longo do tempo?
- Em qual etapa da requisicao o problema comecou?

E aqui comeca a dor real.

Tem gente que diz que "log resolve tudo". Eu responderia com o menor violino do
mundo... ou melhor, o menor cluster do mundo.

Eu so estou estudando isso mais a fundo agora porque, nas ultimas semanas, sofri
bastante tentando buscar log na mao em cluster pequeno, com 3 nodes.

Agora imagina isso em ambientes com 12, 24, 48+ nodes. Nao existe mundo real
onde voce vai fazer `tail -f` em tudo e chamar isso de estrategia.

Entao o que falta?

**Metricas** respondem frequencia e tendencia. Exemplo: "todo dia, das 20h as
00h, o trafego do carrinho sobe 50%". Ai voce cruza com negocio: "as vendas
tambem subiram 50% ou so o erro aumentou?". Esse tipo de pergunta muda decisao
tecnica e decisao de produto.

**Traces** mostram o caminho da requisicao ponta a ponta. Voce consegue ver onde
ficou lento, onde falhou e qual servico puxou tudo para baixo.

Quando junta os tres — logs, metricas e traces — voce para de chutar e comeca a
diagnosticar com contexto. E fecha com **alertas**: em vez de descobrir pelo
cliente reclamando, voce e avisado antes.

Esses sao os tres pilares da observabilidade. E e justamente essa separacao que
torna o diagnostico mais rapido e mais confiavel.

## 3. A stack que escolhi (1-2 min): "Cada problema, uma peca"

Existem muitas opcoes para observabilidade. Depois de pesquisar bastante —
comunidade, documentacao e potencial de escala — decidi focar na **LGTM Stack**.

E olha que legal: cada peca responde exatamente um dos problemas que acabei de
descrever.

- Preciso guardar logs de forma pesquisavel? **Loki**.
- Preciso guardar metricas com historico? **Mimir**.
- Preciso rastrear o caminho de cada requisicao? **Tempo**.
- Preciso visualizar tudo, explorar e configurar alertas? **Grafana**.

Quatro pecas, quatro responsabilidades claras. E juntas, a sigla: **L**oki,
**G**rafana, **T**empo, **M**imir.

## 4. Como tudo se conecta? (1-2 min): "OpenTelemetry + Alloy"

Beleza, a stack guarda os dados. Mas como esses dados saem da sua aplicacao e
chegam la?

Por muito tempo, a instrumentacao ficava acoplada ao provedor do servico:
Datadog, New Relic, entre outros (o famoso _vendor lock-in_). Funcionava, mas
migrar depois era doloroso.

### OpenTelemetry

E ai que entra o **OpenTelemetry**. Pensa nele como um _idioma universal_: sua
aplicacao fala nele, e depois voce escolhe quem escuta. Mudou de provedor? Muda
o destino, nao o codigo.

### Alloy

So que os sinais nao vem de um lugar so. Metrica pode vir da aplicacao, do
container ou da VPS. Log pode vir da stdout. Trace pode vir da instrumentacao
HTTP.

Sem um coletor central, voce acaba espalhando configuracao e duplicando esforco.

O **Grafana Alloy** e o _carteiro da telemetria_: pega cada sinal, separa por
tipo e entrega na porta certa — logs pro Loki, metricas pro Mimir, traces pro
Tempo.

Com isso, o fluxo completo fica:

`Aplicacao -> OpenTelemetry -> Alloy -> Loki / Mimir / Tempo -> Grafana`

## 5. Como eu estudo isso? (3-5 min): "Em ambiente real, com risco controlado"

> (Cenas Hostinger VPS, hpanel, etc)

Nao vou mentir pra voce: ja tentei "parar pra estudar observabilidade" varias
vezes no passado. Mas nem considero. Pelo menos para mim, sempre foi **chato pra
caramba**.

Sem dados reais, tudo fica artificial. Os dados sinteticos, quando e so voce
gerando, acaba ficando monotono. Cade a emocao? 😅

Dessa vez fiz diferente: simplesmente subi um VPS real, com dominio, HTTPS,
proxy reverso com Traefik e tudo que existe no mundo real para manter servidor
de pe. (_Cara, tem VPN via WireGuard, coisa fina_).

A ideia e manter esse servidor ativo enquanto estiver estudando, e alem (se
ninguem derrubar ele antes). Se eu colocar outras aplicacoes nele, a stack LGTM
continua junto. Assim eu ganho sinais mais realistas, inclusive trafego de bot
tentando achar brecha.

E esse e exatamente o ponto: pra estudar observabilidade de verdade, voce
precisa de um servidor de verdade. Dados sinteticos no localhost nao vao te dar
aquele alerta de madrugada que te faz entender porque tudo isso importa.

O servidor que eu estou usando e um **KVM 2** da **Hostinger**. Melhor custo
beneficio para esse tipo de laboratorio — sobra recurso para a stack inteira e
ainda cabe mais coisa.

Se voce quiser montar o mesmo setup, o link e cupom estao aqui:

> Desconto:
> [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
> Cupom: `OTAVIOMIRANDA`

Agora... vamos subir isso tudo na pratica.

## 6. Indo para o terminal (5-10 min): "Git + pull + recipes"

> (Cenas do terminal / SSH no VPS)

A minha ideia e nao perder tempo com infra, codigo, comando. E te dar algo
pronto para voce nao perder duas semanas criando este setup. O projeto inteiro
esta no meu GitHub, o link esta aqui (eu esqueci do link? Certeza que vou
esquecer).

A brincadeira no **VPS** e ridiculamente simples: voce faz o **SSH** na sua
maquina, roda o git clone e entra na pasta. Sem exagero nenhum, ja devo ter
explicado este processo umas 10 vezes no meu canal, exemplos:

- [Docker no VPS + Github Actions para CI/CD (Deploy em Producao)](https://youtu.be/yxxEk68EDgo?si=qu1Wv1v8YlXb7D0J)
- [Docker Swarm com 3 VPS do Zero a Producao](https://www.youtube.com/watch?v=3-MW6pkn7uA)

Pra nao ter que lembrar de comandos gigantes do Docker, eu criei um arquivo
`Justfile` com algumas receitas. E so rodar `just up` (local, seu computador) ou
`just deploy` (no servidor) e ser feliz.

Sem drama, sem ritual estranho de _DevOps_. O Docker Compose vai baixar as
imagens e subir tudo: **Loki**, **Grafana**, **Tempo**, **Mimir**, **Alloy** e a
nossa **API em Python**.

Pronto... e... Subiu!

Agora e so a gente bater no nosso dominio HTTPS. Nos dois videos acima eu
explico como configurar todo o **VPS**. Mesmo assim, aqui esta um
[DEV_GUIDE](https://github.com/luizomf/vps_deploy_template/blob/main/DEV_GUIDE.md)
completo.

### Onde mexer quando precisar

Rapido, so pra voce nao ficar perdido no repositorio:

- Precisa mexer na infra? Pasta `docker/`. La tem o `compose.yaml` que sobe
  tudo, as configs do Alloy, Loki, Tempo e Mimir, e os dashboards do Grafana.
- Precisa mexer no codigo? Pasta `api/`. A telemetria vive em
  `infrastructure/telemetry.py`, os logs e metricas por requisicao ficam em
  `presentation/http.py`.

Simples assim. Dois lugares, duas responsabilidades.

## 7. Tour rapido no Grafana (5-10 min): "Interface sem misterio"

> (Cenas de telas do Grafana)

Essa tela e intimidadora. Mas, brinque com ela! Crie coisas, apague coisas so
para se acostumar. Voce sempre pode usar a minha receita _(vou omitir o nome
para sua seguranca)_ e comecar do zero de novo.

> **Obs.:** e serio, no `Justfile` tem uma receita que detona (APAGA) tudo sem
> perguntar nada. CUIDADO 🚨.

Se voce estiver no seu localhost (com `just up`), ao acessar a porta `3000`, so
digitar `admin` e `admin` para usuario e senha e comecar a brincar.

Em producao, o Grafana fica acessivel apenas pela rede privada do **WireGuard**
(`http://<IP_DO_WIREGUARD>:3000`). Nenhum dominio publico, nenhum firewall pra
configurar, nenhum brute force na tela de login. Se voce esta dentro da VPN,
acessa. Se nao esta, nem sabe que existe.

Se voce quiser expor o Grafana em um dominio publico, da pra fazer via Traefik
com allowlist de IP — mas ai a responsabilidade e sua: firewall, brute force
protection, rate limiting... coisa que foge do escopo desse video.

A API, por outro lado, e publica de proposito (`api.inprod.cloud` via Traefik
com HTTPS). Troque esse dominio no arquivo:
[../docker/compose.kvm2.yaml](../docker/compose.kvm2.yaml)

Ja deixei os Data Sources conectados para voce. **Loki**, **Tempo** e **Mimir**
ja estao conversando com o **Grafana** nativamente.

Tambem deixei tres dashboards dentro de 'LGTM Demo' prontas. Mas, antes de sair
criando um monte de coisas, primeiro use o que ja temos para ver como tudo se
encaixa.

E nao se apegue muito. Voce encontra milhares de dashboards do Grafana pela
Internet afora. E so baixar e importar um misero arquivo `.json`.

## 8. Fechamento (2-3 min): "Do grep ao painel"

Lembra do cara que acordava de madrugada pra rodar `grep` em producao? Que
perdia horas navegando entre nodes tentando juntar pedacos de log?

Esse cara agora tem um painel que mostra metricas, traces e logs no mesmo lugar.
Tem alerta configurado que avisa antes do cliente reclamar. Tem um servidor real
gerando dados reais, inclusive bot batendo na porta.

Esse cara sou eu. E esse setup e o mesmo que te entreguei aqui.

Claro que nao da pra ensinar Engenharia de Observabilidade inteira em um video.
E eu tambem ainda preciso aprender muito sobre isso para cogitar te ensinar algo
util. Mas confessa: essa base aqui ja te tira do zero absoluto e te entrega uma
arquitetura moderna, funcional e que voce pode evoluir no seu trabalho ou nos
seus projetos reais.

_(A epoca de cacar erro com `grep` e `tail` acabou, meu amigo. O pior e que eu
gosto desses comandos 🤫)_

Se a sua cabeca ferveu de ideias, comenta ai embaixo qual o proximo nivel que
voce quer ver: alertas avancados mandando mensagem no Telegram de madrugada?
Instrumentacao mais pesada no codigo Python? Pede ai.

E se voce quer sentir a dor (e a alegria) de ver dados reais caindo no seu
painel num servidor exposto pra internet, os VPS da Hostinger com meu cupom
exclusivo estao aqui:

> Desconto:
> [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
> Cupom: `OTAVIOMIRANDA`

Faz o laboratorio, depois me conta se os hackers nao tentaram derrubar seu
servidor!

Aquele abraco e ate o proximo video.
