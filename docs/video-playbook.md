# Video Playbook

This is the consolidated content guide for the video side of the project.
It replaces the previous scattered video docs with one place for:

- thesis and positioning
- narrative structure
- recording notes
- full article/script
- FAQ for comments and follow-up

## 1. Thesis And Promise

### Thesis

Observability is not optional anymore. A system can "work" and still be failing,
slowing down, or confusing everyone involved. The point of this project is to
make that visible with a practical LGTM baseline.

### Click promise

"Observability is not optional in 2026. Here is a ready-made LGTM base so you
can understand what matters and accelerate your next projects."

### Positioning

Do not sell guru energy.
Sell honesty, criteria, and a reusable base.

Use this framing:

- "I am not an LGTM expert. I am studying this now."
- "This setup is my real lab."
- "I am showing the map and the reasoning, not pretending this is the final form of production observability."

### What the audience should feel

- "Now I understand why this matters."
- "This no longer feels like a monster."
- "I can start from this base later."

## 2. Narrative Structure

Recommended macro order:

1. pain and human context
2. what the stack is
3. what each pillar solves
4. how the repo is organized
5. quick local or VPS setup
6. Grafana validation
7. ad insertion when it fits naturally
8. close with CTA and continuity

### Breach guards

#### "Where is Prometheus?"

Short answer:

- "Here we use Mimir as the metrics backend. It speaks Prometheus language, especially PromQL and compatible endpoints."

Even shorter:

- "Prometheus is the query model; Mimir is the backend we are using here."

#### "Did this become a tutorial?"

Use:

- "I am not doing a full step-by-step here. I am showing the map, where the files live, and why each part matters."

#### "This setup is too simple"

Use:

- "Yes. This is a conscious learning baseline: one VPS, no HA, no Kubernetes, clarity first."

#### "What if the alert does not fire right away?"

Plan B:

- run `just alert-demo 30 0.1`
- open Grafana Alerting
- show `Normal -> Pending -> Firing`
- if timing is awkward, flash `just rules-state` and go back to UI

## 3. Short Recording Flow

Use this when you want the cleanest sequence on camera:

1. explain the pain of reacting to logs only
2. explain metrics, traces, and alerting
3. present the LGTM stack
4. explain Alloy and OpenTelemetry
5. show the repo quickly
6. run `cp .env.example .env`
7. run `just up` or `just deploy`
8. generate traffic
9. open Grafana and validate data sources
10. show `LGTM Signals Tour` to bridge the abstract concepts into real signals
11. walk through the operational dashboards
12. end with what this base unlocks

## 4. Visual Support Checklist

Use this checklist while editing. The goal is to replace vague visual filler
with either project-native Grafana footage or deliberately abstract stock.

- [ ] `0001-intro.srt` `00:00:00 -> 00:00:29`
  Beat: promise of a ready-made repo and stack.
  Visual: quick repo hero or title card with `LGTM`, `OpenTelemetry`, `Grafana`, `Loki`, `Tempo`, `Mimir`.
  Source: project-native capture.
- [ ] `0001-intro.srt` `00:00:39 -> 00:00:57`
  Beat: studying on a real server.
  Visual: short `VPS Health` hero shot or a private Grafana-over-VPN shot.
  Source: project-native capture.
- [ ] `0002-tuto1.srt` `00:00:00 -> 00:01:17`
  Beat: pain, on-call stress, debugging pressure.
  Visual: dark terminal, alert-like stock, tired-night coding stock, or chat/support style inserts.
  Source: stock or abstract B-roll.
- [ ] `0002-tuto1.srt` `00:01:17 -> 00:02:08`
  Beat: logs are records of events.
  Visual: `LGTM Signals Tour > Logs Are Point Events`.
  Source: project-native Grafana.
- [ ] `0002-tuto1.srt` `00:02:08 -> 00:02:32`
  Beat: metrics answer questions over time, CPU as the simplest example.
  Visual: `LGTM Signals Tour > CPU Usage Over Time (%)`, then `Application Throughput Over Time`.
  Source: project-native Grafana.
