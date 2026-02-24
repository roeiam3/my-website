---
layout: default
title: Learning Automation - Network Modules
permalink: /projects/learning-automation/network-modules/
project: learning-automation
---

# Network Modules

## What This Page Covers

After inventory and playbook basics, this is where automation becomes practical:

- running show commands
- applying config in a repeatable way
- reviewing output

## Example: Run Show Commands

```yaml
---
- name: Collect IOS show output
  hosts: routers
  gather_facts: false

  tasks:
    - name: Run show commands
      cisco.ios.ios_command:
        commands:
          - show version
          - show ip interface brief
      register: show_output

    - name: Display output
      ansible.builtin.debug:
        var: show_output.stdout_lines
```

## Example: Configure Banner Idempotently

```yaml
---
- name: Ensure MOTD banner exists
  hosts: routers
  gather_facts: false

  tasks:
    - name: Configure login banner
      cisco.ios.ios_banner:
        banner: motd
        text: Authorized access only
        state: present
```

## Example: Back Up Running Config

```yaml
---
- name: Backup IOS running config
  hosts: routers
  gather_facts: false

  tasks:
    - name: Save backup to controller
      cisco.ios.ios_config:
        backup: true
```
