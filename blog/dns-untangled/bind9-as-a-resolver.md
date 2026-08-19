---
layout: default
title: DNS Untangled - BIND9 as a Resolver
permalink: /blog/dns-untangled/bind9-as-a-resolver/
project: dns-untangled
---

# BIND9 as a Resolver

Lab build: install BIND9, put the resolver hat on, prove who answered.

## Lab topology

```
Cisco GW (GW-INTERNET)
 ├─ VLAN 10: 192.168.10.0/24 — BIND server = 192.168.10.1
 └─ VLAN 20: 192.168.20.0/24 — Linux client = 192.168.20.1
```

DHCP pools on the GW; pools must hand out `dns-server 192.168.10.1` 
## Naming: bind9 vs named

- **BIND** = the software project; **bind9** = the apt package; **named** = the actual daemon/service.
- `systemctl status bind9` works (alias) but `journalctl -u bind9` does NOT — logs live under `-u named`.

## Build steps

### 0. Get systemd-resolved out of the way

SERVER ONLY — clients keep theirs:

```bash
mkdir -p /etc/systemd/resolved.conf.d
cat > /etc/systemd/resolved.conf.d/disable-stub.conf << 'EOF'
[Resolve]
DNSStubListener=no
DNS=127.0.0.1
EOF
systemctl restart systemd-resolved
ln -sf ../run/systemd/resolve/resolv.conf /etc/resolv.conf   # non-stub file → lists real servers
```

Why: otherwise every plain `dig` on the server tests resolved, not BIND, and the box's own lookups bypass BIND. Never hand-edit resolv.conf — it's regenerated; move the **symlink** instead (`stub-resolv.conf` → `resolv.conf`). Verified: hand edits revert on reboot.

### 1. Install

{% include cmd-card.html
   variant="ops"
   badge="install"
   cmd="apt install -y bind9 bind9-utils bind9-dnsutils"
   desc="BIND is the project, bind9 is the package, named is the daemon." %}

### 2. Config anatomy — `/etc/bind/`

| File | Job |
|---|---|
| named.conf | includes the others |
| **named.conf.options** | global: listen, recursion, ACLs — the **resolver hat** |
| **named.conf.local** | zones — the **authoritative hat** |
| named.conf.default-zones | localhost zones + **root hints** (`zone "." type hint` — how BIND bootstraps the tree) |

The two hats from the lifecycle model are literally two config files on one box.

### 3. Working config (`named.conf.options`)

{% raw %}
```
acl "lab-clients" {
    127.0.0.0/8;
    192.168.10.0/24;
    192.168.20.0/24;
};

options {
    directory "/var/cache/bind";
    listen-on port 53 { any; };
    listen-on-v6 { any; };

    recursion yes;                      // this line = the server sets RA
    allow-recursion { lab-clients; };
    allow-query { lab-clients; };
    allow-query-cache { lab-clients; };

    dnssec-validation auto;
};
```
{% endraw %}

No forwarders → full recursion from root hints (lab choice: every walk visible). Production configs typically add: forwarders, explicit listen-on IPs, `allow-transfer { none; }`, `version "none";`, logging channels.

**Never open-resolver** (`any` on recursion) on a real network → DDoS amplification target. `localnets;` = reasonable shorthand for directly-attached subnets.

### 4. The reload ritual

Always in this order:

{% include cmd-card.html
   variant="ops"
   badge="reload"
   cmd="named-checkconf && rndc reload"
   desc="Silence from checkconf = pass. A missing semicolon takes down DNS; checkconf-before-reload is the habit." %}

### 5. IPv6 noise fix

Flood of `network unreachable resolving ... 2001:...` in the journal = box has no v6 route; named tries v6 NS addresses, falls back to v4, works but spams. Silence:

{% capture cmd_named_v4 %}echo 'OPTIONS="-u bind -4"' > /etc/default/named && systemctl restart named{% endcapture %}
{% include cmd-card.html
   variant="ops"
   badge="ipv4 only"
   cmd=cmd_named_v4
   desc="Stops named trying AAAA nameservers on a box with no IPv6 route." %}

## Verification chain (proving WHO answered)

