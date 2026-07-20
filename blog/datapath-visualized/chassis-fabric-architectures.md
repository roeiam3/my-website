---
layout: default
title: Datapath Visualized - Chassis Fabric Architectures
permalink: /blog/datapath-visualized/chassis-fabric-architectures/
project: datapath-visualized
---

# Chassis Fabric Architectures

A network fabric is a private, lossless mesh — internal or external — that interconnects all the forwarding ASICs in a system, so traffic can move between any ingress and any egress at full rate. The fabric is not a routed hop: no lookups happen there, and the entire system remains one logical device from the network's point of view.

An internal fabric is the traditional, monolithic design: the fabric lives inside the chassis (fabric cards on a backplane) and interconnects the line cards and their ASICs.

An external fabric (as in DriveNets' DDC) moves the same function into dedicated standalone devices — NCFs — connected to the forwarding boxes over cabled fabric interfaces. This adds cabling and operational complexity, but removes the chassis's physical scale ceiling and decouples vendor choice for each element. Internal vs. external is ultimately a decision about disaggregation, vendor choice, and price-to-performance.

Fabrics perform no lookups and no ACLs — QoS decisions happen in the queueing layer before the fabric, which itself only distinguishes a few cell priority classes. It is purely transport.

<img src="{{ '/assets/images/datapath-visualized/scheduled-fabric-data-path.png' | relative_url }}" alt="Credit-scheduled fabric data path: ingress VOQs, switch fabric planes, egress credit scheduler, and credit grants flowing back" style="width: 100%; max-width: 100%;">

<p class="meta"><em>Credit grants flow back from egress to ingress VOQs</em></p>

Before diving deeper, one concept is essential: head-of-line blocking.

HOL blocking occurs when the frame at the front of a queue can't be sent because its destination port is congested — and everything queued behind it is stuck waiting, even traffic destined for idle ports. A simple FIFO per ingress caps throughput at roughly 58% under uniform load. The fix is to queue traffic per *destination* rather than per source, and to send it at the rate each egress can actually absorb.

The result is the Virtual Output Queue.

## Virtual Output Queue

A VOQ is a queue held on the ingress ASIC that corresponds to a specific egress interface on an egress ASIC (in practice, per egress port × traffic class). A frame arriving at ingress is classified and placed into the VOQ matching its destination — slightly confusing at first, but not complicated:

The ingress ASIC forwards frames that need to go to a different ASIC into the VOQ. The VOQ that corresponds to a destination ASIC port uses a token-based system to notify the source ASIC when to send the frame. This ensures the destination egress ASIC is never congested by a source that keeps sending over the fabric.

It does this by generating a token amount based on available buffer size. As the buffer decreases, it sends the source ASIC tokens based on its decreasing buffers, which decreases the total frames being sent by the source ASIC.

The grant mechanism is called credit-based (egress-driven) scheduling — see: [Virtual output queueing](https://en.wikipedia.org/wiki/Virtual_output_queueing).
