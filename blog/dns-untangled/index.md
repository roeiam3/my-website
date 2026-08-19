---
layout: default
title: DNS Untangled
permalink: /blog/dns-untangled/
project: dns-untangled
---

# DNS Untangled

<p class="meta">Started: 2026-08-14</p>

## What is DNS?

DNS maps one piece of data to another — usually a name to an IP, sometimes a name to another name.

`google.com` beats memorising whatever IP sits behind it today. That IP changes; the name doesn't. DNS is the bookkeeping that lets you swap the backend without retraining everyone.

Everything in this series comes from three facts:

**Distributed** — you hold your zone, your registrar holds the delegation above you, nobody holds the whole internet in one place.

**Hierarchical** — names are a tree. NS records carve off responsibility downward. A server knows its zone and where its authority stops. It does not look below that line on its own.

**Cached** — resolvers store answers for the TTL instead of re-asking. Fast, cheap, and the reason "I changed the record" and "users still see the old one" are different problems.

## Why it has to work this way

A root server that stored every domain on the internet would be absurd — every new subdomain, every A record edit, all on thirteen logical identities. Root doesn't try. It knows ~1,500 TLD delegations and nothing under them.

Ask root for `blog.roeiam.online`: referral toward `.online`, not an address. Ask `.online`: referral to whoever holds `roeiam.online`. Ask `ns11.domaincontrol.com`: finally an A record. Each hop only holds its slice.

13 letter identities (`a`–`m.root-servers.net`), 12 operators, 1000+ anycast instances — and every instance serves the **entire** root zone. Redundancy, not partitioning.

## Before DNS

`/etc/hosts` on Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows. This is what DNS replaced — one flat file, manually maintained, copied around. It didn't scale, which is exactly why DNS exists.

Both files are still there, and they **still override DNS** for anything using the OS resolver. `dig` and `nslookup` don't — they go straight to port 53 and skip the hosts file entirely.

Which makes this a free diagnostic: **if `dig` and `ping` disagree about a name, check the hosts file.** You'll hit this on somebody's laptop eventually.

## The resource record

A resource record is a single entry inside a zone. It exists whether or not anyone ever queries it — it's stored data, not a response. Query responses *carry* records, but the records live in the zone.

Five fields, in this order:

```
mail.corp.local.   300   IN    A     10.1.5.20
name               TTL   class type  rdata
```
<br>

- **name** — what the record is about
- **TTL** — how long anyone may cache it, in seconds (Doesn't apply to the server itself)
- **class** — effectively always `IN` (internet). The others exist but you won't meet them outside `version.bind` trivia.
- **type** — what kind of record this is: `A` (IPv4), `AAAA` (IPv6), `CNAME` (name to name), `NS` (delegation), `MX`, `PTR`, `SOA`, and so on.
- **rdata** — the actual payload, and its shape depends entirely on the type.

A **zone** is those records plus the authority to answer for them. BIND: text file on disk. AD: directory partition. Infoblox: GUI over a database. Same rules — don't assume "zone" always means "a file you can `cat`."

## Where DNS's job ends

DNS's job is finished the moment the correct answer is delivered.

`dig` returns the right IP and the site still won't load? Firewall, dead service, routing, or a browser on DoH — not DNS.

Stop debugging DNS once the answer is correct.
