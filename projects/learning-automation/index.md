---
layout: default
title: Learning Automation - Ansible
permalink: /projects/learning-automation/
project: learning-automation
---

# Ansible

<p class="meta">Started: 2026-02-17</p>

## What Is Automation?

Automation is about turning repetitive tasks into repeatable workflows so they run consistently with less manual error.

For networking, that means reducing one-by-one switch/router changes and using a standard process that can be reused.

## Why Ansible

Ansible is a practical choice because it is:

- Agentless for many workflows (typically SSH-based).
- Human-readable (playbooks and inventory are approachable).
- Broadly supported across network and server platforms.

## Core Components

Ansible operation is built around three parts:

1. <span class="component-label">Control Node</span>: The management system where Ansible runs.
2. <span class="component-label">Inventory</span>: The list of managed devices and their variables.
3. <span class="component-label">Managed Node</span>: The devices Ansible connects to and configures.

## Practical Outcome

Instead of manually configuring repeated access-port patterns across multiple switches, you define the desired state once and apply it consistently.

Example: if you need to prepare edge ports for printers and PCs across many switches, you can use one Ansible workflow to apply the same baseline everywhere, including access VLAN assignment, `spanning-tree portfast`, and port-security settings.  
Without automation, each switch is a manual login and manual config. With automation, you provide a small set of inputs once and execute the same validated standard across all target devices.

This is where automation gives the most value: speed, consistency, and fewer human-made configuration errors.