- [ ] `0002-tuto1.srt` `00:02:32 -> 00:03:10`
  Beat: traces show the path of a request.
  Visual: `LGTM Signals Tour > Trace Rate By Outcome`, then `Service Graph: User -> API`.
  Source: project-native Grafana.
- [ ] `0002-tuto1.srt` `00:03:10 -> 00:03:35`
  Beat: Grafana unifies the signals.
  Visual: full-screen `LGTM Signals Tour`.
  Source: project-native Grafana.
- [ ] `0002-tuto1.srt` `00:03:40 -> 00:06:46`
  Beat: architecture walkthrough from storage back to the app.
  Visual: the Excalidraw build plus quick cutaways to the matching dashboard panels or Explore views.
  Source: mixed, mostly project-native.
- [ ] `0003-publi.srt` `00:00:00 -> 00:01:24`
  Beat: local vs VPS organization and Compose files.
  Visual: repo tree, `docker/compose.yaml`, and `docker/compose.kvm2.yaml`.
  Source: project-native capture.
- [ ] `0003-publi.srt` `00:01:24 -> 00:02:03`
  Beat: private Grafana access over WireGuard.
  Visual: VPN/private-network diagram or a subtle stock insert about private network access.
  Source: diagram or stock.
- [ ] `0003-publi.srt` `00:02:03 -> 00:03:10`
  Beat: direct sponsor segment.
  Visual: sponsor-specific footage, site, coupon, or approved brand material.
  Source: sponsor segment.
- [ ] `0003-publi.srt` `00:03:10 -> 00:04:09`
  Beat: real-server study is less boring than synthetic local-only traffic.
  Visual: `VPS Health`, `LGTM Flight Deck`, and `LGTM Signals Tour` rotating as proof of real signals.
  Source: project-native Grafana.

## 5. Full Article / Script

## Intro: reacting to logs is expensive

Finally, I decided to study observability more seriously.

In this video, I will show how I am using the LGTM stack, Loki, Grafana, Tempo,
and Mimir, in a real study setup, including a real server. I am also leaving
the configuration and explanation behind so you do not have to start in the dark.

If you work with real applications, you have probably lived through this:
something fails, you run to the logs, you try to understand it under pressure,
you patch it in a hurry, and then you hope it does not happen again.

That is normal.
I did that for a long time too.

The problem is that this costs a lot: stress, time, focus, and peace.
It can drag you out of bed in the middle of the night, interrupt your vacation,
or kill your concentration in the middle of something important.

After years of poking around logs with `grep`, `ps`, and `tail`, I decided to
study observability for real.

I need to leave the mode of "react to the error" and move into "understand the
system before the failure escalates."

Observability alone will not solve everything forever, but it gives me earlier
visibility into the system. With that visibility, I can improve metrics,
alerts, and technical decisions continuously.

## The real problem

If you have ever debugged production, you know logs answer the question:
"what happened?"

But logs alone do not answer some other questions very well:

- how many times did that happen this week?
- what is the trend over time?
- in which step of the request did the problem begin?

That is where the real pain starts.

Metrics answer frequency and trend.
Traces show the request path end to end.
When you combine logs, metrics, and traces, you stop guessing and start
diagnosing with context.

That closes with alerting: instead of discovering the issue when a customer
complains, you are warned earlier.

## The stack I chose

There are many options in observability, but after looking at the community,
documentation, and growth potential, I decided to focus on the LGTM stack.

Each piece solves one part of the problem:

- searchable logs: `Loki`
- metrics with history: `Mimir`
- request tracing: `Tempo`
- visualization and alerting: `Grafana`

Together they form `L`, `G`, `T`, `M`.

## How everything connects

For a long time, instrumentation was tied to the provider.
That worked, but migration hurt later.

OpenTelemetry changes that mental model.
Think of it as a universal language.
Your app speaks that language, and you decide who listens.

In this project, the real flow is:

