---
layout: default
title: Datapath Visualized - The Different Planes and RPs
permalink: /blog/datapath-visualized/planes-and-rps/
project: datapath-visualized
---

# The Different Planes and RPs

In networking, there are several abstract concepts that help illustrate how network devices and protocols interact, and how the state of devices, tables and topologies is built. In this brief explanation, I'll go through them.

## Data Plane

The data plane is transit traffic — packets the device forwards on behalf of others, handled entirely in the ASIC fast path. A ping from one source to another passes *through* the device without the device caring about its contents; forwarding it is the whole job.

## Control Plane

The control plane refers to traffic and computation that builds the state of the network. The way a ping is forwarded is derived from state built by the control plane: a ping passes through Node A and not Node B because OSPF dictated it. Exchanging OSPF messages, building the topology, computing the best path — all of that is control plane work.

## Management Plane

The management plane is traffic to and from the operator, *about* the device rather than through it — SSH sessions, SNMP, syslog, NTP. For example, a power distribution unit (PDU) sending an SNMP trap when its state changes. It has no bearing on how traffic is forwarded, and it's invisible to the customers of the network.

## Route Processor

The Route Processor (RP) is the device's brain and is responsible for the control plane. The RP generates protocol traffic such as OSPF hellos and LSAs or STP BPDUs, establishes neighbor relationships, computes best paths, and handles tasks that are complex or non-deterministic. It is usually a general-purpose multi-core CPU that sits *beside* the forwarding ASICs — logically and often physically separate from them.

The RP and the ASIC talk in both directions:

**Down — programming the hardware.** The control plane builds the RIB (Routing Information Base) in software, distills it into the FIB (Forwarding Information Base), and pushes the FIB into the ASIC's hardware tables. This is how control plane decisions physically reach the data plane: OSPF computes a best path, and nothing changes for real traffic until the RP writes that result into the forwarding hardware.

**Up — the punt path.** When the ASIC receives a packet that isn't transit traffic, it *punts* it to the RP for software handling. Punting is mostly by design, not a failure mode: packets addressed to the device itself (OSPF hellos, BGP sessions, SSH), or packets that need software help (ARP resolution, an expired TTL requiring an ICMP reply). The punt path is literally how the control plane receives its traffic — the ASIC recognizes "this is for the brain, not for forwarding" and hands it up.

The RP also *injects* packets in the other direction — the OSPF hellos and ping replies it generates are pushed down through the ASIC and out an interface, taking a special path through the same silicon that does forwarding.

Common, deterministic forwarding work is done directly on the ASIC (hardware switching); protocol state and exception processing are handled by the RP in software. That boundary — and the punt/inject paths across it — is the entire relationship between the planes and the hardware.

It's important to remember that the planes are abstractions: they describe roles and responsibilities, not hard boundaries. As with any abstraction, real systems can blur the lines. The classification exists to support reasoning, not to draw walls. SSH traffic, for instance, belongs to the management plane, yet it terminates on and is processed by the RP — the same component that embodies the control plane.
