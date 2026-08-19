---
layout: default
title: DNS Untangled - Recursive vs Authoritative
permalink: /blog/dns-untangled/recursive-vs-authoritative/
project: dns-untangled
---

# Recursive vs Authoritative — the query lifecycle

## The cast

| Role | What it does | Example |
|---|---|---|
| **Stub resolver** | Client-side; asks one configured resolver, waits. Zero legwork | OS built-in (systemd-resolved, Windows DNS Client) |
| **Recursive resolver** | Walks the hierarchy, caches, returns final answers | Enterprise BIND, ISP resolver |
| **Forwarder** | Relays to a real resolver upstream; caches; no tree-walking | Home gateway, branch DNS |
| **Authoritative** | Answers only from its own zones: answer / referral / NXDOMAIN. Never goes looking | Roots, TLDs, a domain's NS |

## The rules

1. **Recursion is a configured service, not a reflex** (`recursion yes;` in BIND → server advertises RA). Roots/TLDs have it off by design, forever.
2. **Every level knows only its own zone.** Nobody holds the full map; the complete answer emerges from the resolver stitching referrals together.
3. **A referral IS an authoritative answer** — delegation records from the server's own zone. Referral ≠ recursion.
4. **Jurisdiction rule:** NXDOMAIN may only be declared for names inside the answering server's zone. Fake TLD → root says it. Unregistered .com → TLD says it. Missing subdomain → only the domain's own servers say it.
5. **Hub, not chain.** The resolver originates every query. Root/TLD/authoritative never talk to each other; the authoritative only ever sees resolver IPs.
6. **The resolver caches everything** — answers AND referrals — so full walks are rare.
7. An authoritative server matches **the deepest suffix it has data for**, then answers/refers/denies. That's all it ever does.

## Lifecycle (nothing cached)

```
stub → resolver:            "A for blog.roeiam.online?" (RD=1)
resolver → root:            referral: ".online is delegated to these servers"
resolver → .online TLD:     referral: "roeiam.online → ns11/ns12.domaincontrol.com"
resolver → ns11:            ANSWER (aa): roeiam.online A …, TTL …
resolver → stub:            the IP (cached for next time)
```

## RD / RA — two independent switches

- **RD** (Recursion Desired): set by the client. Plain dig = RD 1; `+norecurse` = RD 0. `+norecurse` flips one bit in the outgoing packet — it changes what dig asks for, never what dig does. dig never recurses; `@server` only changes the recipient.
- **RA** (Recursion Available): set by the server — the fingerprint of a resolver.

| RA | RD | Result |
|---|---|---|
| yes | 1 | full recursive lookup |
| yes | 0 | **cache-only answer** (cache-inspection trick) |
| no | 1 | own-data/referral anyway; RD ignored |
| no | 0 | own-data only — ground truth |

## First move on a wrong-answer ticket

{% include cmd-card.html
   variant="cache"
   badge="users' view"
   cmd="dig roeiam.online +short"
   desc="What the resolver your machine uses is serving right now — cache included." %}

{% include cmd-card.html
   variant="truth"
   badge="ground truth"
   cmd="dig @ns11.domaincontrol.com roeiam.online +short +norecurse"
   desc="What the zone actually contains. Every cache layer bypassed." %}

Disagree → stale cache / TTL: wait or flush. Agree but wrong → zone data: fix the record. Two commands, two buckets.
