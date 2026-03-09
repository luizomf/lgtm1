# Guia para o desenvolvedor

> **NOTA:** solicitei ao Codex para fazer uma explicação mais detalhada em cada
> comando que usei. Espero que ajude ainda mais.

Use este guia para aplicar os comandos passo a passo no seu próprio servidor.

Estou usando o [KVM 2 da Hostinger](https://hostinger.com/otaviomiranda), mas
isso deve funcionar em qualquer servidor.

Antes de começar, três combinados importantes:

- a ordem dos passos importa; siga de cima para baixo
- quando um comando tiver valores de exemplo, troque apenas o valor, não a
  estrutura do comando
- salvo quando eu avisar o contrário, os comandos estão sendo executados na
  VPS; no começo deles, você ainda estará como `root`

**WIP: o trecho abaixo será substituído quando o vídeo for gravado.**

```md
Também detalhei este processo em vídeo caso queira assistir:

[![YouTube Video](http://img.youtube.com/vi/yxxEk68EDgo/hqdefault.jpg)](https://youtu.be/yxxEk68EDgo 'Crie seu próprio cloud em VPS')

- Link: [https://youtu.be/yxxEk68EDgo](https://youtu.be/yxxEk68EDgo)
```

---

## Onde contratar um servidor?

Se você busca um servidor **robusto, confiável e com preço imbatível**,
recomendo o [KVM 2 da Hostinger](https://hostinger.com/otaviomiranda). Você pode
escolher outros KVMs maiores ou menores conforme a necessidade. No entanto, o
custo benefício do KVM 2 é o melhor (você vai perceber isso por conta própria).

**Bônus Exclusivo:** Consegui **10% de desconto adicional** para vocês. Use os
dados abaixo com planos de 12 meses (1 ano) ou 24 meses (2 anos).

- [https://hostinger.com/otaviomiranda](https://hostinger.com/otaviomiranda)
- Cupom: `OTAVIOMIRANDA`

---

## Configurando domínio e DNS

Antes de publicar qualquer aplicação na VPS, você precisa garantir que o seu
domínio aponta para o IP público do servidor. Isso é importante porque, mais
adiante, serviços como proxy reverso, HTTPS e certificados TLS dependem desse
apontamento para funcionar corretamente.

Se você estiver usando um VPS da Hostinger, verifique no painel se o seu plano
inclui um domínio gratuito. Quando essa opção estiver disponível, faça o
resgate do domínio primeiro. Depois que o domínio estiver registrado, abra a
área de gerenciamento dele e procure a opção `DNS / Nameservers`.

No meu caso, eu configurei os registros abaixo:

- Tipo: `A`, Nome: `*`, Prioridade: `0`, Conteúdo: `76.13.71.178`, TTL:
  `14400`
- Tipo: `A`, Nome: `@`, Prioridade: `0`, Conteúdo: `76.13.71.178`, TTL: `60`

Esses valores funcionam assim:

- `Tipo A` informa que o domínio ou subdomínio deve apontar para um endereço
  IPv4.
- `Nome @` representa o domínio principal, sem subdomínio.
- `Nome *` representa um wildcard, ou seja, vários subdomínios podem acabar
  apontando para o mesmo IP.
- `Conteúdo` é o IP público da sua VPS.
- `TTL` é o tempo de cache da resposta DNS.

No seu caso, você deve trocar o IP `76.13.71.178` pelo IP público real da sua
VPS. Esse IP muda de servidor para servidor.

Também é importante não sair alterando todos os registros DNS da zona. Em muitos
casos, o provedor cria registros adicionais por padrão, e apagar ou modificar
esses registros sem saber exatamente o que eles fazem pode quebrar outros
serviços ligados ao domínio.

Se você estiver usando outro provedor, a ideia é a mesma: crie um registro do
tipo `A` apontando o domínio ou subdomínio desejado para o IP público da sua
VPS.

Se você pretende usar apenas um subdomínio específico, como `grafana.seu-dominio.com`,
o mais seguro costuma ser criar o registro apenas para esse subdomínio. O uso de
`*` pode ser conveniente, mas também pode fazer outros subdomínios apontarem
para a VPS sem que isso seja o que você queria. Se você não tiver certeza,
prefira configurar apenas os subdomínios que realmente vai usar.

Depois de salvar os registros, espere a propagação do DNS. Em alguns casos isso
acontece rápido, mas também pode levar mais tempo, dependendo do TTL e do
provedor. O resultado esperado é que o seu domínio, ou o subdomínio escolhido,
comece a resolver para o IP da sua VPS.

Se você quiser uma checagem simples antes de continuar, o ideal é confirmar que
o domínio já resolve para o IP correto. Se o domínio ainda estiver apontando
para outro lugar, etapas mais adiante, como TLS automático com Let's Encrypt,
podem falhar mesmo que o restante da configuração esteja certo.

---

## Configurações iniciais

Quando um servidor VPS é criado, o provedor normalmente libera acesso inicial
com o usuário `root`. Esse acesso é útil para a configuração do ambiente, mas
não é uma boa ideia manter esse fluxo como acesso principal no dia a dia. Mesmo
assim, neste começo ele ajuda bastante, porque ainda não configuramos usuário
próprio, chave SSH e demais ajustes de segurança.

Se você estiver usando a Hostinger, existe um atalho muito útil para essa etapa.
No hPanel, dentro da tela de gerenciamento da VPS, há um botão chamado
`Terminal` no canto superior direito. Esse botão abre um terminal web já
autenticado como `root`, sem exigir senha nem chave SSH configurada. Isso
facilita bastante as primeiras alterações no sistema operacional.

Se preferir, a Hostinger também oferece uma alternativa no próprio painel para
configurar o hostname. Em `VPS > Configurações > Configurações de VPS`, o painel
valida se o domínio realmente pertence a você, ou se ele já aponta para a VPS,
e então pode aplicar essa configuração automaticamente no sistema. Se essa
validação funcionar no seu caso, você pode usar o painel em vez do comando
`hostnamectl`.

Até o final desta parte de preparação inicial, considere que os comandos estão
sendo executados como `root`. Mais adiante, quando a chave SSH estiver pronta,
o fluxo passa para o seu usuário administrativo.

### Definindo o hostname do servidor

O primeiro ajuste importante é definir um hostname claro para o servidor. Isso
ajuda na identificação da máquina, facilita administração futura e evita confusão
quando você tiver mais de um servidor.

Execute o comando abaixo:

```bash
hostnamectl set-hostname kvm2
```

Esse comando faz o seguinte:

- `hostnamectl` é a ferramenta usada para consultar e alterar o hostname do
  sistema.
- `set-hostname` informa que você quer definir um novo nome para o servidor.
- `kvm2` é o hostname escolhido neste exemplo.

No seu caso, você deve trocar `kvm2` pelo nome que quiser usar para a sua VPS.
Escolha um nome simples, curto e fácil de reconhecer.

Depois disso, ajuste o arquivo `/etc/hosts` para associar corretamente o nome da
máquina ao domínio.

Abra o arquivo com o editor que preferir:

```bash
vim /etc/hosts
```

Ou:

```bash
nano /etc/hosts
```

O objetivo aqui é localizar a linha `127.0.1.1` ou outra linha equivalente que
represente o hostname local da máquina, e alterá-la para algo assim:

```text
127.0.1.1       kvm2.inprod.cloud       kvm2
```

Essa linha faz o seguinte:

- `127.0.1.1` é um endereço local usado pelo sistema para resolver o hostname da
  própria máquina.
- `kvm2.inprod.cloud` é o nome completo do host, também chamado de FQDN
  (`Fully Qualified Domain Name`).
- `kvm2` é o nome curto da máquina.

No seu caso, você precisa adaptar duas partes:

- troque `kvm2` pelo hostname escolhido para o seu servidor
- troque `inprod.cloud` pelo seu domínio real

No meu exemplo, `inprod.cloud` foi o domínio gratuito que registrei junto com a
VPS. Se você estiver usando outro domínio, ou outro provedor, use os valores
correspondentes ao seu ambiente.

O resultado esperado é que o servidor passe a se identificar corretamente com o
nome curto e com o nome completo, o que ajuda em ferramentas do sistema,
resolução local de nomes e configuração de alguns serviços.

Se quiser conferir depois, você pode executar:

```bash
hostnamectl
```

Esse comando exibe as informações atuais de hostname do sistema. O esperado é
ver o nome que você acabou de configurar.

---

## Criando um usuário administrativo

Depois das configurações iniciais, o próximo passo é criar um usuário próprio
para administração da VPS. Isso é importante porque o acesso direto com
`root` deve ser evitado no uso diário. A ideia é usar `root` apenas no começo,
enquanto você prepara a máquina, e depois trabalhar com um usuário normal com
privilégios administrativos.

Antes de criar o usuário, defini uma variável com o nome desejado:

```bash
export YOUR_USERNAME="luizotavio"
```

Esse comando faz o seguinte:

- `export` cria uma variável de ambiente disponível na sessão atual do shell.
- `YOUR_USERNAME` é o nome da variável.
- `"luizotavio"` é o valor definido para ela.

No seu caso, você deve trocar `luizotavio` pelo nome do usuário que deseja
criar na VPS.

Definir essa variável não é obrigatório, mas ajuda a reutilizar o mesmo nome
nos próximos comandos sem precisar digitá-lo manualmente toda vez.

### Criando o usuário

Agora crie o usuário com diretório home e shell padrão:

```bash
useradd -m -s /bin/bash $YOUR_USERNAME
```

Esse comando faz o seguinte:

- `useradd` cria um novo usuário no sistema.
- `-m` cria automaticamente o diretório home do usuário.
- `-s /bin/bash` define o `bash` como shell padrão.
- `$YOUR_USERNAME` usa o valor salvo na variável que você definiu no passo
  anterior.

O resultado esperado é a criação do novo usuário já com uma pasta própria em
`/home/NOME_DO_USUARIO`.

### Adicionando privilégios administrativos

Depois disso, adicione o usuário ao grupo `sudo`:

```bash
usermod -aG sudo $YOUR_USERNAME
```

Esse comando faz o seguinte:

- `usermod` altera configurações de um usuário existente.
- `-aG` adiciona o usuário a grupos suplementares sem remover os grupos atuais.
- `sudo` é o grupo que permite executar comandos administrativos com `sudo`.

O resultado esperado é que esse novo usuário possa administrar o sistema usando
`sudo`, sem precisar permanecer logado como `root`.

### Adicionando o usuário ao grupo do Docker

Se o Docker já estiver instalado na VPS, você também pode adicionar o usuário
ao grupo `docker`:

```bash
usermod -aG docker $YOUR_USERNAME
```

Esse comando permite executar comandos do Docker sem precisar prefixar tudo com
`sudo`.

Importante: esse passo depende da existência do grupo `docker`. Se o Docker
ainda não foi instalado, ou se esse grupo ainda não existe, esse comando pode
falhar. Nesse caso, basta pular este passo por enquanto e executá-lo depois que
o Docker estiver instalado.

### Definindo uma senha para o novo usuário

Agora defina a senha:

```bash
passwd $YOUR_USERNAME
```

Esse comando faz o seguinte:

- `passwd` altera ou define a senha de um usuário.
- `$YOUR_USERNAME` indica qual conta será configurada.

Depois de executar esse comando, o sistema vai pedir que você digite a senha e,
em seguida, confirme a mesma senha mais uma vez.

Escolha uma senha forte. Evite senhas curtas, previsíveis ou reutilizadas em
outros serviços.

### Testando a troca para o novo usuário

Por fim, teste a mudança de usuário:

```bash
su $YOUR_USERNAME
```

Esse comando faz o seguinte:

- `su` troca o usuário atual no terminal.
- `$YOUR_USERNAME` informa para qual usuário você quer trocar.

O resultado esperado é que o terminal passe a funcionar como o novo usuário,
permitindo verificar se a conta foi criada corretamente.

Se tudo der certo, você já terá um usuário próprio para continuar a
configuração da VPS com mais segurança.

Se quiser voltar para o `root` nesse terminal depois do teste, use `exit`.
Daqui em diante, o fluxo ideal é seguir usando o seu usuário administrativo e
prefixar com `sudo` apenas o que realmente exigir privilégio elevado.

---

## Configurando acesso SSH com chave

Depois de criar o novo usuário, o próximo passo é configurar o acesso SSH com
chave assimétrica. Isso permite acessar a VPS com mais praticidade e, mais
adiante, ajuda a reduzir a dependência de autenticação por senha.

Os comandos abaixo foram executados no computador local, e não dentro da VPS.

### Gerando uma chave SSH no computador local

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_hostinger -C "USUARIO"
```

Esse comando faz o seguinte:

- `ssh-keygen` gera um novo par de chaves SSH.
- `-t ed25519` define o algoritmo da chave como `ed25519`.
- `-f ~/.ssh/id_hostinger` define o caminho e o nome do arquivo da chave.
- `-C "USUARIO"` adiciona um comentário à chave para facilitar identificação.

O resultado esperado é a criação de dois arquivos no seu computador local:

- `~/.ssh/id_hostinger`
- `~/.ssh/id_hostinger.pub`

No seu caso, adapte o comentário `"USUARIO"` como preferir. Ele não interfere
na autenticação, mas ajuda a identificar a chave depois.

### Copiando a chave pública para a VPS

```bash
ssh-copy-id -i ~/.ssh/id_hostinger.pub USUARIO@IP_OU_HOST_DO_VPS
```

Esse comando faz o seguinte:

- `ssh-copy-id` envia sua chave pública para o servidor remoto.
- `-i ~/.ssh/id_hostinger.pub` informa qual chave pública será copiada.
- `USUARIO@IP_OU_HOST_DO_VPS` informa o usuário remoto e o endereço da VPS.

Depois de executar esse comando, digite a senha do usuário quando o sistema
pedir. Essa senha é a senha que você definiu com `passwd` para o novo usuário.

O resultado esperado é que a chave pública seja adicionada ao arquivo
`~/.ssh/authorized_keys` do usuário remoto, liberando autenticação por chave.

No seu caso, você precisa adaptar:

- `USUARIO` para o nome do usuário criado na VPS
- `IP_OU_HOST_DO_VPS` para o IP público da VPS ou para o domínio/subdomínio que
  já estiver apontando corretamente para ela

Se o DNS ainda não tiver propagado, prefira usar o IP da VPS nesse momento.

### Criando um atalho no arquivo de configuração SSH

Depois disso, no seu computador local, abra o arquivo `~/.ssh/config` e adicione
uma entrada como esta:

```sshconfig
Host kvm2
  IgnoreUnknown AddKeysToAgent,UseKeychain
  AddKeysToAgent yes
  HostName inprod.cloud
  User luizotavio
  Port 22
  IdentityFile ~/.ssh/id_hostinger
```

Esse bloco faz o seguinte:

- `Host kvm2` cria um apelido para a conexão.
- `IgnoreUnknown AddKeysToAgent,UseKeychain` evita erro em ambientes onde essas
  opções não existirem.
- `AddKeysToAgent yes` adiciona a chave ao agente SSH quando ela for usada.
- `HostName inprod.cloud` define o endereço real do servidor.
- `User luizotavio` define o usuário remoto.
- `Port 22` define a porta SSH usada na conexão.
- `IdentityFile ~/.ssh/id_hostinger` informa qual chave privada usar.

No seu caso, você deve adaptar:

- `kvm2` para o apelido que quiser usar localmente
- `inprod.cloud` para o domínio, subdomínio ou IP da sua VPS
- `luizotavio` para o nome do seu usuário remoto
- `~/.ssh/id_hostinger` para o caminho da sua chave, caso você tenha usado outro
  nome

Depois disso, o acesso pode ser feito com um comando muito mais simples:

```bash
ssh kvm2
```

O resultado esperado é que você consiga entrar na VPS usando apenas o apelido
definido no arquivo `~/.ssh/config`.

### Fazendo a primeira atualização já pela nova sessão SSH

Depois de configurar o acesso SSH, atualize os pacotes instalados na VPS:

```bash
sudo apt update && sudo apt upgrade -y
```

Esse comando faz o seguinte:

- `sudo` executa o comando com privilégios administrativos.
- `apt update` atualiza a lista de pacotes disponíveis nos repositórios.
- `&&` executa o segundo comando apenas se o primeiro terminar com sucesso.
- `apt upgrade -y` instala as atualizações disponíveis e responde `yes`
  automaticamente às confirmações.

O resultado esperado é que a VPS instale atualizações de segurança, correções e
versões mais recentes dos pacotes já presentes no sistema.

Dependendo do estado da máquina, esse processo pode levar alguns minutos.

Não estranhe se comandos de atualização aparecerem de novo no guia. Isso
aconteceu de fato no fluxo original e, em alguns pontos, foi útil para garantir
que o sistema e os repositórios estivessem no estado esperado antes de instalar
novos componentes.

---

## Atualização e pacotes básicos

Nesta etapa, a ideia é garantir que a VPS esteja com o sistema atualizado,
fuso horário configurado corretamente e algumas ferramentas básicas instaladas.
Esses pacotes ajudam bastante na administração do servidor, inspeção de
arquivos, execução de scripts e compilação de dependências nativas quando isso
for necessário.

Se você estiver configurando mais de uma VPS, repita estes comandos em todas
elas.

### Definindo o fuso horário em uma variável

```bash
export TIMEZONE='America/Sao_Paulo'
```

Esse comando faz o seguinte:

- `export` cria uma variável de ambiente para a sessão atual.
- `TIMEZONE` é o nome da variável.
- `'America/Sao_Paulo'` é o valor usado neste exemplo.

No seu caso, troque `America/Sao_Paulo` pelo fuso horário correto da sua região,
se necessário.

Definir o valor em uma variável ajuda a reutilizar o mesmo dado no comando que
aplica o timezone mais adiante.

### Atualizando repositórios e pacotes do sistema

```bash
sudo apt update -y
sudo apt upgrade -y
```

Esses comandos fazem o seguinte:

- `sudo` executa os comandos com privilégios administrativos.
- `apt update` atualiza a lista de pacotes disponíveis nos repositórios.
- `apt upgrade -y` instala as atualizações disponíveis e responde `yes`
  automaticamente às confirmações.

Observação importante: o `-y` em `apt update -y` normalmente é desnecessário,
porque esse comando não costuma pedir confirmação. Mesmo assim, estou mantendo
o comando aqui exatamente na forma em que ele foi executado.

O resultado esperado é que a VPS receba correções de segurança, atualizações de
pacotes já instalados e metadados mais recentes dos repositórios.

### Instalando ferramentas essenciais

```bash
sudo apt install -y vim curl ca-certificates htop python3 \
python3-dev acl build-essential tree just
```

Esse comando faz o seguinte:

- `apt install -y` instala pacotes sem pedir confirmação interativa.
- `vim` instala um editor de texto no terminal.
- `curl` permite fazer requisições HTTP e baixar conteúdo pela linha de comando.
- `ca-certificates` instala certificados raiz usados para conexões HTTPS.
- `htop` oferece uma visualização interativa de processos e consumo de recursos.
- `python3` instala o interpretador Python 3.
- `python3-dev` instala arquivos de desenvolvimento do Python, úteis para
  dependências que precisam compilar extensões nativas.
- `acl` instala ferramentas para controle mais detalhado de permissões.
- `build-essential` instala compiladores e ferramentas básicas de build.
- `tree` exibe estruturas de diretórios em formato de árvore.
- `just` instala o task runner que será usado bastante ao longo do projeto.

O caractere `\` no fim da primeira linha indica apenas continuação do comando na
linha seguinte. Se preferir, você também pode executar tudo em uma única linha.

O resultado esperado é que essas ferramentas fiquem disponíveis na VPS logo
depois da instalação.

### Aplicando o fuso horário

```bash
sudo timedatectl set-timezone "$TIMEZONE"
```

Esse comando faz o seguinte:

- `timedatectl` gerencia data, hora e timezone do sistema.
- `set-timezone` informa que você quer definir o fuso horário.
- `"$TIMEZONE"` reutiliza o valor salvo anteriormente na variável.

O resultado esperado é que o sistema passe a usar o fuso horário configurado,
o que ajuda na leitura de logs, agendamentos, timestamps e administração geral
da VPS.

Se quiser conferir depois, você pode executar:

```bash
timedatectl
```

Esse comando mostra a configuração atual de data, hora e timezone do sistema.

---

## Configurando o Git

Se você pretende trabalhar com repositórios Git diretamente na VPS, vale a pena
configurar seu nome, seu e-mail e alguns padrões globais logo no início. Isso
evita commits com identidade incorreta e ajuda a manter consistência no
comportamento do Git dentro do servidor.

Se a sua VPS vai servir apenas para deploy e leitura do repositório, esta parte
é opcional. Ainda assim, estou mantendo os comandos porque eles fizeram parte do
setup original.

### Definindo nome e e-mail em variáveis

```bash
export GIT_USERNAME="luizomf"
export GIT_EMAIL="luizomf@gmail.com"
```

Esses comandos fazem o seguinte:

- `export` cria variáveis de ambiente na sessão atual.
- `GIT_USERNAME` armazena o nome que será usado pelo Git.
- `GIT_EMAIL` armazena o e-mail que será usado pelo Git.

No seu caso, troque `luizomf` e `luizomf@gmail.com` pelos seus próprios dados.

### Configurando nome e e-mail globais do Git

```bash
git config --global user.name "$GIT_USERNAME"
git config --global user.email "$GIT_EMAIL"
```

Esses comandos fazem o seguinte:

- `git config` altera configurações do Git.
- `--global` aplica a configuração para o usuário atual em todos os repositórios
  desse ambiente.
- `user.name` define o nome do autor dos commits.
- `user.email` define o e-mail do autor dos commits.
- `"$GIT_USERNAME"` e `"$GIT_EMAIL"` reutilizam os valores definidos nas
  variáveis anteriores.

O resultado esperado é que futuros commits feitos nessa VPS saiam com a autoria
correta.

### Padronizando quebra de linha no formato Linux

```bash
git config --global core.autocrlf input
git config --global core.eol lf
```

Esses comandos fazem o seguinte:

- `core.autocrlf input` faz com que o Git converta quebras de linha `CRLF` para
  `LF` ao salvar conteúdo no repositório, sem alterar arquivos na leitura.
- `core.eol lf` define `LF` como estilo de quebra de linha preferencial.

Na prática, isso ajuda a manter o padrão típico de sistemas Linux, evita ruído
desnecessário em diffs e reduz problemas causados por mistura de quebras de
linha diferentes.

### Definindo a branch padrão como `main`

```bash
git config --global init.defaultbranch main
```

Esse comando faz o seguinte:

- `init.defaultbranch` define o nome da branch inicial criada por `git init`.
- `main` passa a ser o padrão para novos repositórios inicializados nessa VPS.

O resultado esperado é que novos repositórios criados com `git init` já usem a
branch `main` por padrão, em vez de nomes antigos como `master`.

Se quiser conferir depois as configurações aplicadas, você pode executar:

```bash
git config --global --list
```

Esse comando mostra as configurações globais atuais do Git para o usuário.

---

## Endurecendo o SSH

Depois de configurar o acesso por chave e confirmar que ele funciona, o próximo
passo é endurecer a configuração do SSH. Aqui a ideia é reduzir a superfície de
ataque do servidor e impedir formas de autenticação e recursos que não serão
necessários neste ambiente.

Este é um passo importante de segurança, mas também é um passo sensível. Se você
aplicar essas mudanças antes de confirmar que o login por chave está realmente
funcionando para o seu usuário, você pode perder o acesso remoto por SSH.

Antes de continuar:

- confirme que você já consegue entrar com sucesso usando sua chave SSH
- mantenha a sessão atual aberta enquanto testa a nova configuração
- se estiver usando Hostinger, o terminal web do hPanel pode servir como acesso
  de emergência caso algo dê errado

### Garantindo a instalação do servidor SSH

```bash
sudo apt install -y openssh-server
```

Esse comando faz o seguinte:

- `apt install -y` instala o pacote sem pedir confirmação interativa.
- `openssh-server` instala o serviço SSH no servidor.

Em muitas VPSs esse pacote já vem instalado por padrão, mas executar esse
comando garante que o serviço esteja presente.

### Criando um arquivo separado de configuração do SSH

```bash
cat <<-'EOF' | sudo tee "/etc/ssh/sshd_config.d/01_sshd_settings.conf"
###############################################################################
### Start of /etc/ssh/sshd_config.d/01_sshd_settings.conf ######################
###############################################################################

# BLOCK 1: AUTHENTICATION AND ACCESS
PubkeyAuthentication yes            # Apenas chaves
PasswordAuthentication no           # Senhas desativadas (adeus brute-force)
KbdInteractiveAuthentication no     # Sem teclado interativo
ChallengeResponseAuthentication no  # Sem desafio-resposta
PermitRootLogin no                  # Root nunca loga direto
PermitEmptyPasswords no             # Sem senhas vazias
UsePAM yes                          # PAM ativo para sessão (mas auth é só key)
AuthenticationMethods publickey     # Força auth apenas por chave pública

# BLOCK 2: ATTACK SURFACE REDUCTION
PermitUserEnvironment no            # Bloqueia injeção de env
PermitUserRC no                     # Bloqueia scripts rc de usuário
X11Forwarding no                    # Sem interface gráfica remota

# TUNNELING (Ajuste se precisar de túneis)
AllowTcpForwarding no               # Bloqueia túneis TCP
AllowStreamLocalForwarding no       # Bloqueia socket forwarding
AllowAgentForwarding no             # Bloqueia agent forwarding

PermitOpen none                     # Bloqueia forwarding arbitrário
PermitListen none                   # Bloqueia abrir portas remotas
GatewayPorts no                     # Bloqueia gateway ports
PermitTunnel no                     # Bloqueia interfaces tun/tap

# BLOCK 3: PERFORMANCE & TIMEOUTS
MaxAuthTries 4                      # Max 4 tentativas
LoginGraceTime 30                   # 30s para logar ou tchau
ClientAliveInterval 300             # Keepalive a cada 5 min
ClientAliveCountMax 2               # Cai se não responder 2x
PrintMotd no                        # Menos spam no login
UseDNS no                           # Login rápido (sem reverse DNS lookup)

###############################################################################
### End of /etc/ssh/sshd_config.d/01_sshd_settings.conf ########################
###############################################################################
EOF
```

Esse comando faz o seguinte:

- `cat <<-'EOF'` inicia um bloco de texto literal no shell.
- `EOF` marca o início e o fim do conteúdo que será enviado.
- `|` envia esse conteúdo para o próximo comando.
- `sudo tee "/etc/ssh/sshd_config.d/01_sshd_settings.conf"` grava o conteúdo no
  arquivo indicado com permissões administrativas.

Em vez de editar diretamente o arquivo principal `/etc/ssh/sshd_config`, essa
abordagem cria um arquivo complementar dentro de `/etc/ssh/sshd_config.d/`. Isso
costuma ser melhor para manutenção, porque deixa sua configuração customizada
separada da configuração padrão do sistema.

O efeito prático dessas diretivas é:

- permitir autenticação apenas com chave pública
- desativar autenticação por senha, teclado interativo e desafio-resposta
- impedir login direto do usuário `root`
- desativar recursos de forwarding e tunelamento que não serão usados
- reduzir tentativas de login e ajustar timeouts de sessão

Importante: se você realmente precisar de túneis SSH, `agent forwarding` ou
algum tipo de redirecionamento de portas no futuro, terá de revisar essas
diretivas antes. Neste guia isso é aceitável porque o acesso ao GitHub será
feito com uma chave criada no próprio servidor, sem depender de encaminhamento
do agente SSH da sua máquina local.

### Validando a configuração antes de reiniciar

```bash
sudo sshd -t
```

Esse comando faz o seguinte:

- `sshd -t` valida a configuração do serviço SSH sem iniciar uma nova sessão.

Se houver erro de sintaxe ou conflito de configuração, esse comando deve
informar o problema. Nesse caso, não reinicie o serviço ainda. Corrija o erro
primeiro.

O resultado esperado, quando está tudo certo, é não aparecer nenhuma mensagem
de erro.

### Reiniciando o serviço SSH

```bash
sudo systemctl restart ssh
```

Esse comando faz o seguinte:

- `systemctl restart ssh` reinicia o serviço SSH para aplicar a nova
  configuração.

Depois disso, teste imediatamente uma nova conexão SSH em outro terminal, sem
fechar a sessão atual. O resultado esperado é conseguir entrar normalmente com
autenticação por chave.

Se a nova conexão funcionar, a configuração foi aplicada com sucesso.

### Conferindo as diretivas aplicadas

Depois de reiniciar o serviço, você também pode inspecionar a configuração final
que o `sshd` está enxergando:

```bash
sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries|x11forwarding'
```

Esse comando faz o seguinte:

- `sshd -T` imprime a configuração efetiva do servidor SSH já processada.
- `|` envia a saída do primeiro comando para o próximo.
- `grep -E` filtra apenas as linhas que correspondem ao padrão informado.
- `'permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries|x11forwarding'`
  é uma expressão regular que seleciona apenas algumas diretivas importantes
  para conferência.

O resultado esperado é ver algo semelhante a isto:

```text
maxauthtries 4
permitrootlogin no
pubkeyauthentication yes
passwordauthentication no
x11forwarding no
```

Essa conferência é útil porque mostra, de forma objetiva, que o serviço SSH está
mesmo carregando as diretivas que você definiu.

---

## Protegendo o SSH com Fail2Ban

Depois de endurecer o SSH, um passo muito comum em VPSs expostas diretamente à
internet é instalar o Fail2Ban. Ele monitora tentativas de acesso mal-sucedidas
e aplica bloqueios temporários quando detecta comportamento suspeito, como
tentativas repetidas de login por força bruta.

### Definindo IPs que não devem ser bloqueados

Antes de instalar e configurar o Fail2Ban, defini variáveis com o IP
administrativo que não deve ser banido:

```bash
export ADMIN_SSH_CIDR="187.108.118.25/32"
export FAIL2BAN_IGNOREIP="$ADMIN_SSH_CIDR 127.0.0.1/8 ::1"
```

Esses comandos fazem o seguinte:

- `ADMIN_SSH_CIDR` guarda o IP ou faixa de IP autorizada para administração.
- `187.108.118.25/32` representa um único IP em notação CIDR.
- `FAIL2BAN_IGNOREIP` monta uma lista de endereços que o Fail2Ban deve ignorar.
- `127.0.0.1/8` representa o localhost em IPv4.
- `::1` representa o localhost em IPv6.

No seu caso, você deve trocar `187.108.118.25/32` pelo IP público da sua casa,
escritório ou local de administração.

Importante: esse passo funciona melhor quando você tem um IP relativamente
estável. Se o seu IP muda com frequência, ou se você administra a VPS a partir
de redes diferentes, tome cuidado. Uma whitelist muito restritiva pode não
ajudar quando você trocar de rede, e você ainda pode acabar bloqueado se errar
várias tentativas fora do IP liberado.

### Instalando o Fail2Ban

```bash
sudo apt install fail2ban -y
```

Esse comando faz o seguinte:

- `apt install -y` instala o pacote sem pedir confirmação interativa.
- `fail2ban` instala o serviço responsável por detectar e bloquear abusos com
  base em logs.

O resultado esperado é que o pacote seja instalado e o serviço fique disponível
no sistema.

### Criando a configuração local do Fail2Ban

```bash
cat <<-EOF | sudo tee "/etc/fail2ban/jail.local"
[DEFAULT]

[sshd]
enabled = true
port = ssh
backend = systemd
# IPs ignorados (você e o localhost)
ignoreip = ${FAIL2BAN_IGNOREIP}

# Regras de banimento
maxretry = 5          # 5 tentativas falhas
findtime = 10m        # dentro de 10 minutos
bantime = 1h          # = Banido por 1 hora

# Banimento progressivo para reincidentes
bantime.increment = true
bantime.factor = 2    # Dobra o tempo a cada reincidência
bantime.max = 24h     # Até o máximo de 24h
EOF
```

Esse comando faz o seguinte:

- `cat <<-EOF` inicia um bloco de texto que será enviado ao próximo comando.
- `sudo tee "/etc/fail2ban/jail.local"` grava esse conteúdo no arquivo
  `/etc/fail2ban/jail.local`.
- `[sshd]` cria uma jail específica para proteger o serviço SSH.
- `enabled = true` ativa essa jail.
- `port = ssh` informa que a regra monitora o serviço SSH.
- `backend = systemd` diz ao Fail2Ban para ler os logs pelo `systemd`.
- `ignoreip = ${FAIL2BAN_IGNOREIP}` define os IPs que nunca devem ser banidos.
- `maxretry = 5` permite até cinco falhas antes de banir.
- `findtime = 10m` define a janela de tempo para contar as falhas.
- `bantime = 1h` define a duração inicial do bloqueio.
- `bantime.increment = true` ativa aumento progressivo do tempo de banimento.
- `bantime.factor = 2` dobra o tempo para reincidentes.
- `bantime.max = 24h` limita o banimento progressivo a 24 horas.

O resultado esperado é uma proteção básica e eficiente contra tentativas
automáticas de login no SSH.

### Reiniciando o serviço

```bash
sudo systemctl restart fail2ban
```

Esse comando faz o seguinte:

- `systemctl restart fail2ban` reinicia o serviço para aplicar a configuração
  nova.

Depois disso, o esperado é que o Fail2Ban passe a monitorar o SSH com as regras
definidas em `jail.local`.

Se quiser conferir o status logo depois, você pode usar `sudo systemctl status fail2ban`
ou `sudo fail2ban-client status sshd`. Não é obrigatório para seguir o guia, mas
ajuda bastante quando você ainda está pegando confiança com a ferramenta.

---

## Configurando o firewall com UFW

Depois de ajustar o SSH e o Fail2Ban, o próximo passo é configurar um firewall
básico na VPS. Aqui foi usado o `ufw`, que é uma interface mais simples para
gerenciar regras de firewall no Linux.

Este passo é importante, mas exige atenção. Se você ativar o firewall sem
liberar corretamente a porta SSH antes, pode perder o acesso remoto ao servidor.

### Instalando o UFW

```bash
sudo apt install -y ufw
```

Esse comando faz o seguinte:

- `apt install -y` instala o pacote sem pedir confirmação interativa.
- `ufw` instala a ferramenta de gerenciamento de firewall.

### Limpando configurações anteriores

```bash
sudo ufw disable
sudo ufw --force reset
```

Esses comandos fazem o seguinte:

- `ufw disable` desativa o firewall temporariamente.
- `ufw --force reset` apaga regras antigas e volta o UFW para um estado limpo,
  sem pedir confirmação interativa.

Essa etapa é útil quando você quer começar a configuração do zero e evitar
herdar regras antigas que possam confundir o resultado.

### Definindo políticas padrão

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

Esses comandos fazem o seguinte:

- `default deny incoming` bloqueia conexões de entrada por padrão.
- `default allow outgoing` permite conexões de saída por padrão.

Na prática, isso significa que nada entra na VPS a menos que você libere
explicitamente, enquanto o servidor continua podendo acessar a internet.

### Liberando o SSH

```bash
sudo ufw allow ssh comment "SSH"
```

Esse comando faz o seguinte:

- `allow ssh` libera a porta padrão do serviço SSH.
- `comment "SSH"` adiciona um comentário para facilitar leitura das regras.

Se você quiser restringir o SSH ao seu IP administrativo, pode criar uma regra
mais específica em vez de liberar para qualquer origem. Esse cuidado é
interessante quando você administra a VPS sempre do mesmo lugar.

### Liberando a porta do WireGuard

```bash
sudo ufw allow from any to any port 51820 proto udp comment "WireGuard"
```

Esse comando faz o seguinte:

- `allow from any to any` permite tráfego de qualquer origem para qualquer
  destino local compatível com a regra.
- `port 51820` define a porta liberada.
- `proto udp` limita a regra ao protocolo UDP.
- `comment "WireGuard"` adiciona uma descrição para a regra.

Na prática, essa regra deixa a porta `51820/udp` acessível pela internet. Isso
é comum quando você pretende usar WireGuard e clientes externos precisam chegar
até a VPS por essa porta.

Se você não for usar WireGuard, não precisa liberar essa porta.

### Liberando HTTP e HTTPS

```bash
sudo ufw allow 80/tcp comment "HTTP public"
sudo ufw allow 443/tcp comment "HTTPS public"
```

Esses comandos fazem o seguinte:

- `80/tcp` libera HTTP.
- `443/tcp` libera HTTPS.
- `comment` adiciona descrições para facilitar manutenção futura.

Essas portas são necessárias para publicar aplicações web e, em muitos casos,
também para obtenção e renovação de certificados TLS.

Observação importante: quando você publica portas com Docker, a interação entre
Docker e `ufw` merece atenção especial. Em muitas configurações, regras de
publicação de porta do Docker podem contornar parte do comportamento esperado do
firewall do host. Neste projeto isso foi levado em conta na forma de exposição
dos serviços, mas ainda assim vale tratar Docker e firewall como partes do mesmo
desenho de segurança, e não como camadas totalmente independentes.

### Ativando o firewall

```bash
sudo ufw --force enable
sudo ufw status verbose
```

Esses comandos fazem o seguinte:

- `ufw --force enable` ativa o firewall sem pedir confirmação.
- `ufw status verbose` mostra o estado atual e as regras ativas.

Importante: antes de executar `ufw --force enable`, revise com cuidado se a
regra do SSH realmente está correta. Se você bloquear seu próprio acesso, pode
precisar recorrer ao console do provedor para corrigir, resetar o firewall ou,
em último caso, refazer a configuração da máquina.

O resultado esperado é uma saída semelhante a esta:

```text
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere                   # SSH
51820/udp                  ALLOW IN    Anywhere                   # WireGuard
80/tcp                     ALLOW IN    Anywhere                   # HTTP public
443/tcp                    ALLOW IN    Anywhere                   # HTTPS public
22/tcp (v6)                ALLOW IN    Anywhere (v6)              # SSH
51820/udp (v6)             ALLOW IN    Anywhere (v6)              # WireGuard
80/tcp (v6)                ALLOW IN    Anywhere (v6)              # HTTP public
443/tcp (v6)               ALLOW IN    Anywhere (v6)              # HTTPS public
```

Se a sua saída estiver parecida com isso, significa que o firewall foi ativado
com as portas esperadas liberadas.

---

## Configurando WireGuard

Esta foi uma das partes mais sensíveis da configuração inicial da VPS. O
WireGuard será usado para criar uma rede privada entre máquinas, e isso exige
alguns cuidados porque cada host precisa ter seu próprio IP interno, seu próprio
par de chaves e sua própria configuração de peers.

Antes de continuar, tenha em mente:

- cada máquina precisa ter um IP interno diferente dentro da rede do WireGuard
- as chaves pública e privada geradas em uma máquina não devem ser reutilizadas
  em outra
- o arquivo de configuração inicial criado aqui ainda precisa ser completado com
  os dados do peer remoto

### Instalando o WireGuard

```bash
sudo apt install -y wireguard
```

Esse comando faz o seguinte:

- `apt install -y` instala o pacote sem pedir confirmação interativa.
- `wireguard` instala as ferramentas necessárias para criar a interface VPN.

### Definindo variáveis da interface e do IP interno

```bash
export WG_INTERFACE="wg0"
export WG_CIDR="24"

export WG_IP="10.100.0.2"
```

Esses comandos fazem o seguinte:

- `WG_INTERFACE="wg0"` define o nome da interface WireGuard.
- `WG_CIDR="24"` define a máscara da rede em notação CIDR.
- `WG_IP="10.100.0.2"` define o IP interno desta máquina dentro da VPN.

No seu caso, o ponto mais importante é adaptar `WG_IP`. Cada máquina da rede
precisa ter um IP diferente. Se duas máquinas receberem o mesmo IP interno, a
VPN não vai funcionar corretamente.

### Definindo caminhos usados na configuração

```bash
export WG_DIR="/etc/wireguard"
export WG_CONF="$WG_DIR/$WG_INTERFACE.conf"
export WG_PRI="${WG_DIR}/private.key"
export WG_PUB="${WG_DIR}/public.key"
```

Esses comandos fazem o seguinte:

- `WG_DIR` define o diretório onde os arquivos do WireGuard serão guardados.
- `WG_CONF` define o caminho do arquivo principal de configuração.
- `WG_PRI` define o caminho da chave privada.
- `WG_PUB` define o caminho da chave pública.

Usar variáveis aqui ajuda a evitar repetição e reduz a chance de erro nos
comandos seguintes.

### Gerando as chaves e preparando o diretório

```bash
if ! sudo test -f "${WG_PRI}"; then
    echo "Gerando chaves..."
    sudo install -d -m 0700 -o root -g root "${WG_DIR}"
    sudo wg genkey | sudo tee "${WG_PRI}" | sudo wg pubkey | sudo tee "${WG_PUB}" > /dev/null
    sudo chmod 600 "${WG_PRI}"
    sudo chmod 644 "${WG_PUB}"
fi
```

Esse bloco faz o seguinte:

- `sudo test -f "${WG_PRI}"` verifica se a chave privada já existe.
- `if ! ...; then` executa o bloco apenas se a chave ainda não existir.
- `install -d -m 0700 -o root -g root "${WG_DIR}"` cria o diretório
  `/etc/wireguard` com permissão restrita ao `root`.
- `wg genkey` gera uma nova chave privada.
- `tee "${WG_PRI}"` grava a chave privada no arquivo correspondente.
- `wg pubkey` lê a chave privada e gera a chave pública correspondente.
- `tee "${WG_PUB}"` grava a chave pública no arquivo correspondente.
- `chmod 600 "${WG_PRI}"` restringe o acesso à chave privada.
- `chmod 644 "${WG_PUB}"` aplica permissões mais abertas à chave pública.

O resultado esperado é que a VPS passe a ter um par de chaves exclusivo do
WireGuard armazenado em `/etc/wireguard`.

### Lendo as chaves para variáveis

```bash
WG_PRI_VALUE=$(sudo cat "${WG_PRI}")
WG_PUB_VALUE=$(sudo cat "${WG_PUB}")

echo "Sua Public Key é: ${WG_PUB_VALUE}"
```

Esses comandos fazem o seguinte:

- `WG_PRI_VALUE=$(...)` lê a chave privada e salva o conteúdo em uma variável.
- `WG_PUB_VALUE=$(...)` lê a chave pública e salva o conteúdo em outra variável.
- `echo "Sua Public Key é: ..."` imprime a chave pública na tela.

A chave pública é justamente o valor que você vai precisar copiar para a
configuração dos outros peers da VPN.

### Criando a configuração inicial da interface

```bash
cat <<-EOF | sudo tee $WG_CONF
[Interface]
Address = $WG_IP/$WG_CIDR
ListenPort = 51820
PrivateKey = ${WG_PRI_VALUE}

# [Peer]
# PublicKey = <CHAVE_PUBLICA_DO_SEU_COMPUTADOR_LOCAL>
# AllowedIPs = <IP_INTERNO_DO_SEU_COMPUTADOR_LOCAL>/32
# Endpoint = <IP_PUBLICO_DO_SEU_COMPUTADOR_LOCAL>:51820
# PersistentKeepalive = 25
EOF
```

Esse comando faz o seguinte:

- cria o arquivo principal de configuração em `/etc/wireguard/wg0.conf`
- define a seção `[Interface]` da própria VPS
- configura o IP interno da interface WireGuard
- define a porta `51820` como porta de escuta
- grava a chave privada da máquina no arquivo
- deixa um bloco comentado de exemplo para configuração de um peer

Importante: nesse ponto o arquivo ainda não está completo. Você ainda precisa
editar `/etc/wireguard/wg0.conf` manualmente para preencher os dados reais do
peer remoto.

O que precisa ser adaptado nessa edição manual:

- `PublicKey` deve receber a chave pública da outra máquina
- `AllowedIPs` deve receber o IP interno da outra máquina na VPN
- `Endpoint` deve receber o IP público ou domínio da outra máquina, quando isso
  fizer sentido no seu cenário

Depois de salvar esse arquivo, aplique permissão restrita:

```bash
sudo chmod 600 "$WG_CONF"
```

Isso é importante porque o arquivo contém a chave privada da interface
WireGuard. Em um servidor real, esse arquivo não deve ficar legível para outros
usuários do sistema.

### Sobre o uso de `Endpoint`

Se o computador local ou o peer remoto tiver IP dinâmico, você pode omitir o
`Endpoint` em alguns cenários. Isso pode funcionar, mas muda a forma como os
peers se encontram e costuma exigir mais entendimento da topologia da sua rede.

Para iniciantes, a regra prática é:

- se você souber o IP público ou domínio do peer, preencher `Endpoint` tende a
  ser mais direto
- se o peer muda de IP com frequência, essa parte precisa ser pensada com mais
  cuidado

### Habilitando e iniciando o serviço

```bash
sudo systemctl enable wg-quick@wg0
sudo systemctl restart wg-quick@wg0
sudo wg show
```

Esses comandos fazem o seguinte:

- `systemctl enable wg-quick@wg0` habilita a interface para subir
  automaticamente no boot.
- `systemctl restart wg-quick@wg0` reinicia a interface com base no arquivo de
  configuração.
- `wg show` mostra o estado atual do WireGuard.

O resultado esperado é que a interface `wg0` seja criada e apareça na saída do
`wg show`, junto com a chave pública da máquina e demais dados da interface.

Se os peers ainda não estiverem configurados dos dois lados, isso não significa
necessariamente que algo deu errado. Pode apenas indicar que a interface subiu,
mas ainda não houve handshake com o outro lado.

---

## Instalando Docker Engine e Docker Compose

Antes de fazer o deploy do projeto, você precisa instalar o Docker Engine e o
plugin `docker compose`. Até aqui o guia já citou o grupo `docker`, mas em uma
VPS recém-criada esse grupo normalmente só passa a existir depois da instalação
do Docker.

Os comandos abaixo seguem o fluxo recomendado na documentação oficial do Docker
para Ubuntu, usando o repositório oficial do projeto em vez dos pacotes antigos
que podem existir nos repositórios padrão da distribuição.

### Removendo pacotes antigos, se existirem

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove -y $pkg
done
```

Esse bloco faz o seguinte:

- percorre uma lista de pacotes antigos ou conflitantes
- tenta removê-los antes da instalação oficial do Docker
- continua normalmente mesmo que algum desses pacotes não esteja instalado

O objetivo aqui é evitar conflito entre versões diferentes do Docker e do
Compose.

### Preparando o repositório oficial do Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Esses comandos fazem o seguinte:

- atualizam a lista de pacotes
- garantem a presença de `ca-certificates` e `curl`
- criam o diretório de keyrings do `apt`
- baixam a chave GPG oficial do Docker
- ajustam a permissão da chave para leitura pelo sistema

O resultado esperado é deixar a VPS pronta para confiar no repositório oficial
do Docker.

### Adicionando o repositório oficial do Docker

```bash
cat <<EOF | sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Esse comando faz o seguinte:

- cria um arquivo de repositório no formato `.sources`
- aponta o `apt` para o repositório oficial do Docker
- detecta automaticamente o codinome da sua versão do Ubuntu
- informa qual chave deve ser usada para validar os pacotes

### Instalando Docker Engine e o plugin `docker compose`

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Esses comandos fazem o seguinte:

- atualizam novamente a lista de pacotes, agora já com o repositório novo
- instalam o Docker Engine
- instalam o cliente do Docker
- instalam o `containerd`
- instalam o plugin `buildx`
- instalam o plugin `docker compose`

O resultado esperado é que os comandos `docker` e `docker compose` fiquem
disponíveis na VPS.

### Adicionando seu usuário ao grupo `docker`

Se você pulou este passo no começo do guia porque o grupo ainda não existia,
agora é o momento certo para executá-lo:

```bash
sudo usermod -aG docker $USER
```

Esse comando adiciona o usuário atual ao grupo `docker`, permitindo executar
comandos do Docker sem prefixar tudo com `sudo`.

Importante: essa alteração costuma exigir logout e login novamente, ou abertura
de uma nova sessão SSH, para entrar em vigor.

Se você tentar rodar `docker ps` na mesma sessão e receber erro de permissão,
isso normalmente não significa que a instalação falhou. Na maioria dos casos,
significa apenas que o grupo novo ainda não foi aplicado ao seu login atual.

### Conferindo a instalação

```bash
docker --version
docker compose version
```

Esses comandos fazem o seguinte:

- `docker --version` mostra a versão do Docker instalada
- `docker compose version` mostra a versão do plugin Compose

O resultado esperado é ver as versões dos dois componentes sem mensagem de erro.

---

## Preparando acesso ao repositório e clonando o projeto

Depois da configuração inicial da VPS, o próximo passo foi preparar o acesso ao
repositório GitHub e trazer o código do projeto para dentro do servidor.

### Gerando uma chave SSH no servidor para usar como Deploy Key

No servidor, gerei uma chave SSH específica para acesso ao repositório:

```bash
ssh-keygen -t ed25519
```

Esse comando faz o seguinte:

- `ssh-keygen` gera um novo par de chaves SSH.
- `-t ed25519` define o algoritmo da chave.

Durante a execução, pressione `ENTER` para todas as perguntas, usando o caminho
padrão e deixando a chave sem senha.

Estou usando o caminho padrão aqui de propósito. A vantagem é que o próprio
servidor passa a usar essa chave por padrão ao conversar com o GitHub, o que
evita configuração extra de SSH só para fazer `git pull`, `git fetch` e outros
comandos do Git dentro da VPS.

Mas atenção: isso só é seguro se você ainda não tiver uma chave importante em
`~/.ssh/id_ed25519`. Se esse arquivo já existir e você não quiser sobrescrevê-lo,
pare aqui e gere a chave com outro nome usando `ssh-keygen -t ed25519 -f CAMINHO_DA_CHAVE`.

O resultado esperado é a criação de dois arquivos no diretório `~/.ssh` do
usuário atual:

- `~/.ssh/id_ed25519`
- `~/.ssh/id_ed25519.pub`

### Exibindo a chave pública

```bash
cat ~/.ssh/id_ed25519.pub
```

Esse comando faz o seguinte:

- `cat` imprime o conteúdo do arquivo no terminal.
- `~/.ssh/id_ed25519.pub` é a chave pública recém-gerada.

Copie o conteúdo completo exibido na tela. Ele normalmente começa com
`ssh-ed25519`.

### Adicionando a chave no GitHub como Deploy Key

No GitHub, dentro do repositório, o caminho usado foi:

- `Settings`
- `Deploy Keys`
- `Add Deploy Key`

Ao adicionar a chave:

- cole a chave pública copiada no passo anterior
- não marque a opção `Allow write access`

O objetivo aqui é permitir que a VPS leia o repositório via SSH sem usar sua
senha pessoal e sem conceder permissão de escrita desnecessária.

### Criando o diretório do projeto no servidor

```bash
sudo mkdir /opt/lgtm1
sudo chown -R $USER:$USER /opt/lgtm1
```

Esses comandos fazem o seguinte:

- `mkdir /opt/lgtm1` cria o diretório onde o projeto ficará no servidor.
- `chown -R $USER:$USER /opt/lgtm1` transfere a posse desse diretório para o
  usuário atual.

O uso de `$USER` reaproveita automaticamente o nome do usuário logado no shell.

O resultado esperado é que você possa trabalhar normalmente dentro de
`/opt/lgtm1` sem precisar usar `sudo` para tudo.

### Clonando o repositório dentro do diretório

```bash
cd /opt/lgtm1
git clone URL_DO_REPO .
```

Esses comandos fazem o seguinte:

- `cd /opt/lgtm1` entra no diretório criado para o projeto.
- `git clone URL_DO_REPO .` clona o repositório no diretório atual.

Importante: o ponto final `.` no comando `git clone` faz diferença. Ele diz ao
Git para clonar o conteúdo dentro da pasta atual, em vez de criar uma subpasta
nova com o nome do repositório.

No seu caso, você deve trocar `URL_DO_REPO` pela URL SSH do seu próprio
repositório, por exemplo `git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git`.

O resultado esperado é que os arquivos do projeto apareçam diretamente dentro de
`/opt/lgtm1`.

Na primeira conexão com o GitHub por SSH, é normal aparecer uma pergunta
pedindo para confiar na fingerprint do host. Leia com atenção e confirme apenas
se o host exibido realmente for `github.com`.

### Instalando uma versão mais nova do `just`

Mais cedo, o `just` já havia sido instalado via `apt`, mas neste ponto foi feita
uma instalação via `snap` porque a versão disponível nos repositórios do sistema
não estava atualizada o suficiente.

Se o comando `snap` não existir na sua VPS, instale primeiro o `snapd`:

```bash
sudo apt install -y snapd
sudo systemctl enable --now snapd.socket
```

Esses comandos fazem o seguinte:

- `apt install -y snapd` instala o suporte ao Snap
- `systemctl enable --now snapd.socket` habilita e inicia o socket do Snap

Em muitas imagens Ubuntu isso já vem pronto, então talvez você nem precise
desse passo. Se, mesmo assim, o comando `snap` continuar indisponível logo após
a instalação, faça logout e login novamente ou reinicie a VPS.

```bash
sudo snap install just --classic
```

Esse comando faz o seguinte:

- `snap install` instala um pacote usando o Snap.
- `just` é o task runner usado no projeto.
- `--classic` libera o modo clássico de confinamento quando o pacote exige esse
  tipo de instalação.

O resultado esperado é ter uma versão mais recente do `just` disponível no
servidor para executar as recipes do projeto.

---

## Fazendo o deploy inicial do projeto

Com o repositório já clonado no servidor, o próximo passo foi preparar o arquivo
de ambiente, subir a stack e gerar tráfego para alimentar dashboards e alertas.

### Entrando no diretório do projeto

```bash
cd /opt/lgtm1
```

Esse comando faz o seguinte:

- `cd` muda o diretório atual do shell.
- `/opt/lgtm1` é a pasta onde o projeto foi clonado.

O resultado esperado é que os próximos comandos sejam executados dentro do
diretório correto do projeto.

### Criando o arquivo `.env`

```bash
cp .env.example .env
```

Esse comando faz o seguinte:

- `cp` copia um arquivo.
- `.env.example` é o arquivo modelo com as variáveis de ambiente.
- `.env` é o arquivo real que será lido pelo projeto no deploy.

No caso deste projeto, o `.env.example` já traz pelo menos estas variáveis:

- `ACME_EMAIL`
- `API_DOMAIN`
- `API_BASE_URL`
- `GRAFANA_USER`
- `GRAFANA_PASSWD`
- `GRAFANA_BIND_IP`
- `GRAFANA_BIND_PORT`

Antes de seguir, ajuste esses valores no arquivo `.env`:

- `ACME_EMAIL` deve receber um e-mail válido para o Let's Encrypt
- `API_DOMAIN` deve receber apenas o host público da sua API, por exemplo
  `api.seu-dominio.com`
- `API_BASE_URL` deve receber a URL completa usada pelas recipes de produção,
  por exemplo `https://api.seu-dominio.com`
- `GRAFANA_USER` e `GRAFANA_PASSWD` devem ser trocados por credenciais fortes
- `GRAFANA_BIND_IP` deve receber o IP em que o Grafana vai escutar no host,
  normalmente o IP do WireGuard desta VPS ou `127.0.0.1`
- `GRAFANA_BIND_PORT` normalmente pode continuar como `3000`, a menos que você
  tenha um motivo claro para trocar

Evite deixar usuário, senha, domínio e e-mail com valores de exemplo em um
servidor real exposto à internet.

Ponto importante de segurança: evite usar `0.0.0.0` em `GRAFANA_BIND_IP` se a
sua intenção for manter o Grafana privado. Neste projeto, a ideia é publicar a
API para a internet, mas deixar o Grafana acessível apenas pela rede privada do
WireGuard ou pelo próprio servidor.

### Executando o deploy

```bash
just deploy
```

Esse comando faz o seguinte:

- executa a recipe `deploy` definida no `Justfile`
- essa recipe chama internamente `docker compose` usando o arquivo
  `docker/compose.kvm2.yaml`
- o deploy usa o arquivo `.env` para injetar as variáveis de ambiente
- a stack é iniciada em modo destacado com build das imagens quando necessário

Na prática, este comando sobe a stack principal do projeto na VPS, incluindo a
API de demonstração e os componentes de observabilidade.

O resultado esperado é que os containers sejam criados e iniciados em segundo
plano. No primeiro deploy, também pode levar um pouco mais de tempo até o
Traefik emitir o certificado TLS, porque isso depende de DNS correto e de as
portas `80` e `443` já estarem acessíveis. Se quiser conferir depois, você pode
usar `docker ps` ou as recipes do próprio projeto para verificar o estado dos
serviços.

### Gerando tráfego normal para dashboards

```bash
just traffic-prod
```

Essa recipe serve para gerar tráfego repetido contra o endpoint `/unstable`,
alimentando métricas, logs e traces para aparecerem nos dashboards com um
comportamento menos roteirizado.

Pelo `Justfile`, ela faz o seguinte por padrão:

- verifica primeiro se `API_BASE_URL/health` está respondendo
- executa `30` rodadas
- espera `0.2` segundo entre uma rodada e outra
- em cada rodada, faz uma requisição HTTP para `API_BASE_URL/unstable`

Na prática, isso gera um volume controlado de requests contra o endpoint
`/unstable`. Como esse endpoint escolhe o resultado aleatoriamente, o tráfego
parece mais orgânico do que uma sequência fixa de cenários.

Se `API_BASE_URL` estiver errado, a recipe falha logo no começo com uma
mensagem clara, em vez de ficar silenciosamente tentando enviar tráfego para o
lugar errado.

### Gerando tráfego determinístico para demonstrações repetíveis

```bash
just traffic-scenarios-prod
```

Essa recipe é parecida com a anterior, mas em vez de deixar o endpoint
`/unstable` decidir o resultado aleatoriamente, ela envia uma sequência fixa de
cenários em cada rodada.

Pelo `Justfile`, ela faz o seguinte por padrão:

- verifica primeiro se `API_BASE_URL/health` está respondendo
- executa `10` rodadas
- espera `0.2` segundo entre uma rodada e outra
- em cada rodada, envia:
  - `API_BASE_URL/scenario?mode=ok`
  - `API_BASE_URL/scenario?mode=warn`
  - `API_BASE_URL/scenario?mode=slow&delay_ms=600`
  - `API_BASE_URL/scenario?mode=error`

Na prática, isso cria um padrão previsível. É a melhor opção quando você quer
gravar a tela, comparar dashboards ou repetir a mesma demonstração várias
vezes sem depender do acaso.

### Gerando caos para testar alertas

```bash
just chaos-prod
```

Essa recipe não gera apenas tráfego genérico. Ela foi pensada para provocar
comportamentos ruins de propósito, de modo que os alertas e dashboards mostrem
uma situação de falha realista.

Pelo `Justfile`, ela faz o seguinte por padrão:

- verifica primeiro se `API_BASE_URL/health` está respondendo
- executa `90` rodadas
- espera `0.1` segundo entre uma rodada e outra
- em cada rodada, envia três requisições para
  `API_BASE_URL/scenario?mode=error`
- em seguida, envia uma requisição para
  `API_BASE_URL/scenario?mode=slow&delay_ms=2000`

Na prática, isso força:

- aumento de erros na aplicação
- aumento de latência por causa das respostas lentas

O resultado esperado é que, depois de algum tempo, os dashboards mostrem essas
anomalias e os alertas configurados no Grafana possam disparar.

### Resumo prático dessas três recipes

- `just traffic-prod` gera tráfego aleatório via `/unstable` para popular dashboards
- `just traffic-scenarios-prod` gera um ciclo determinístico de `ok`, `warn`,
  `slow` e `error`
- `just chaos-prod` gera erros e lentidão de propósito para testar alertas

As três recipes são úteis, mas têm objetivos diferentes. A primeira serve mais
para visualização orgânica e volume básico. A segunda serve para demonstração
repetível. A terceira serve para falha, incidente e observabilidade em
condições degradadas.

---
