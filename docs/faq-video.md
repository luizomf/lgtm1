# FAQ for Video Comments

Use these short answers in comments, pinned posts, or video follow-up.

## "Why single VPS? That's a SPOF."

Correct. This setup is a learning baseline, not an HA architecture.
The goal is to teach signal flow and observability decisions first, then scale patterns later.

## "Why no Kubernetes?"

Because Kubernetes would hide the fundamentals under orchestration complexity.
Here we keep the stack understandable with Docker Compose so people can reproduce and learn faster.

## "Why OpenTelemetry instead of just logs?"

Logs are necessary, but not sufficient for fast diagnosis.
OpenTelemetry gives consistent traces and metrics, so you can correlate what happened, where, and how often.

## "Do logs become metrics automatically?"

Not by default.
In this project, metrics come from OTel instrumentation and collector pipelines; log-derived metrics are optional and explicit.

## "Why LGTM and not Prometheus + ELK?"

LGTM gives native correlation between logs, metrics, and traces inside Grafana.
The stack is focused, lighter to explain in one project, and strong for observability-first workflows.

## "Why is Grafana behind VPN / allowlist?"

Grafana is an admin surface.
Keeping it private reduces attack surface and avoids exposing operational internals to the public internet.

## "Why keep API public but internal observability backends private?"

Public API is product traffic.
Loki/Tempo/Mimir are infrastructure internals and should not be internet-facing in this profile.

## "Why Traefik in front?"

To centralize TLS, routing, and security middleware in one ingress layer.
It keeps app containers simpler and reduces repeated config.

## "Why no production-grade secrets management?"

This repository is a didactic baseline.
For production, replace plain env defaults with secret managers and stricter operational controls.

## "Can this go to production as-is?"

As-is, no.
As a foundation, yes: evolve with HA, backups, SLOs, secret management, and staged rollout policies.
