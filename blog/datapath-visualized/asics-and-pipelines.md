---
layout: default
title: Datapath Visualized - ASICs and Pipelines
permalink: /blog/datapath-visualized/asics-and-pipelines/
project: datapath-visualized
---

# ASICs and Pipelines

<p class="meta"><em>Disclaimer: silicon specs and product lineups move fast — the merchant and ASIC details below reflect the market as of July 17, 2026.</em></p>

We've discussed a lot about ASICs and how data moves through them, but now we'll dive deeper into what an ASIC actually is, the different types, popular "Silicon Merchants", use-cases to consider, and a more niche topic — the actual Pipeline residing inside the ASIC.

## What is an ASIC?

An ASIC (Application-Specific Integrated Circuit) is a chip manufactured to perform one or more specific tasks extremely fast and efficiently. The task is literally etched into the silicon at fabrication time — it can never be changed afterward. This fixed-function design is what makes it so fast and power-efficient: there's no general-purpose overhead, only circuitry that does the job.

ASICs are everywhere in daily life, because many devices need a specific function done fast, at scale, or on a tight power budget.

Examples:

- **Mobile phones** — The ISP (Image Signal Processor) that turns raw sensor data into photos is an ASIC, and so is the separate video codec engine that handles encoding/decoding (H.264/H.265/AV1).
- **AI accelerators** — Google's TPUs are ASICs built specifically around matrix multiplication.
- **Crypto mining** — Bitcoin miners are ASICs that do exactly one thing: compute SHA-256 hashes absurdly fast.

The rule of thumb: any task that is well-defined and demands performance, volume, or power efficiency will eventually get an ASIC built for it.

Networking ASICs are exactly that — the task of forwarding frames is well-defined, extremely high-volume, and latency-sensitive.

## Some ASIC History

Before forwarding ASICs existed, "software switching" was the main method of moving frames around: every frame had to go through the CPU. The CPU could do everything — parse the frame, look up the CAM table, rewrite headers — that's literally what software switching was. The problem wasn't capability, it was efficiency: a general-purpose fetch-decode-execute cycle burns hundreds of clock cycles on work that dedicated logic can do in a handful, and the CPU handles frames one at a time while ports keep getting faster. Software switching didn't scale as link speeds exploded.

Given that the task is well-defined — "MAC from source X goes out port Z toward destination Y" — the most efficient solution is dedicated hardware that does exactly that. That's the simple vision behind ASICs entering the networking space.

Modern networking ASICs implement this as a **pipeline**. The pipeline works against tables: routing/forwarding tables (FIB) are programmed down from the control plane, while MAC tables are learned directly in hardware by the data plane itself. As a frame moves through the pipeline, the ASIC looks up these tables and rewrites fields within the frame — copying values from its tables (next-hop MAC, egress port, VLAN tags, etc.) into the frame's headers — all at line rate.

ASICs are the hardware; the pipeline is what the die actually does to the frame, deterministically — every frame passes through the same fixed stages in the same fixed time.

Before going deeper into pipelines, let's go through some popular "Silicon Merchants", the different ASIC types, and the different hardware classes they live in. This will help illustrate later what the pipeline is, how it changes between designs, and what it actually does for every class of device.

## Silicon Merchants

Silicon Merchants is a meme-name for companies that sell ASICs (and thereby silicon). The ASIC itself is many components, but the most important part of it is arguably the ASIC die.

All the different vendors share the same market, therefore all of them compete for the same piece of the cake. However some vendors have larger pieces of the cake in specific portions such as wireless, ISPs, datacenters and campuses — this would also be noted.

Additionally, note that every ASIC has pros and cons: the ASIC has to compromise in some elements and be very good at others to be financially viable. Imagine a triangle — one edge has "Cost", another has "Feature-rich", and the last has "Bandwidth and Latency". You usually can have 2 or 1, but never all 3, which is why there are so many ASICs and vendors. (This is not sponsored by any, but would gladly be happy to be.)

### Broadcom

The Biggest "Merchant Sillicon", Broadcom has many different segments they operate within (NICs, Trancievers, CPOs etc.), Their biggest branch is ASICs for networking equipement.

<div class="media-row">
  <div class="media-row__text">
    <ul>
      <li><strong>BCM78910 — Tomahawk 6</strong> — 102.4Tb/s throughput on a single chip. Port configurations: up to 64x1.6TbE, 128x800GbE, 256x400GbE or 512x200GbE. Comes in two variants: the BCM78910 with 128 "Peregrine" SerDes cores (1,024 lanes of 106.25G PAM4) and the BCM78914 with 64 "Condor" SerDes cores (512 lanes of 212.5G PAM4) — same total throughput, different lane speed tradeoffs.<br><br>Tomahawk 6 is the industry's first 102.4Tb/s ASIC and the first to support native 1.6TbE ports, focused on bandwidth and latency for AI scale-up and scale-out fabrics (training and inference).</li>
    </ul>
  </div>

</div>

<div class="media-row">
  <div class="media-row__text">
    <ul>
      <li><strong>BCM56880 — Trident 4</strong> — 12.8Tb/s throughput; 128x100GbE or 32x400GbE. Feature-rich ASIC for general use such as enterprise, campus and feature-heavy datacenter leaf roles; trades raw bandwidth for lower cost and support for advanced, flexible features (full VXLAN routing, NAT, large table and ACL scale).<br><br>Its pipeline is programmable via NPL (Network Programming Language), allowing new protocols and forwarding behaviors to be added after manufacturing.</li>
    </ul>
  </div>
</div>

