---
layout: default
title: DNS Untangled - Hierarchy, Domains & Zones
permalink: /blog/dns-untangled/hierarchy-domains-and-zones/
project: dns-untangled
---

# Hierarchy, Domains & Zones


{% include dns-hierarchy.svg %}

- **Roots:** 13 named identities, 12 operators, ~1,900 anycast instances; every instance serves the ENTIRE root zone (~1,500 TLD delegations). Redundancy, not partitioning.
- **TLDs:** same model; nearly pure referral machines.
- **Authoritative servers:** hold the actual zone data. google.com's A record exists in exactly one place: Google's zone.

## Domain vs. Zone

- **Domain** = a name + anything under it, such as www.Google.com
- **Zone** = a file or a database that contains all records for a given administrative zone, it contains A records, AAA records, PTRs, CNAMEs etc..



## Querying the right layer

Works for any record type — NS, A, MX, TXT. Same pattern, different targets, answers different questions: what do users currently see vs. what does a specific server say vs. what does the zone actually contain vs. is the delegation chain itself intact. Most tickets are solved by comparing two of these.

{% include cmd-card.html
   variant="cache"
   badge="users' view"
   cmd="dig www.example.com"
   desc="What do users currently see? Asks the configured resolver — cached if it has one." %}

{% include cmd-card.html
   variant="cache"
   badge="one server"
   cmd="dig @8.8.8.8 www.example.com"
   desc="What does a specific server say? @ only changes the recipient." %}

{% include cmd-card.html
   variant="truth"
   badge="ground truth"
   cmd="dig @ns1.example.com www.example.com A +norecurse"
   desc="What does the zone actually contain? Straight to the authoritative, every cache bypassed." %}

{% include cmd-card.html
   variant="truth"
   badge="delegation chain"
   cmd="dig +trace www.example.com"
   desc="Is the delegation chain itself intact? Full walk from the root." %}


