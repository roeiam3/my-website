---
layout: default
title: Datapath Visualized - Chassis Fabric Architectures
permalink: /blog/datapath-visualized/chassis-fabric-architectures/
project: datapath-visualized
---

# Chassis Fabric Architectures

A network fabric is a private, lossless mesh — internal or external — that interconnects all the forwarding ASICs in a system, so traffic can move between any ingress and any egress at full rate. The fabric is not a routed hop: the entire system remains one logical device from the network's point of view.

An **internal fabric** is the traditional, monolithic design: the fabric lives inside the chassis (fabric cards on a backplane) and interconnects the line cards and their ASICs.

An **external fabric** (as in DriveNets' DDC) moves the same function into dedicated standalone devices — NCFs — connected to the forwarding boxes over cabled fabric interfaces. This adds cabling and operational complexity, but removes the chassis's physical scale ceiling and decouples vendor choice for each element. Internal vs. external is ultimately a decision about disaggregation, vendor choice, and price-to-performance.

The fabric is purely transport: no lookups, no ACLs. QoS decisions happen in the queueing layer before the fabric, which itself only distinguishes a few cell priority classes.

## Cells, not packets

The fabric doesn't actually forward packets. The ingress ASIC slices each packet into fixed-size **cells**, sprays them across all available fabric links in parallel, and the egress ASIC reassembles them back into the original packet. This is why the fabric load-balances near-perfectly — there are no large flows to polarize onto a single link, as hash-based ECMP would — and why a fabric element failure is graceful: losing a fabric card (or an NCF in a DDC) just shrinks total fabric capacity instead of breaking flows.

## Credit grants flow back from egress to ingress VOQs

Before diving deeper, one concept is essential: **head-of-line blocking**.

HOL blocking occurs when the frame at the front of a queue can't be sent because its destination port is congested — and everything queued behind it is stuck waiting, even traffic destined for idle ports. A simple FIFO per ingress caps throughput at roughly 58% under uniform load. The fix is to queue traffic per destination rather than per source, and to send it at the rate each egress can actually absorb.

The result is the Virtual Output Queue.

## Virtual Output Queue

A VOQ is a queue held on the ingress ASIC that corresponds to a specific egress interface on an egress ASIC (in practice, per egress port × traffic class). A frame arriving at ingress is classified and placed into the VOQ matching its destination:

The ingress ASIC forwards frames that need to go to a different ASIC into the VOQ matching their egress port. The egress ASIC then issues **credits** back to that VOQ, telling the ingress when — and how much — it may send over the fabric. Credits reflect the rate at which the egress port can actually drain traffic, together with its available buffering: as the egress fills up or slows down, fewer credits flow back, and the ingress throttles automatically.

The congestion itself doesn't disappear — it is pushed back out of the fabric and held in the ingress VOQs, where the system has deep buffers and full QoS context to decide what to shape or drop. The fabric and the egress stay clean; the pain is absorbed where it can be managed intelligently.

When multiple VOQs hold credits at the same time, a fabric arbiter decides which one transmits in each cycle, keeping access to the fabric fair across ingress ports.

The grant mechanism is called credit-based (egress-driven) scheduling — see: [Virtual output queueing](https://en.wikipedia.org/wiki/Virtual_output_queueing).

<img src="{{ '/assets/images/datapath-visualized/scheduled-fabric-data-path.png' | relative_url }}" alt="Credit-scheduled fabric data path: ingress VOQs, switch fabric planes, egress credit scheduler, and credit grants flowing back" style="width: 100%; max-width: 100%;">

<p class="meta"><em>Credit grants flow back from egress to ingress VOQs</em></p>
