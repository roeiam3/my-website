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

{% capture cmd_banner %}ansible OSPFrouters -i inventory.ini -m cisco.ios.ios_banner -a "banner=motd text='test' state=present"{% endcapture %}
{% include cmd-card.html
   variant="ops"
   badge="ad-hoc"
   cmd=cmd_banner
   desc="One-shot banner push to the OSPFrouters group. No playbook." %}

Another quick operational example:

{% capture cmd_clock %}ansible routers -i inventory.ini -m cisco.ios.ios_command -a 'commands=["show clock"]'{% endcapture %}
{% include cmd-card.html
   variant="ops"
   badge="ad-hoc"
   cmd=cmd_clock
   desc="Run a show command on every host in routers." %}

## Syntax Pattern

{% include cmd-card.html
   variant="ops"
   badge="pattern"
   cmd="ansible <target> -i <inventory_file> -m <module> -a '<module_args>'"
   desc="Target, inventory, module, args. Same shape every time." %}
