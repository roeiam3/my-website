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

```bash
ansible all -i inventory.ini -m cisco.ios.ios_command -a 'commands=["show ip int brief"]' --limit OSPFrouters
```

<br>

You can apply the same idea to playbooks:

```bash
ansible-playbook -i inventory.ini site.yml --limit OSPFrouters
```

<hr>
