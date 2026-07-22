---
layout: default
title: Datapath Visualized - SerDes & PHY
permalink: /blog/datapath-visualized/serdes-and-phy/
project: datapath-visualized
---

# SerDes & PHY

I am not an electrical engineer — this explanation is how I understand and aim to visualize what a SerDes is.

Before getting into SerDes, a couple of prerequisites help make the rest click.

### Parallel streams

CPUs communicate very well with parallel data — receiving bits from several sources all at once. The issue shows up when you need to send that data far: parallel links hit physics-related roadblocks. Those cause timing issues, noise (crosstalk), and clock skew — all more complex than this writeup needs. The main takeaway: parallel works well over short on-chip distances, while longer high-speed links usually move to serial.

### Serial streams

As opposed to a parallel stream of bits, serial simplifies and reduces total hardware by sending 1s and 0s in a single "file," at very high speeds. It can do that because it uses two strands of wire in a way that reduces most of the issues parallel streams cause — though it does not negate them entirely (that's where FEC essentially slots in at higher speeds). The tradeoffs are still real, and still worth it.

## SerDes

Hence SerDes exists. It makes the path between components faster via serial, while still enabling parallel computing. That means many high-speed chip-to-chip and chip-to-module interfaces have a SerDes at each end.

Imagine two CPUs in a system that want to talk to each other. If they used the parallel style they excel at end-to-end, they'd hit the wiring issues above. Instead, a SerDes sits between them so that when data crosses the PCB, it's both faster and more reliable.

<div class="media-row media-row--top">
  <div class="media-row__text">
    <p>SerDes (Serializer/Deserializer) is an integrated circuit block — or several components on the PCB (an ASIC, for example) — that converts data arriving as parallel into serial, and back again.</p>
    <br>
    <ul>
      <li><strong>Serializer</strong> — converts slow, wide parallel data (for example, from a CPU) into a single high-speed serial bitstream</li>
      <li><strong>Deserializer</strong> — converts that high-speed serial bitstream back into slow, wide parallel data</li>
    </ul>
    <br>
    <p>In our datapath scenario: an ASIC die needs to send data toward another device via a transceiver. The chip side moves data in parallel. A serializer between them (usually close to the ASIC and the transceiver path) converts that into serial for a faster, more reliable stream. At the far end, a deserializer turns it back into parallel for the receiving side.</p>
    <br>
    <p>Serializer and deserializer are roles, not necessarily independent boxes — bidirectional interfaces usually combine both into one SerDes block.</p>
  </div>
  <img class="media-row__img" src="{{ '/assets/images/datapath-visualized/serdes.png' | relative_url }}" alt="Block diagram of two ASIC dies each with SerDes converting parallel buses to serial links through ports">
</div>

## PHY

PHY is abstract, but it ties the hardware side together: it connects physical attributes and hardware to how devices actually communicate on the wire.

PHY (Physical) is a set of components that take hardware 1s and 0s and make them legible for layers above. It also covers additional functions such as error correction (via the aforementioned FEC) and the layers where SerDes lives.

<div class="media-row media-row--top">
  <div class="media-row__text">
    <p>Looking top-down — generating a frame and sending it — <strong>PCS</strong> is the first sub-layer of PHY. PCS handles encoding and scrambling, adds FEC parity on transmit, and decodes and corrects FEC on receive (important topics, but not ones we'll dig into here).</p>
    <br>
    <p>The next sub-layer is <strong>PMA</strong>. This is where the SerDes lives, along with CDR and related functions. Specifically here, data converts from the parallel wide bus to the serial single bus.</p>
    <br>
    <p><strong>PMD</strong> is the last sub-layer — the medium-facing hardware defined by the implementation. For optical, that includes the optical transmitter/receiver; for DACs, the electrical medium interface; and so on. A retimed optical module can also contain its own SerDes, CDR, and DSP in addition to the host-side PMA.</p>
    <br>
    <p>These three layers together take a frame and enable actual on-wire communication.</p>
  </div>
  <div class="phy-flow" aria-label="Optical receive path through the PHY">
    <div class="phy-flow__body">
      <div class="phy-flow__rail" aria-hidden="true">
        <div class="phy-flow__rail-seg phy-flow__rail-seg--serial">
          <span>Serial</span>
          <small>the whole way here</small>
        </div>
        <div class="phy-flow__rail-gap"></div>
        <div class="phy-flow__rail-seg phy-flow__rail-seg--parallel">
          <span>Parallel</span>
          <small>on the die</small>
        </div>
      </div>
      <ol class="phy-flow__steps">
        <li class="phy-flow__step phy-flow__step--serial" tabindex="0">
          <strong>Fiber</strong>
          <span>Light pulses, one after another</span>
        </li>
        <li class="phy-flow__step phy-flow__step--serial" tabindex="0">
          <strong>Optical module — PMD</strong>
          <span>Photodiode + TIA: light becomes voltage</span>
        </li>
        <li class="phy-flow__step phy-flow__step--serial" tabindex="0">
          <strong>Connector + PCB trace</strong>
          <span>Same serial bits, degrading en route</span>
        </li>
        <li class="phy-flow__step phy-flow__step--convert" tabindex="0">
          <strong>SerDes RX at the die edge — PMA</strong>
          <span>Equalize, recover clock, deserialize</span>
        </li>
        <li class="phy-flow__step phy-flow__step--parallel" tabindex="0">
          <strong>PCS on the die</strong>
          <span>Align lanes, descramble, FEC decode</span>
        </li>
        <li class="phy-flow__step phy-flow__step--parallel" tabindex="0">
          <strong>MAC — layer 2</strong>
          <span>Receives the clean frame</span>
        </li>
      </ol>
    </div>
    <ul class="phy-flow__legend">
      <li class="phy-flow__legend-item phy-flow__legend-item--serial"><span></span> data is serial</li>
      <li class="phy-flow__legend-item phy-flow__legend-item--parallel"><span></span> data is parallel</li>
      <li class="phy-flow__legend-item phy-flow__legend-item--convert"><span></span> the conversion point</li>
    </ul>
  </div>
</div>
