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

## 3. O que é cada peça? (2 min): “Loki, Grafana, Tempo e Mimir”

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

## 5. Como conecta tudo (1-2 min): “OpenTelemetry + Alloy”

Aqui entra a cola do sistema: OpenTelemetry e Alloy. A aplicação emite sinais
com OpenTelemetry. O Alloy coleta e roteia esses sinais para Loki, Tempo e
Mimir.

Fluxo resumido: request entra na API, sinais saem da API, Alloy distribui,
Grafana mostra.

## 6. Como eu estudo isso (2-3 min): “ambiente real, risco controlado”

A forma que funciona para mim é estudar em servidor real. Se eu errar config, eu
perco dado de laboratório, não dado crítico.

Isso me dá cenário real: tráfego real, comportamento real, tentativa de ataque
real, erro real. Para mim, isso ensina mais rápido do que ficar só no ambiente
perfeito.

E é aqui que entra a Hostinger, que eu uso para subir esse ambiente de estudo
com custo viável.

## 7. Setup local rápido (1-2 min): “subo, valido e sigo”

Localmente eu subo o projeto, gero tráfego e valido se os sinais estão chegando.
Sem detalhar código no vídeo, só mostrando que a base funciona.

A parte passo a passo fica na documentação em Markdown para quem quiser
reproduzir tudo com calma.

## 8. Indo para VPS (1-2 min): “Git + pull + recipes”

No VPS, como o projeto está no GitHub, é fluxo simples: pull e recipes do
`just`. Sem drama, sem ritual estranho.

Subiu, validou portas e segurança, abriu dashboard, acabou.

## 9. Arquivos importantes (1 min): “onde mexer quando precisar”

Aqui eu mostro superficialmente os arquivos principais: compose, configs do
collector, dashboards e docs. A ideia não é tutorial. É só te dar mapa mental de
manutenção.

## 10. Tour rápido no Grafana (2 min): “interface sem mistério”

Eu mostro por cima: data sources, explore, dashboards e alerting. Também deixo
claro que dashboard não é sagrado: você pode montar a sua ou importar pronta.

O objetivo aqui é entender leitura e correlação, não decorar clique.

## 11. Fechamento (1 min): “gancho para próximos vídeos”

Claro que não dá para cobrir observabilidade inteira em um vídeo só. Mas com
essa base você já sai do zero com algo funcional e evolutivo.

Se fizer sentido, comenta o que você quer no próximo: alertas mais avançados,
SLO, instrumentação mais profunda, ou versão com múltiplos serviços.

E se você for subir isso em VPS, o link da Hostinger está na descrição.
