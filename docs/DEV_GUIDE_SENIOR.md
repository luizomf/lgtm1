# Guia para o desenvolvedor (apenas comandos)

Este é o mesmo [DEV_GUIDE](./DEV_GUIDE.md), porém sem explicações. Voltado para
usuários avançados.

Obs.: são comandos que eu estou executando, então altere os valores.

---

## Hostname (Servidor)

```bash
# Como root no VPS
hostnamectl set-hostname kvm2
sudo vim /etc/hosts
```

Adicione a linha:

```text
127.0.1.1       kvm2.inprod.cloud       kvm2
```

---

## Novo usuário (Servidor)

```bash
export YOUR_USERNAME="luizotavio"

useradd -m -s /bin/bash $YOUR_USERNAME
usermod -aG sudo $YOUR_USERNAME
usermod -aG docker $YOUR_USERNAME
passwd $YOUR_USERNAME
su $YOUR_USERNAME
```

---

## Acesso SSH (Computador local)

```bash
# Computador LOCAL
ssh-keygen -t ed25519 -f ~/.ssh/id_hostinger -C "USUARIO"
ssh-copy-id -i ~/.ssh/id_hostinger.pub USUARIO@IP_OU_HOST_DO_VPS
```

Atalho no `~/.ssh/config`:

```sshconfig
Host kvm2
  IgnoreUnknown AddKeysToAgent,UseKeychain
  AddKeysToAgent yes
  HostName inprod.cloud
  User luizotavio
  Port 22
  IdentityFile ~/.ssh/id_hostinger
```

---

## Pacotes básicos (Servidor)

```bash
export TIMEZONE='America/Sao_Paulo'
sudo timedatectl set-timezone "$TIMEZONE"

sudo apt update && sudo apt upgrade -y
sudo apt install -y vim curl ca-certificates htop python3 \
python3-dev acl build-essential tree
sudo snap install just --classic # mais atualizado
```

---

## Git (Servidor)

```bash
export GIT_USERNAME="luizomf"
export GIT_EMAIL="luizomf@gmail.com"

git config --global user.name "$GIT_USERNAME"
git config --global user.email "$GIT_EMAIL"
git config --global core.autocrlf input
git config --global core.eol lf
git config --global init.defaultbranch main
```

---

## SSH Hardening

```bash
sudo apt install -y openssh-server

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

sudo sshd -t
sudo systemctl restart ssh
sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries|x11forwarding'

# maxauthtries 4
# permitrootlogin no
# pubkeyauthentication yes
# passwordauthentication no
# x11forwarding no
```

---

## Fail2ban

```bash
export ADMIN_SSH_CIDR="187.108.118.25/32"
export FAIL2BAN_IGNOREIP="$ADMIN_SSH_CIDR 127.0.0.1/8 ::1"

sudo apt install fail2ban -y

cat <<-EOF | sudo tee "/etc/fail2ban/jail.local"
[DEFAULT]

[sshd]
enabled = true
port = ssh
backend = systemd
# IPs ignorados (você e o localhost)
ignoreip = ${FAIL2BAN_IGNOREIP}

# Regras de banimento
# 5 tentativas falhas
maxretry = 5
# dentro de 10 minutos
findtime = 10m
# = Banido por 1 hora
bantime = 1h

# Banimento progressivo para reincidentes
bantime.increment = true
# Dobra o tempo a cada reincidência
bantime.factor = 2
# Até o máximo de 24h
bantime.max = 24h
EOF

sudo systemctl restart fail2ban

```

---

## UFW

```bash
sudo apt install -y ufw

sudo ufw disable
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow ssh comment "SSH"
sudo ufw allow from any to any port 51820 proto udp comment "WireGuard"
sudo ufw allow 80/tcp comment "HTTP public"
sudo ufw allow 443/tcp comment "HTTPS public"
sudo ufw --force enable
sudo ufw status verbose
```

---

## WireGuard

```bash
sudo apt install -y wireguard

# EDITE CONFORME PRECISAR
export WG_INTERFACE="wg0"
export WG_CIDR="24"
export WG_IP="10.100.0.2"

export WG_DIR="/etc/wireguard"
export WG_CONF="$WG_DIR/$WG_INTERFACE.conf"
export WG_PRI="${WG_DIR}/private.key"
export WG_PUB="${WG_DIR}/public.key"

if ! sudo test -f "${WG_PRI}"; then
    echo "Gerando chaves..."
    sudo install -d -m 0700 -o root -g root "${WG_DIR}"
    sudo wg genkey | sudo tee "${WG_PRI}" | sudo wg pubkey | sudo tee "${WG_PUB}" > /dev/null
    sudo chmod 600 "${WG_PRI}"
    sudo chmod 644 "${WG_PUB}"
fi

WG_PRI_VALUE=$(sudo cat "${WG_PRI}")
WG_PUB_VALUE=$(sudo cat "${WG_PUB}")

echo "Sua Public Key é: ${WG_PUB_VALUE}"

# O trecho do [Peer] vai precisar ser editado
# As chaves pública e privada do VPS estão em:
# /etc/wireguard/private.key e public.key

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

sudo chmod 600 "$WG_CONF"

# Ative e reinicie
sudo systemctl enable wg-quick@wg0
sudo systemctl restart wg-quick@wg0
sudo wg show
```

---

## Acesso ao repositório (SSH no servidor)

```bash
# No SERVIDOR
ssh-keygen -t ed25519 -f ~/.ssh/id_lgtm -C "${USER}@$(hostname)"
cat ~/.ssh/id_lgtm.pub
```

Atalho no `~/.ssh/config`:

```sshconfig
Host github.com
  IgnoreUnknown AddKeysToAgent,UseKeychain
  AddKeysToAgent yes
  HostName github.com
  User git
  Port 22
  IdentityFile ~/.ssh/id_lgtm
```

---

## Clone do repositório

```bash
sudo vim ~/.ssh/config
sudo mkdir /opt/lgtm
sudo chown -R $USER:$USER /opt/lgtm
cd /opt/lgtm
git clone git@github.com:luizomf/lgtm1.git .
```

---

## Deploy

```bash
cd /opt/lgtm
cp .env.example .env

# EDITE OS VALORES DO .env
vim .env

# O deploy acontece aqui
just deploy
```

---
