---
layout: default
title: Learning Automation - Ad-hoc Commands
permalink: /projects/learning-automation/adhoc-and-idempotency/
project: learning-automation
---

# Ad-hoc Commands

Ad-hoc is the concept of one-time Ansible commands.  
You run a command on the inventory and a group, or even on specific hosts, to perform a one-time action.

## Why Use Ad-hoc

These commands are useful for:

- quick checks
- one-time actions
- tasks that do not need a full playbook flow yet

## Example (From CLI)

```bash
ansible OSPFrouters -i inventory.ini -m cisco.ios.ios_banner -a "banner=motd text='test' state=present"
```

<br>

Another quick operational example:

```bash
ansible routers -i inventory.ini -m cisco.ios.ios_command -a 'commands=["show clock"]'
```

<br>

## Syntax Pattern

```bash
ansible <target> -i <inventory_file> -m <module> -a '<module_args>'
```

<br>
