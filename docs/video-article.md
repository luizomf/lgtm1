## 1. Intro (1-2 min): “reagir a log é caro e lento”

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

Preciso sair do modo “reagir ao erro” e ir para o modo “entender o sistema antes
da falha escalar”.

Observabilidade, por si só, não deve resolver 100% dos problemas. Ainda terei
sustos. Mas, tenho certeza que terei uma visão antecipada do sistema.

Com essa visão, consigo melhorar continuamente métricas, alertas e decisões
técnicas.

## 2. O que vou usar? (1 min): “LGTM Stack como base!”

Existem muitas opções para observabilidade. Depois de pesquisar bastante, decidi
focar na LGTM Stack.

Observei comunidade, documentação e potencial de escala. Na minha visão, ela
funciona muito bem para estudo, funciona para projetos pequenos e também pode
evoluir para cenários maiores com ajustes no futuro.

A LGTM Stack tem quatro peças principais, cada uma com uma responsabilidade
clara:

- Loki
- Grafana
- Tempo
- Mimir

## 3. O que é cada peça? (1 min): “Loki, Grafana, Tempo e Mimir”

Loki é onde ficam os logs. Grafana é a interface que centraliza visualização,
exploração e alertas. Tempo é o backend de traces, que mostra o caminho de uma
requisição. Mimir é o backend de métricas, que mostra comportamento ao longo do
tempo.

Essas peças separadas formam os três pilares da observabilidade: logs, traces e
métricas.

E é justamente essa separação que torna o diagnóstico mais rápido e mais
confiável. Explico...

## 4. Por que tantas coisas? (2 min): “log sozinho não fecha diagnóstico”

Se você já fez debug em produção, sabe que log responde muito bem o “o que
aconteceu”.

Mas aí vêm perguntas que log sozinho não responde tão bem:

- Quantas vezes isso aconteceu na semana?
- Qual foi a tendência ao longo do tempo?
- Em qual etapa da requisição o problema começou?

E aqui começa a dor real.

Tem gente que diz que “log resolve tudo”. Eu responderia com o menor violino do
mundo... ou melhor, o menor cluster do mundo.

Eu só estou estudando isso mais a fundo agora porque, nas últimas semanas, sofri
bastante tentando buscar log na mão em cluster pequeno, com 3 nodes.

Agora imagina isso em ambientes com 12, 24, 48+ nodes. Não existe mundo real
onde você vai fazer `tail -f` em tudo e chamar isso de estratégia.

Com observabilidade, entram as métricas (Mimir/Prometheus): elas mostram
frequência e tendência. Exemplo: “todo dia, das 20h às 00h, o tráfego do
carrinho sobe 50%”.

Aí você cruza com negócio: “as vendas também subiram 50% ou só o erro
aumentou?”. Esse tipo de pergunta muda decisão técnica e decisão de produto.

Além de logs e métricas, temos traces (Tempo): o caminho da requisição ponta a
ponta. Você consegue ver onde ficou lento, onde falhou e qual serviço/etapa
puxou tudo para baixo.

Quando junta os três, você para de chutar e começa a diagnosticar com contexto.

E fecha com alertas: em vez de descobrir pelo cliente reclamando, você é avisado
antes.

## 5. Como tudo se conecta? (1-2 min): “OpenTelemetry + Alloy”

Por muito tempo, a instrumentação da aplicação ficava acoplada ao provedor do
serviço: Datadog, New Relic, entre outros (o famoso _vendor lock-in_).

Funcionava, mas migrar depois era doloroso, porque parte da aplicação ficava
presa ao padrão daquele fornecedor.

### OpenTelemetry

É aí que entra o OpenTelemetry.

Ele não é banco de dados, não é dashboard e não é storage de logs. OpenTelemetry
é um padrão aberto para gerar e transportar telemetria de forma consistente.

Na prática: minha aplicação emite sinais em um padrão neutro, e eu escolho
depois para onde enviar.

### Alloy

Só que os sinais não vêm de um lugar só.

Métrica pode vir da aplicação, do container, da VPS ou do cluster. Log pode vir
da stdout do container. Trace pode vir da instrumentação HTTP e de spans
manuais.

Sem um coletor central, você acaba espalhando configuração, duplicando esforço e
aumentando chance de erro.

O **Grafana Alloy** resolve isso.

