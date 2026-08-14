---
layout: default
title: Learning Automation - Flags
permalink: /projects/learning-automation/flags/
project: learning-automation
---

# Flags

Flags are command arguments you add to control how Ansible runs.

## `--limit`

`--limit` allows you to filter targets, either by group or host.

If you run a command on `all` and apply `--limit` to a specific group, only that group is targeted.

If that group does not exist in the command context, it returns nothing.

Example:

{% capture cmd_limit_adhoc %}ansible all -i inventory.ini -m cisco.ios.ios_command -a 'commands=["show ip int brief"]' --limit OSPFrouters{% endcapture %}
{% include cmd-card.html
   variant="ops"
   badge="limit"
   cmd=cmd_limit_adhoc
   desc="Target all, then keep only OSPFrouters. Unknown group = no hosts, empty run." %}

You can apply the same idea to playbooks:

{% include cmd-card.html
   variant="ops"
   badge="limit"
   cmd="ansible-playbook -i inventory.ini site.yml --limit OSPFrouters"
   desc="Same filter on a playbook run." %}

<hr>
