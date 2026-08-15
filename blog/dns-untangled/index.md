---
layout: default
title: DNS Untangled
permalink: /blog/dns-untangled/
project: dns-untangled
---

# DNS Untangled

<p class="meta">Started: 2026-08-14</p>

## What is DNS?

DNS is a database that maps data to data — a name to an IP, or a name to another name.

Why bother? Because `google.com` is easier to remember than whatever address is actually behind it. And even if a site collapses everything down to a single anycast IP, you'd still be memorising a different set of numbers for every site you ever visit. Names are stable; the reality behind them changes. DNS is the layer that lets one change without breaking the other.

Three properties do the heavy lifting, and everything else in this series falls out of them:

**Distributed** — every organisation holds its own records for its own zones, and is responsible for registering itself with whoever sits above it in the tree. Nobody holds the whole thing.

**Hierarchical** — names form a tree, and responsibility is handed downward through NS records. A server knows its own zone and where its authority ends. It does not know what's below the boundary.

**Cached** — once a resolver gets an answer, it holds it for the TTL instead of asking again. Fewer queries, faster responses, less congestion. It's also the reason "DNS changes take time."

## Why it has to work this way

Imagine a root server that knew every domain on the internet. Every registration, every A record change, every new subdomain anyone spins up — all of it, on thirteen server identities. Impossible, and pointless.

So the root doesn't try. It knows the TLDs and nothing else. Ask it about `www.example.com` and it says: *I don't have that, but `.com` is over there, go ask them.* The `.com` servers do the same thing one level down — they don't know the address, they know who's authoritative for `example.com`. Each server only needs to hold its own slice and know how to point you at the next hop.

That's the whole trick. Responsibility gets carved up so nobody carries too much, and the tree structure is what makes the handoffs unambiguous.

For scale: 13 root server identities (`a` through `m.root-servers.net`), run by 12 organisations, serving roughly 1,500 TLD delegations — and those 13 letters are actually well over a thousand physical servers worldwide, sharing addresses via anycast. Every one of them knows every TLD. None of them know your domain.

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

A **zone** is the collection of these records plus the authority to answer for them. In BIND that's literally a text file on disk. In Active Directory it lives in the directory database; in Infoblox it lives behind a GUI. Same data, same rules, different storage — worth remembering before assuming "zone" means "file."

## Where DNS's job ends

DNS's job is finished the moment the correct answer is delivered.

`dig` returns the right IP and the site still won't load? That's a firewall, a dead service, a routing problem, or a browser quietly using its own DoH resolver instead of yours. Not DNS.

Knowing where the boundary sits saves a lot of time pointed at the wrong system.
