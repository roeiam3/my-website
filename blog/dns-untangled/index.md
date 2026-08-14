---
layout: default
title: DNS Untangled
permalink: /blog/dns-untangled/
project: dns-untangled
---

# DNS Untangled

<p class="meta">Started: 2026-08-14</p>


## What is DNS? 

A **distributed, hierarchical, cached** database mapping stable names to changing reality (IPs, mail servers, services).

- **Distributed** — each org manages its own data.
- **Hierarchical** — names are a tree; responsibility delegated downward via NS records.
- **Cached** — answers stored close to clients; the reason "DNS changes take time."

In the past, DNS was centrally managed, this solution was obviously not scalable and was only the beginning for DNS, and the result was what we know of it today.

`/etc/hosts` (Linux) and `C:\Windows\System32\drivers\etc\hosts` predate DNS and **still override it** for apps using the OS resolver. dig/nslookup bypass hosts entirely (straight to port 53) — so dig and ping disagreeing about a name is itself a diagnostic signal.

These are remenants of what DNS used to be at the start, a single file that dictates the query to data.

## The resource record

A resource record is the result of a query, every query is a question and every reply is the answer, the answer can vary in amount and response type, but generally speaking every successfull query receives a reply.

Below is an example of a reply ; 

Five fields, always this order:

```
mail.corp.local.   300   IN    A     10.1.5.20
name               TTL   class type  data (rdata)
```

## Where DNS's job ends

DNS's job ends when the correct IP is delivered. dig correct + site unreachable → firewall, dead server, or browser using its own DoH resolver. Not DNS.