- Logs: `API -> stdout -> Docker -> Alloy -> Loki -> Grafana`
- App metrics: `API -> OpenTelemetry -> Alloy -> Mimir -> Grafana`
- Host and container metrics: `node-exporter + cAdvisor -> Alloy -> Mimir -> Grafana`
- Traces: `API -> OpenTelemetry -> Alloy -> Tempo -> Grafana`

I call this out because I want the video to match what the repository actually
does, not a prettier diagram that only exists on a slide.

## Why I study this on a real server

I already tried to "sit down and study observability" a few times in the past.
For me, it got boring fast.

With only synthetic local data, everything feels too artificial.

This time I did it differently:
I brought up a real VPS, with domain, HTTPS, reverse proxy with Traefik, and
the usual real-world server concerns. There is even WireGuard in the mix.

That gives me more realistic signals, including bot traffic and operational
pressure that localhost will never give me.

That is exactly the point.
To study observability properly, I want a real server producing real signals.

## Terminal section

The goal is not to waste two weeks assembling the setup.
The project is already organized for that.

If you cloned the repository on a new machine, do this first:

```bash
cp .env.example .env
```

Then:

- local: `just up`
- VPS: `just deploy`

After that, do not stop at an empty stack.
Generate some signal:

- `just smoke`
- `just traffic 30 0.2`
- `just traffic-scenarios 20 0.1`
- `just o11ycheck`
- `just rules-load`
- `just alert-demo 30 0.1`

Use `traffic` when you want randomness from `/unstable`.
Use `traffic-scenarios` when you want a predictable cycle.
Use `alert-demo` when you want rules loaded and an alert-firing run in one command.

On the VPS, the production equivalents exist too, like:

- `just traffic-scenarios-prod 20 0.1`
- `just chaos-prod`
- `just calm-prod`

## Repo orientation

Quick orientation for the repository:

- infra and stack config: `docker/`
- app code: `api/`
- telemetry bootstrap: `api/src/api/infrastructure/telemetry.py`
- HTTP logs and request metrics: `api/src/api/presentation/http.py`

Two places, two responsibilities.

## Grafana walkthrough

For the cleanest flow:

1. `Connections > Data sources`
2. `Dashboards > LGTM Demo Overview`
3. `Dashboards > LGTM Flight Deck`
4. `Dashboards > VPS Health`
5. `Explore > Loki`
6. `Explore > Tempo`
7. `Alerting > Alert rules`

In local development, Grafana is on `http://127.0.0.1:3000` with `admin/admin`.

In the `kvm2` production profile, Grafana stays private on the WireGuard
network. The API is public through Traefik and HTTPS.

The repository already ships:

- `LGTM Demo Overview`
- `LGTM Flight Deck`
- `VPS Health`

So before creating random dashboards, use what is already here and understand
how the signals fit together.

## Closing

The person who used to wake up in the middle of the night to run `grep` in
production now has a panel with metrics, traces, and logs in the same place.

There are alert rules ready to warn before the customer does.
There is a real server generating real data.

That person is me, and this setup is the same base I am handing to you.

I am not pretending this video teaches all of observability.
But this is enough to take you out of absolute zero and put you on top of a
modern baseline you can evolve in real work or real projects.

If your head is already full of ideas, tell me what the next step should be:
more alerts, heavier Python instrumentation, deeper production hardening, or
something else entirely.

## 6. FAQ / Comment Replies

### "Why one VPS? That is a SPOF."

Correct.
This is a learning baseline, not an HA architecture.

### "Why no Kubernetes?"

Because Kubernetes would bury the fundamentals under orchestration complexity.

### "Why OpenTelemetry instead of just logs?"

Because logs are necessary, but not enough for fast diagnosis.

### "Do logs automatically become metrics?"

No.
In this project, metrics come from OTel instrumentation and collector pipelines.

### "Why LGTM and not Prometheus plus ELK?"

Because LGTM gives very clean correlation between logs, metrics, and traces
inside Grafana and is easier to explain in one project.

### "Why keep Grafana private?"

Because Grafana is an admin surface and should not be casually public in this
profile.

### "Can this go to production as-is?"

As-is, no.
As a foundation, yes.

You still need HA, backups, secret management, staged rollout discipline, and
more operational hardening.