<div class="media-row">
  <div class="media-row__text">
    <ul>
      <li><strong>BCM99450 — Jericho 4</strong> — 51.2Tb/s throughput per device, router-class ASIC. Its defining trait is deep buffering: attached HBM memory provides up to 160x more packet buffering than on-chip memory, enabling zero-loss behavior under heavy congestion. Supports the features ISPs and carriers depend on — MPLS, Segment Routing, OAM, hierarchical QoS, line-rate MACsec — and pairs with Ramon 4 fabric elements to scale into massive chassis and distributed routing systems.</li>
    </ul>
  </div>

</div>

### Cisco

Another giant in the space — but with a twist: Cisco designed silicon for its own boxes for decades, and with the Silicon One lineup (2019) it began selling that silicon on the open market as well, becoming both a systems vendor and a silicon merchant. Silicon One's pitch is one unified architecture spanning switching and routing, with different devices tuned along the same axes we saw at Broadcom.

<div class="media-row">
  <div class="media-row__text">
    <ul>
      <li><strong>Silicon One G300</strong> — The AI/HPC crown jewel: 102.4Tb/s throughput, up to 64x1.6TbE ports, built on 512x200G PAM4 SerDes — a direct Tomahawk 6 competitor. Differentiators include a fully shared packet buffer and a P4-programmable pipeline.</li>
    </ul>
  </div>
</div>

<ul>
  <li><strong>Silicon One E100</strong> — 6.4Tb/s, power-efficient, feature-rich ASIC for enterprise datacenter top-of-rack and leaf/spine roles; powers Cisco's Nexus 9300 "Smart Switches", where it's paired with AMD Pensando DPUs to host services (stateful segmentation, NAT, IPsec) directly in the switch.</li>
</ul>

### NVIDIA

The hottest competitor in the space right now — though not a new one. NVIDIA entered networking by acquiring Mellanox in 2020, which brought two product lines with it: Quantum ASICs for InfiniBand and Spectrum ASICs for Ethernet. InfiniBand was long the de-facto standard fabric for AI/HPC and scientific clusters, and NVIDIA initially leaned on it heavily.

Nowadays NVIDIA sells both: Spectrum for Ethernet and Quantum for InfiniBand. InfiniBand remains the fastest solution on paper, with real benefits for AI/HPC workloads (lossless fabric, in-network computing) — but it comes at a cost: while technically an open standard, NVIDIA is in practice the only meaningful vendor, so adopting it means a single-vendor platform that doesn't inter-operate with Ethernet without gateways.

<div class="media-row">
  <div class="media-row__text">
    <ul>
      <li><strong>Spectrum-6</strong> — NVIDIA's best Ethernet platform, developed specifically for AI. A direct competitor to Tomahawk 6 and the G300: 102.4Tb/s of switching and routing on a single chip, 200Gb/s PAM4 SerDes, 160MB of fully shared packet buffer, and silicon-photonics co-packaged optics (CPO) in the SN6000 switch series.</li>
    </ul>
  </div>
</div>

<ul>
  <li><strong>Quantum-X800</strong> — NVIDIA's best InfiniBand platform, developed specifically for AI. There is no direct competitor to InfiniBand per se — the competition is Ethernet itself — so this is simply the next-gen platform for companies that choose the InfiniBand route. Built on the Quantum-3 ASIC with 800Gb/s (XDR) ports — the flagship Q3400 switch delivers 144x800G — plus SHARP v4 in-network computing, letting the switch itself participate in collective operations. Marketed for trillion-parameter-scale generative AI; a co-packaged optics variant exists as the separate Quantum-X Photonics line.</li>
</ul>

## Pipelines

The main reason for bringing up all these different vendors and device segments is to showcase the need for different hardware. Each segment (ISP, datacenter, campus, etc.) and even sub-segment has its own needs, therefore every ASIC is built differently — especially their pipelines.

The pipeline itself is a hardware attribute of the ASIC. The easiest way to picture it is an assembly line: a series of physical stages, where each frame passes through every stage in order, one stage per clock tick. Each stage holds one frame at a time — but all stages work simultaneously, each on a different frame. While one frame is being looked up, the next is already being parsed, and another is being received.

Frames don't wait on each other inside the pipe; everything advances in lockstep, which is exactly where the pipeline's determinism and line-rate throughput come from.

**Determinism** — brought up a bunch of times but never elaborated for those who might not be familiar — is a description of a system, process, or mathematical model whose outcome is completely predictable and reproducible, and free of randomness.

ASICs and pipelines being deterministic is crucial. knowing exactly how long a frame spends inside the ASIC gives you a fixed per-hop cost when reasoning about end-to-end latency.

A pipeline in an ASIC is a deterministic sequence of actions that every frame goes through — fixed stages, fixed time per stage, same path for every frame.

To understand it better, let's imagine a basic ASIC pipeline at its purest form. Let's assume you want to do only the action of switching. You'd need the following:

1. Receive a frame
2. Parse it — read the SRC and DST MAC addresses
3. (Optional for our example) Learn the SRC MAC
4. Look up the DST MAC in a table that maps MAC → Port (hit → forward to that port, miss → flood)
5. Move the frame out of the original port toward the new port

This basic function is well-defined, needs to happen fast with minimal latency, and is deterministic at its core.

A pipeline is exactly that — but depending on the ASIC, different functions and checks are added as stages along the way.

A great way to imagine a pipeline is with a conveyor belt that moves items along pre-defined functions, such as mold injection. Anyone who played a video game such as Create, Factorio, or any factory game can instantly recognize a pipeline as identical to what an ASIC pipeline does.

{% include pipeline-example.svg %}

<p class="meta"><em>Teal = pipeline stages · Amber = queueing · Gray = physical I/O</em></p>