Ele funciona como _o roteador da telemetria_: recebe dados do **OpenTelemetry**
e de outras fontes (como logs da engine Docker), aplica o pipeline e entrega
cada tipo no backend certo:

- logs para `Loki`
- métricas para o `Mimir`
- e traces para `Tempo`

## 6. Como eu estudo isso? (2-3 min): “Em ambiente real, com risco controlado”

Não vou mentir pra você: já tentei “parar pra estudar observabilidade” várias
vezes no passado. Mas nem considero. Pelo menos para mim, sempre foi **chato pra
caramba**.

Sem dados reais, tudo fica artificial. Os dado sintéticos, quando é só você
gerando, acaba ficando monótono. Cadê a emoção? 😅

Dessa vez fiz diferente: simplesmente subi um VPS real, com domínio, HTTPS,
proxy reverso com Traefik e tudo que existe no mundo real para manter servidor
de pé. (_Cara, tem VPN via WireGuard, coisa fina_).

A ideia é manter esse servidor ativo enquanto estiver estudando, e além (se
ninguém derrubar ele antes). Se eu colocar outras aplicações nele, a stack LGTM
continua junto. Assim eu ganho sinais mais realistas, inclusive tráfego de bot
tentando achar brecha.

Por falar em **VPS**, não posso deixar a **Hostinger** fora da conversa. Lá você
tem opções de servidores para vários cenários. A que eu mais recomendo para
começar esse tipo de laboratório é o **KVM 2** (pode confirmar, melhor custo
benefício).

Se você estiver precisando de servidor agora, o link e cupom estão abaixo:

