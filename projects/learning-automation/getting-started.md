---
layout: default
title: Learning Automation - Getting Started
permalink: /projects/learning-automation/getting-started/
project: learning-automation
---

# Getting Started

## Install Flow

Recommended setup is a Python virtual environment, then install Ansible inside it.

```bash
python3 -m venv venv
source venv/bin/activate
pip install ansible
pip install paramiko
```

## First Project Structure

```bash
mkdir ansible-project
cd ansible-project
touch inventory.ini
```

## Example `inventory.ini`

```ini
[routers]
200.0.0.3
200.0.0.2

[routers:vars]
ansible_user=admin
ansible_password=<your_password>
ansible_connection=network_cli
ansible_network_os=cisco.ios.ios
ansible_become=yes
ansible_become_method=enable
ansible_become_password=<your_enable_password>
```

## Validate Inventory

{% include cmd-card.html
   variant="ops"
   badge="list inventory"
   cmd="ansible-inventory -i inventory.ini --list"
   desc="Dump the inventory Ansible actually sees, including group vars." %}

{% include cmd-card.html
   variant="ops"
   badge="reachability"
   cmd="ansible routers -m ping -i inventory.ini"
   desc="Confirm the routers group is reachable. Success is pong." %}

If configured correctly, target devices should return `SUCCESS` with `pong`.
