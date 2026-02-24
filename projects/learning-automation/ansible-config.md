---
layout: default
title: Learning Automation - Ansible Config
permalink: /projects/learning-automation/ansible-config/
project: learning-automation
---

# Ansible Config

## Purpose of `ansible.cfg`

`ansible.cfg` sets project defaults so you do not repeat flags on every command.

Put it in the repo root for project-local behavior.

In practice, this is usually more useful for Linux/server workflows, where shared `sudo` behavior is common.

## Example `ansible.cfg`

```ini
[defaults]
inventory = ./inventory.ini
remote_user = admin
host_key_checking = False
retry_files_enabled = False
stdout_callback = yaml

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
```

## Network Device Note

For network automation, privilege escalation is usually handled in inventory/playbooks with `enable`, for example:

```ini
ansible_become=yes
ansible_become_method=enable
```

Use `sudo` defaults only when they fit the target platform.