> Desconto:
> [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
> Cupom: `OTAVIOMIRANDA`

Agora... vamos subir isso tudo na prática. Não se preocupe se não souber nada,
todos estamos aprendendo aqui. E eu vou usar o mesmo servidor para isso.

## 7. Indo para VPS (1-2 min): “Git + pull + recipes”

> Cena: Você no terminal da sua máquina conectando via SSH na Hostinger,
> copiando o repo do Github e rodando o comando.

A minha ideia é não perder tempo com infra, código, commando. É te dar algo
pronto para você não perder duas semanas criando este setup. Este projeto
inteiro está no meu GitHub, o link está aqui (eu esqueci do link? Certeza que
vou esquecer).

A brincadeira no **VPS** é ridiculamente simples: você faz o **SSH** na sua
máquina, roda o git clone e entra na pasta. Sem exageiro nenhum, já devo ter
explicado este processo umas 10 vezes no meu canal, exemplos:

- [Docker no VPS + Github Actions para CI/CD (Deploy em Produção)](https://youtu.be/yxxEk68EDgo?si=qu1Wv1v8YlXb7D0J)
- [Docker Swarm com 3 VPS do Zero à Produção](https://www.youtube.com/watch?v=3-MW6pkn7uA)

Pra não ter que lembrar de comandos gigantes do Docker, eu criei um arquivo
`Justfile` com algumas receitas. É só rodar `just up` (local, seu computador) ou
`just deploy` (no servidor) e ser feliz.

Sem drama, sem ritual estranho de _DevOps_. O Docker Compose vai baixar as
imagens do **Loki**, **Grafana**, **Tempo**, **Mimir** e **Alloy** e subir a
nossa **API em Python** (LGTM Stack).

Pronto... e... Subiu!

Agora é só a gente bater no nosso domínio HTTPS. Nos dois vídeos acima eu
explico como configurar todo o **VPS**. Mesmo assim, aqui está um
[DEV_GUIDE](https://github.com/luizomf/vps_deploy_template/blob/main/DEV_GUIDE.md)
completo.

## Arquivos importantes (1 min): “Onde mexer quando precisar”

> (Cena: Seu VSCode aberto, você clica rapidamente no compose.yaml e no
> config.alloy, só pra mostrar onde fica).

Antes de te mostrar o painel bonitão e funcionando, vou só dar um tour mental do
repositório. Assim, quando você for futricar nas configurações, pelo menos sabe
onde mexer.

Não vou fazer um tutorial linha a linha aqui. Eu também estou estudando sobre
isso e muito do que tem aqui veio da própria documentação via `CTRL C` e
`CTRL V` (_no futuro vou fazer conteúdo técnico sobre observabilidade_). Mas,
entenda...

Se você abrir a pasta `docker/`, tudo o que importa para os containers está
aqui. O arquivo `compose.yaml` é quem sobe as 5 ferramentas.

Se quiser mudar uma porta ou adicionar alguma senha, é lá (também tem o arquivo
`.env.example` para secrets, só copiar para `.env`).

O arquivo `alloy-config.alloy` é a configuração do **Grafana Alloy** que eu
expliquei lá atrás. É nele que tem as regras dizendo que o log do docker tem que
ir pro Loki, e que o Trace tem que ir pro Tempo.

Na nossa API, os arquivos Python que tocam em logs e telemetria são:

- [../api/src/api/presentation/http.py](../api/src/api/presentation/http.py):
  emite logs (`logger.log(...)`) e chama telemetria por requisição
  (`annotate_current_span`, `record_scenario`, `current_trace_ids`).
- [../api/src/api/infrastructure/telemetry.py](../api/src/api/infrastructure/telemetry.py):
  configura OpenTelemetry (traces/métricas), cria instrumentos e exporta via
  OTLP.
- [../api/src/api/main.py](../api/src/api/main.py): inicializa logging
  (`_configure_logging`) e ativa a telemetria (`setup_telemetry(app)`).

Simples assim. Precisou mexer na infra? Pasta docker. Precisou mexer no código?
Pasta `api`.

## Tour rápido no Grafana (2 min): “Interface sem mistério”

> (Cena: Tela principal do Grafana gravando. Você navega solto, clica no
> Dashboard Provisionado, mostra um erro vermelho).

Essa tela é intimidadora. Mas, brinque com ela! Crie coisas, apague coisas só
para se acostumar. Você sempre pode usar a minha receita _(vou omitir o nome
para sua segurança)_ e começar do zero de novo.

> **Obs.:** é sério, no `Justfile` tem uma receita que detona (APAGA) tudo sem
> perguntar nada. CUIDADO 🚨.

Se você estiver no seu localhost (com `just up`), ao acessar a porta `3000`, só
digitar `admin` e `admin` para usuário e senha e começar a brincar.

Em produção, você precisa configurar o domínio que você ganhou da **Hostinger**
para que todo subdomínio aponte para o IP do seu VPS. Falo sobre isso lá nos
vídeo bem para trás. Por exemplo, eu peguei um domínio **inprod.cloud**, para o
Grafana, usei dois subdomínios:

- api.inprod.cloud
- lgtm.inprod.cloud

Troque esses domínios no arquivo:
[../docker/compose.kvm2.yaml](../docker/compose.kvm2.yaml)

Já deixei os Data Sources conectados para você. **Loki**, **Tempo** e **Mimir**
já estão conversando com o **Grafana** nativamente.

Também deixei três dashboards dentro de 'LGTM Demo' prontas. Tudo na pasta
`./docker`. Mas, antes de sair tentando criar um monte de coisas, primeiro use o
que já temos disponível para ver como tudo se encaixa.

E não se apegue muito. Você encontra milhares de `dashboards` do Grafana prontas
pela Internet à fora. É só baixar e importar um mísero arquivo `.json`.

## 10. Fechamento (1 min): “Gancho para próximos vídeos”

> (Cena: Você full screen de novo fechando o vídeo).

Ufa! Claro que não dá pra ensinar Engenharia de Observabilidade inteira em um
vídeo de 15 minutos. E eu também ainda preciso aprender muito sobre isso para
coagitar te ensinar algo útil.

Mas confessa: essa base aqui já te tira do zero absoluto e te entrega uma
arquitetura moderna, funcional e que você pode evoluir no seu trabalho ou nos
seus projetos reais em casa. A época de caçar erro com `grep` e `tail` acabou,
meu amigo. _(o pior é que eu gosto desses comandos 🤫)_

Se a sua cabeça ferveu de ideias, comenta aí embaixo qual o próximo nível que
você quer ver aqui: Quer que eu mostre como criar alertas avançados pra mandar
mensagem no Telegram de madrugada? Quer instrumentação mais pesada no código
Python? Pede aí.

E não esquece: se quiser tirar isso da teoria e sentir a dor (e a alegria) de
ver dados reais caindo no seu painel num servidor exposto pra internet, o link
dos VPS parrudos da Hostinger com meu cupom exclusivo tão aqui:

> Desconto:
> [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
> Cupom: `OTAVIOMIRANDA`

Faz o laboratório, depois me conta se os hackers não tentaram derrubar seu
servidor!

Aquele abraço e até o próximo vídeo.
