# Security Checklist (KVM2)

Use this as a practical pre-publish checklist and as a talking track in the video.

## 1) Firewall baseline (UFW)

```bash
sudo ufw status verbose
```

Expected:

- `Status: active`
- only required inbound ports (`22`, `80`, `443`, `51820`)
- default inbound policy as `deny`

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
- `:8000` exposed only if direct API fallback is intentional

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

## 8) WireGuard tunnel status

```bash
sudo systemctl is-active wg-quick@wg0
sudo wg show
```

Expected:

- interface active
- recent handshake with expected peers

## 9) Optional strict mode decision

If you want to enforce API only behind Traefik/TLS, remove direct `:8000` public mapping from `compose.kvm2.yaml`.

## Talk track (short)

"Before publishing, I validated firewall, intrusion prevention, SSH policy, exposed ports, TLS validity, and VPN health. Security here is checked, not assumed."
