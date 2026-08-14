---
layout: default
title: DNS Untangled - Reading Responses
permalink: /blog/dns-untangled/reading-responses/
project: dns-untangled
---

# Reading Responses

Status and ANSWER count are independent dimensions.

## RCODEs

| Status | Meaning | Typical cause |
|---|---|---|
| NOERROR | Query processed fine (says nothing about record count) | see NOERROR family |
| NXDOMAIN | Name does not exist — no records of any type, nothing under it | typo, deleted record, expired domain |
| SERVFAIL | Broke while processing | unreachable authoritatives, zone misconfig, DNSSEC failure |
| REFUSED | "I **won't** serve this" | ACL/policy, or wrong jurisdiction on a non-recursing server (**lame delegation flag**) |
| FORMERR / NOTIMP | Malformed query / unimplemented opcode | rare; middleboxes |
| *(timeout)* | No response at all — not an RCODE, the absence of one | server down, port 53 blocked. **Network problem, not DNS logic** |

## The NOERROR family

ANSWER: 0 has four meanings:

| Pattern | Name | Meaning |
|---|---|---|
| ANSWER 1+ | Answer | happy case |
| ANSWER 0, **SOA** in AUTHORITY | **NODATA** | name exists, no records of the asked type (e.g., AAAA on an A-only name) |
| ANSWER 0, **NS** in AUTHORITY | Referral | signpost — keep walking |
| ANSWER 0, resolver, RD=0 | Cold cache | "nothing on hand, and you said don't fetch" |

NODATA vs referral: look at **what's in AUTHORITY** — SOA vs NS.

REFUSED vs empty NOERROR: **won't vs can't.** Empty NOERROR = valid "don't know." REFUSED from a delegated NS = five-alarm lame delegation; from a resolver = you're outside its ACL.

## Flags

| Flag | Meaning |
|---|---|
| qr | this is a response |
| rd | recursion was desired (echo of MY query) |
| ra | server offers recursion (resolver fingerprint) |
| aa | answer from own zone data — never set on cached answers, even correct ones |
| tc | truncated; retry over TCP (UDP/EDNS bug class) |

| Flags seen | Talking to |
|---|---|
| aa, no ra | authoritative, its own zone |
| ra, no aa | recursive resolver — normal, not broken |
| neither; ANSWER 0; NS in AUTHORITY | parent giving a referral |
| aa + ra | dual-role box (AD DC / enterprise BIND); flags show which hat answered |

## One-glance triage

- NXDOMAIN → check zone/typo/negative-cache
- NODATA → wrong record type / missing record
- SERVFAIL → lookup process broken (path, DNSSEC, zone health)
- REFUSED → jurisdiction or ACL
- timeout → network layer, stop debugging DNS
