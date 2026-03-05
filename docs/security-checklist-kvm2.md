# Security Checklist (KVM2)

Use this as a practical pre-publish checklist and as a talking track in the video.

## 1) Firewall baseline (UFW)

```bash
sudo ufw status verbose
```

Expected:

- `Status: active`
- only required inbound ports (`80`, `443`, `22`, `51820`)
- default inbound policy as `deny`
- `80/443` open to `Anywhere`
- `22` only from admin source(s) or VPN
- `51820/udp` only from known WireGuard peers

## 2) Fail2ban health

```bash
sudo systemctl status fail2ban --no-pager
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

Expected:

- service `active (running)`
- `sshd` jail enabled

## 3) SSH hardening checks

```bash
sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries|x11forwarding'
```

Expected:

- `permitrootlogin no`
- `passwordauthentication no` (or intentionally controlled)
- `pubkeyauthentication yes`
- sane brute-force limits (for example `maxauthtries`)

## 4) Real exposed ports (host)

```bash
ss -ltnp | grep -E '(:22|:80|:443|:51820|:8000|:3000)'
```

Expected for this project profile:

- `:80` and `:443` exposed by Traefik
- `:3000` bound to WireGuard IP (`10.100.0.2:3000`)
- no `:8000` public bind

## 5) Docker published ports sanity

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Expected:

- no accidental public publish for Loki/Tempo/Mimir/Alloy
- only intended public entries

## 6) TLS certificate validity

```bash
echo | openssl s_client -servername api.inprod.cloud -connect api.inprod.cloud:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates
echo | openssl s_client -servername lgtm.inprod.cloud -connect lgtm.inprod.cloud:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

Expected:

- valid issuer (for example Let's Encrypt)
- `notAfter` in the future

## 7) HTTPS routing and redirect

```bash
curl -I http://api.inprod.cloud/health
curl -I https://api.inprod.cloud/health
curl -I https://lgtm.inprod.cloud/login
```

Expected:

- HTTP -> HTTPS redirect
- HTTPS responses with expected status codes

## 8) Grafana network restriction

From a non-admin source:

```bash
curl -I https://lgtm.inprod.cloud/login
```

Expected:

- `403` outside allowlist
- `200/302` from VPN/admin network

## 9) WireGuard tunnel status

```bash
sudo systemctl is-active wg-quick@wg0
sudo wg show
```

Expected:

- interface active
- recent handshake with expected peers

## 10) External port probe (recommended)

From another VPS:

```bash
for p in 22 80 111 443 3000 3100 3200 8000 9009 9100; do nc -zvw2 <kvm2_public_ip> "$p"; done
```

Expected:

- open: `80`, `443`
- closed/filtered: `22` (if source not allowlisted), `111`, `3000`, `3100`, `3200`, `8000`, `9009`, `9100`

## Talk track (short)

"Before publishing, I validated firewall, intrusion prevention, SSH policy, exposed ports, TLS validity, and VPN health. Security here is checked, not assumed."
