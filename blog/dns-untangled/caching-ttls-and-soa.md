---
layout: default
title: DNS Untangled - Caching, TTLs & SOA
permalink: /blog/dns-untangled/caching-ttls-and-soa/
project: dns-untangled
---

# Caching, TTLs & SOA

## Contract and countdown

A record's TTL is set once, in the zone. From then on:

- The **authoritative** always serves the full original value (static — never counts down). Verified in lab: two direct queries 69s apart, both TTL 86400.
- Every **cache** starts a private countdown from the moment IT fetched, serves the remainder, discards at zero, refetches on next demand.

No pushes, no sync — just independent egg timers everywhere, each started at a different moment.

## "Propagation" is a lie

Nothing spreads. The instant a zone changes, the authoritative serves new data to anyone who asks (verifiable immediately with `dig @auth +norecurse`). What people call propagation is thousands of independent cache countdowns expiring at different times — which is why changes look "patchy." **Worst-case convergence = the record's TTL at the moment of change.**

## The cache stack

```
browser → OS stub (systemd-resolved / Windows DnsCache) → internal resolver (BIND) → [forwarder →] upstream
```

Each layer counts down independently. "I flushed DNS and it's still wrong" = flushed one layer of four.

## TTL strategy

| Record class | TTL | Why |
|---|---|---|
| NS delegations, stable infra | 1–2 days | rarely change; heavy caching = resilience |
| Normal service records | 1–4 h | balance |
| Failover/load-balanced endpoints | 60–300 s | traffic moves in minutes |
| During a planned change | ≤300 s | runbook below |

Trade-off is real both ways: low TTL = agility but more query load and less outage cushion (caches drain fast if your DNS host goes down); high TTL = cheap and resilient but slow to fix mistakes.

Field example (lab capture): `www.wikipedia.org 86400 CNAME dyna.wikimedia.org` (stable alias, long) → `dyna.wikimedia.org 300 A ...` (geo/failover endpoint, short). Long-TTL pointer to a short-TTL mover — a standard pattern.

## The migration runbook (TTL pre-lowering)

Record with TTL 86400 must move Friday 18:00:

1. **T−48h: lower the TTL only** (86400 → 300). Must happen **at least one OLD-TTL-length before the change** — caches holding the old record don't learn the new TTL until their current copy expires.
2. **T−0: change the record.** World converges within ~5 min (everyone now holds ≤300s copies).
3. **T+5m: verify both layers.**

{% include cmd-card.html
   variant="truth"
   badge="ground truth"
   cmd="dig @ns1.example.com www.example.com +norecurse"
   desc="Authoritative answer — what the zone contains right now." %}

{% include cmd-card.html
   variant="cache"
   badge="cache view"
   cmd="dig @1.1.1.1 www.example.com"
   desc="What a public resolver still holds. Plain dig is the same idea against your local resolver." %}
4. **Keep the old server alive** through the window — mid-session users and TTL-violating caches still hit it.
5. **T+1d: restore the normal TTL.**

Free bonus: while TTL is 300, rollback also takes 5 minutes.

**TTL violators to expect (long-tail stragglers):** resolver clamping (floors ~30–60s, ceilings 1–2 days), browser-internal caches, **the JVM** (historically caches DNS forever → "app still hits the old DB until restarted" is a real recurring ticket), misbehaving ISP resolvers. Honest stakeholder promise: "vast majority within TTL; stragglers are client-side and the old server catches them."

## SOA — the zone's ID card

One per zone, always at the apex. Live example captured in lab (`dig AAAA slashdot.org` → NODATA):

```
slashdot.org. 180 IN SOA ns11.constellix.com. dns.constellix.com. 2015010589 43200 3600 1209600 180
                         MNAME(primary)       RNAME(admin@)       SERIAL     REFRESH RETRY EXPIRE MINIMUM
```

**Operator-relevant fields:**

- **SERIAL** — zone version number; every edit must bump it; secondaries compare serials to sync. *Mismatched serials = the smoking gun for "one server answers old data."*
- **EXPIRE** — if a secondary can't reach the primary this long, it stops answering entirely (zones have silently died this way).
- **MINIMUM** (+ the SOA's own TTL; lower wins) — **negative-caching TTL**: how long resolvers cache NXDOMAIN/NODATA for this zone. This is why "I just created the record and it still says NXDOMAIN" happens — the *absence* was cached before the record existed.
- REFRESH/RETRY: secondary check-in cadence. Park until primary/secondary session.

One-sentence takeaway: **SOA = version number for replication + the "how long to cache a NO" timer.** Negative answers carry the SOA in AUTHORITY because "nothing" has no record of its own to carry a TTL.
