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

You just watched root and `com` return ANSWER 0 — not because they were hiding the address, but because `www.google.com` isn't in their zones. A zone ends where a delegation begins. Google's nameservers had the A record because **google.com** is their zone; on this site the same role is `roeiam.online` on `ns11`/`ns12`.

- **Domain** — what you register and everything under it. `roeiam` + `.online`; `blog.roeiam.online` is still part of that domain.
- **Zone** — the records a specific server set owns. File in BIND, table in Infoblox, partition in AD. Authority lives here, not in the registrar's marketing copy.
- **Server ≠ zone** — `ns11.domaincontrol.com` is a hostname under `.com` that answers for `.online`. The NS record in the `.online` delegation is what ties it to your zone; the hostname alone carries no authority.

Ticket pattern: "record exists in the console but doesn't resolve" → edited in the **parent** zone while the world gets referred to the **child** nameservers. Ask: which zone answers this name, and which zone did you touch?

## Querying the right layer

Same four questions for any record type — NS, A, MX, TXT. Most tickets: compare two of these and you're done.

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
