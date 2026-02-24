---
layout: default
title: Learning Automation - Deeper Dive into Inventories
permalink: /projects/learning-automation/inventory-deep-dive/
project: learning-automation
---

# Deeper Dive into Inventories

After Getting Started, the first major topic is inventory design.

Within your inventory, you configure your devices. This may look intimidating at first, but it is fairly easy to understand once you break it down.

## `ini` vs YAML

You can create an inventory file via either `ini` or YAML.

`ini` is easier to read and understand at first, while YAML is usually the better choice for larger networks with more diverse devices and roles.

## `inventory.ini` Example

```ini
[routers]
200.0.0.3
200.0.0.2

[switches]
100.0.0.1
100.0.0.2

[routers:vars]
ansible_user=admin
ansible_password=<your_password>
ansible_connection=network_cli
ansible_network_os=cisco.ios.ios
ansible_become=yes
ansible_become_method=enable
ansible_become_password=<your_enable_password>
```

## What Each Part Means

- `[]` defines a group. In this example, `routers` has two IP addresses.
- `[routers:vars]` means this group has variables tied to it.
- `ansible_user` and `ansible_password` are used for login over SSH.
- `ansible_connection=network_cli` indicates this is a network device workflow.
- `ansible_network_os` specifies the OS being automated.
- `ansible_become`, `ansible_become_method`, and `ansible_become_password` are for entering privileged mode (`enable`) when required.

## Group Naming: The 3 W's

As Ansible recommends, group names are clearer when they communicate:

- What: device role (`leaf`, `spine`, `router`)
- Where: location (`ISL`, `USA`, `DC1`)
- When: environment (`dev`, `prod`)

Example group: `usa_leafs_dev`.

## YAML Metagroups Example

```yaml
all:
  children:
    israel_dc:
      children:
        spines:
          hosts:
            spine01:
              ansible_host: 10.1.1.1
            spine02:
              ansible_host: 10.1.1.2
        leafs:
          hosts:
            leaf01:
              ansible_host: 10.1.2.1
            leaf02:
              ansible_host: 10.1.2.2
        ai_servers:
          hosts:
            ai-gpu01:
              ansible_host: 10.1.10.1
            ai-gpu02:
              ansible_host: 10.1.10.2
          vars:
            ansible_user: admin
            ansible_password: <your_password>
            ansible_port: 22
```

## Add Variables to a Specific Group

When using metagroups in YAML, you can separate device roles and locations more clearly, then attach variables at the right level.

```yaml
ai_servers:
  hosts:
    ai-gpu01:
      ansible_host: 10.1.10.1
    ai-gpu02:
      ansible_host: 10.1.10.2
  vars:
    ansible_user: admin
    ansible_password: <your_password>
    ansible_port: 22
```

## Verify Inventory

The last part of inventory work is verification, meaning you confirm it is functional, reachable, and variables are correct.

```bash
ansible-inventory -i inventory.ini --list
ansible ai_servers -m ping -i inventory.ini
```

Where `ai_servers` can be replaced by another group, host, or `all`.

Example success output:

```bash
200.0.0.3 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

## `group_vars` and `host_vars`

As your inventory grows, move variables into `group_vars` and `host_vars` so inventory files stay readable and reusable.
