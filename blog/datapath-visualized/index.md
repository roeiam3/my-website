---
layout: default
title: Datapath Visualized
permalink: /blog/datapath-visualized/
project: datapath-visualized
---

# Datapath Visualized

<p class="meta">Started: 2026-07-03</p>

Visual walkthroughs of how traffic moves through network devices — from ingress to forwarding decision to egress.

## What This Series Covers

Each entry breaks a datapath into clear stages:

1. **Ingress** — where packets arrive and how they are classified.
2. **Lookup** — routing, switching, ACL, and policy decisions.
3. **Rewrite** — header changes, NAT, encapsulation, and QoS marking.
4. **Egress** — queueing, scheduling, and transmission.

## Why Visualize the Datapath

Understanding *what* a device does is useful. Understanding *where* in the pipeline it happens makes troubleshooting and design much faster — especially when symptoms could come from ACL drops, routing lookups, or output queue congestion.

More pages will be added here as the series grows.