| Evidence | Command | What it proved |
|---|---|---|
| Socket ownership | `ss -lunp \| grep :53` | named owns 53 on lo + 192.168.10.1; 127.0.0.53 gone |
| Cold-start fingerprint | first `dig` = 1143 ms, second = 0 ms | full recursion happened, then MY cache |
| Live query log | `rndc querylog on` + `journalctl -u named -f` | client queries appear in named's journal in real time |
| Kill test | stop named → client resolution dies | dependency proven |
| Cache dump | `rndc dumpdb -cache` → grep `/var/cache/bind/named_dump.db` | wikipedia records IN BIND's memory, TTLs counting down |

The cache lives in named's RAM — there is no live readable file; `dumpdb` serializes it on demand.

{% include cmd-card.html
   variant="cache"
   badge="cache inspect"
   cmd="dig @192.168.10.1 www.example.com +norecurse"
   desc="Ask BIND without recursion. A decremented TTL means the answer is already in named's memory." %}

## Findings & fixes (real tickets, self-inflicted)

1. **REFUSED for 192.168.20.1** — journal: `query (cache) '...' denied (allow-query-cache did not match)`. Client was outside the ACL. Fix: add 192.168.20.0/24, checkconf, reload. Textbook "some users can't resolve" = ACL scope.
   - Root cause of the surprise: the custom config had never actually landed; stock Debian BIND allows only directly-attached nets ("localnets" behavior) → VLAN-10 worked, VLAN-20 refused.
2. **VLAN-10 DHCP pool handed out `dns-server 8.8.8.8`** → those clients bypassed BIND entirely. Classic migration gap: new DNS deployed, DHCP still advertising the old one. Fix on the GW, then client lease renew: `dhclient -r && dhclient` / `ipconfig /release && /renew`; flush stale answers: `resolvectl flush-caches` / `ipconfig /flushdns`.
3. **`_gateway` mystery** — dig on a CLIENT returned `_gateway A 192.168.20.254` with `aa`, TTL 0, SERVER 127.0.0.53. Synthetic name invented locally by systemd-resolved for the default route; no DNS query ever left the box. Lesson: check the SERVER line and DiG version — it wasn't BIND, it wasn't even the same machine.

## The SERVER: 127.0.0.53 saga

- dig's `SERVER:` line shows the **first hop only** — the address dig mailed the packet to, read from resolv.conf. It cannot see beyond it.
- On stock Ubuntu clients that's forever 127.0.0.53 (local resolved stub), which then forwards to whatever `resolvectl status` shows (→ 192.168.10.1). Both facts true simultaneously.
- macOS has **no local stub** — resolv.conf lists the network's DNS directly, so dig shows the real server. Windows = third variant (DnsCache service; `ipconfig /displaydns`). Same protocol, different OS plumbing.
- Assemble the chain, never expect one tool to show it:

```
dig SERVER: line      → hop 1 (local stub or direct)
resolvectl status     → hop 2 (the real upstream)
journalctl -u named -f (on the server) → proof the query arrived
rndc dumpdb -cache    → proof of the memory
```

- Client bypass options: symlink resolv.conf to the non-stub file (dynamic + persistent, dig then shows the real server), or disable resolved entirely (Mac-style, loses local cache — useful on ONE lab client so every query hits the server's log).

## Command reference

```bash
# where does a package put its files
dpkg -L bind9 | grep named.conf

# service & logs (unit is named, not bind9)
systemctl status named
journalctl -u named -f            # follow live
journalctl -u named -n 50         # last 50
journalctl -u named --since "5 min ago"
journalctl -u named | grep -i refused

# config lifecycle
named-checkconf                   # validate (silence = pass)
rndc reload                       # apply config without restart
rndc status
rndc querylog on|off              # toggle query logging
rndc flush                        # wipe cache
rndc dumpdb -cache                # RAM cache → /var/cache/bind/named_dump.db
grep -A2 <name> /var/cache/bind/named_dump.db

# sockets
ss -lunp | grep :53

# client side
resolvectl status                 # the REAL upstream a stub forwards to
resolvectl flush-caches
dhclient -r && dhclient           # DHCP release/renew (Linux)
ls -l /etc/resolv.conf            # symlink target: stub-resolv.conf vs resolv.conf
```
