## 1. Intro (1-2 min): “reagir a log é caro e lento”

> (SEO para o vídeo) Finalmente decidi estudar observabilidade mais a fundo.
>
> Neste vídeo, vou te mostrar como estou usando a stack LGTM (Loki, Grafana,
> Tempo e Mimir) em estudos reais, inclusive em servidor real. Também vou deixar
> todas as configurações e explicações para você não começar no escuro.

---

Se você trabalha com aplicação real, provavelmente já viveu isso: dá erro, você
corre para os logs, tenta entender no susto, corrige na correria e torce para
não acontecer de novo.

Normal. Eu também fiz isso por muito tempo.

O problema é que isso custa caro: estresse, tempo e paz. Pode te arrancar da
cama de madrugada, interromper férias, ou destruir teu foco no meio de qualquer
momento importante.

Depois de anos futricando logs com `grep`, `ps`, `tail` e afins, eu decidi
estudar observabilidade de verdade.

Quero sair do modo “reagir ao erro” e ir para o modo “entender o sistema antes
da falha escalar”.

Observabilidade não resolve 100% dos problemas, mas me dá visão antecipada do
sistema. E com essa visão, eu consigo melhorar continuamente métricas, alertas e
decisões técnicas.

## 2. O que vou usar (1 min): “LGTM como base”

Depois de pesquisar bastante, eu decidi focar na stack LGTM, porque ela é
objetiva e escalável. Funciona para estudo, funciona para projeto pequeno, e tem
caminho para crescer depois.

LGTM aqui significa: Loki, Grafana, Tempo e Mimir.

## 3. O que é cada peça (2 min): “Loki, Grafana, Tempo, Mimir”

Loki é onde ficam os logs. Grafana é a interface que junta tudo e permite
explorar os dados. Tempo é para traces, que mostram o caminho de uma requisição.
Mimir é para métricas, que mostram comportamento ao longo do tempo.

Então não é ferramenta aleatória: é cada peça cumprindo um papel específico.

## 4. Por que tantas coisas? (2 min): “log sozinho não fecha diagnóstico”

Log responde “o que aconteceu”. Métrica responde “com que frequência e qual
tendência”. Trace responde “onde a requisição ficou lenta ou quebrou”.

Quando você junta os três, você para de adivinhar.

E entra um ponto importante: alertas. Você define regra para ser avisado antes
de virar caos.

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
