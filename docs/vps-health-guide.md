# VPS Health Guide

This dashboard is the infrastructure view of the demo environment. It is where
you answer: "Is the server itself under pressure?"

Dashboard path in Grafana:

- `Dashboards > LGTM Demo > VPS Health`

## What this dashboard is for

Use this dashboard when you want to separate application problems from machine
problems.

It helps you answer questions like:

- Is the CPU saturated?
- Is memory pressure building up?
- Is the disk filling up?
- Is network traffic spiking?

## Top row: current host status

### CPU Used (%)

What it measures:

- current CPU usage percentage

What the query is doing:

- it looks at CPU idle time from `node_cpu_seconds_total`
- it subtracts idle from `100`

What that means in practice:

- high CPU for a sustained period means the machine may be saturated
- brief spikes are normal; long plateaus are more suspicious

How to explain it:

- "This is how busy the server CPU is right now."
- "If this stays high, the host itself may be the bottleneck."

### Memory Used (%)

What it measures:

- current memory usage percentage

What the query is doing:

- it compares `MemAvailable` to `MemTotal`
- it turns the remaining portion into used percentage

What that means in practice:

- rising memory usage is not automatically bad
- what matters is whether it keeps climbing and stays high

How to explain it:

- "This tells me how much RAM the operating system considers in use."
- "If this stays pinned, I start thinking about memory pressure."

### Disk Used (%)

What it measures:

- used disk percentage

What the query is doing:

- it compares available bytes to total bytes
- it excludes virtual filesystems like `tmpfs` and `overlay`

What that means in practice:

- this is capacity pressure, not disk speed
- if this keeps climbing, future writes and retention become a risk

How to explain it:

- "This is storage consumption, not disk performance."
- "It answers whether the server is running out of room."

### Network Throughput (B/s)

What it measures:

- total network traffic per second

What the query is doing:

- it sums receive and transmit bytes per second
- it ignores loopback and Docker virtual interfaces

What that means in practice:

- a spike can mean user traffic, bots, scans, or a noisy workload

How to explain it:

- "This is the network pulse of the VPS."
- "It shows whether traffic volume is hitting the host, not just the app."

## Middle row: time series trends

### CPU and Memory (%)

What it measures:

- CPU and memory on the same timeline

What the query is doing:

- it plots the same CPU and memory formulas used in the top row
- but now across time instead of a single current value

What that means in practice:

- you can see whether both rise together
- that helps you recognize load patterns, bursts, or resource pressure

How to explain it:

- "The top row is current status; this chart shows the trend."
- "If CPU and memory rise together, the host is probably under real load."

### Network RX/TX (B/s)

What it measures:

- incoming traffic (`rx`)
- outgoing traffic (`tx`)

What the query is doing:

- one line measures receive bytes per second
- the other measures transmit bytes per second

What that means in practice:

- this helps you see direction, not only total volume
- asymmetry can reveal different traffic patterns

How to explain it:

- "Now I can separate incoming and outgoing traffic."
- "That makes the network story more precise than one total number."

## Bottom row: storage trend

### Disk Used (%)

What it measures:

- disk usage percentage over time

What the query is doing:

- it plots the same storage formula as the stat panel
- but across the selected dashboard range

What that means in practice:

- this is how you notice slow disk growth instead of just a single snapshot

How to explain it:

- "This tells me whether storage usage is creeping up or staying stable."
- "It is a capacity trend view, not an IOPS or latency chart."

## Suggested recording flow

If you want a clean infrastructure story on camera:

1. Start with the four stat panels to show the current state of the host.
2. Move to `CPU and Memory (%)` to explain trend versus snapshot.
3. Show `Network RX/TX (B/s)` to talk about traffic direction.
4. End with `Disk Used (%)` to explain capacity growth over time.

## Short talk tracks

- "This dashboard answers whether the machine itself is healthy."
- "Application pain and host pain are not always the same thing."
- "This is the infrastructure baseline behind the demo."
