---
layout: default
title: DNS Untangled - Hierarchy, Domains & Zones
permalink: /blog/dns-untangled/hierarchy-domains-and-zones/
project: dns-untangled
---

# Hierarchy, Domains & Zones

Root does not forward your query to the TLD. Nothing is forwarded. The resolver makes every single query itself, and comes back to the middle after each one — twice holding nothing but a pointer.

{% include dns-walk-down-tree.html %}



## Domain vs. Zone

The example above illustrates the communication between the host and the resolver, what the resolver is responsible for, and how it interacts with every other component during normal DNS operation.

- **Domain** — the SLD (second-level domain, e.g. `google`) plus the TLD (top-level domain, e.g. `.com`). In the example above `roeiam` is the SLD and `.online` is the TLD. Everything below `roeiam`, such as `blog.roeiam.online`, is part of the `roeiam.online` domain and is served the same way.
- **Zone** — a file or a database that actually contains the resource records. `ns11`/`ns12` hold the resource records for `roeiam.online` in their zone, which is what makes them the authoritative source for the domain.
- **A zone is not the server holding it** — the authoritative servers don't have to sit in the TLD they answer for. `ns11.domaincontrol.com` is under `.com`, yet it answers queries for a `.online` domain. A nameserver's own name is just a hostname that has to resolve; it carries no authority on its own. The only thing tying it to your zone is the NS record in the `.online` delegation naming it.

## Querying the right layer

Works for any record type — NS, A, MX, TXT. Same pattern, different targets, answers different questions: what do users currently see vs. what does a specific server say vs. what does the zone actually contain vs. is the delegation chain itself intact. Most tickets are solved by comparing two of these.

{% include cmd-card.html
   variant="cache"
   badge="users' view"
   cmd="dig roeiam.online"
   desc="What do users currently see? Asks the configured resolver — cached if it has one." %}

{% include cmd-card.html
   variant="cache"
   badge="one server"
   cmd="dig @8.8.8.8 roeiam.online"
   desc="What does a specific server say? @ only changes the recipient." %}

{% include cmd-card.html
   variant="truth"
   badge="ground truth"
   cmd="dig @ns11.domaincontrol.com roeiam.online A +norecurse"
   desc="What does the zone actually contain? Straight to the authoritative, every cache bypassed." %}

{% include cmd-card.html
   variant="truth"
   badge="delegation chain"
   cmd="dig +trace roeiam.online"
   desc="Is the delegation chain itself intact? Full walk from the root." %}
