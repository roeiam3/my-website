---
layout: default
title: Learning Automation - Collections and Dependencies
permalink: /projects/learning-automation/collections-and-dependencies/
project: learning-automation
---

# Collections and Dependencies

## Ansible Collections

An Ansible collection is a bundle of Ansible content (modules, roles, plugins, and sometimes playbooks/docs) grouped under a single name so it can be installed and used together.

Vendors and communities publish collections under a namespace.  
For example, `cisco` is the namespace, and `cisco.ios`, `cisco.aci`, `cisco.nxos` are separate collections inside that namespace.

You cannot install a namespace by itself; you must install specific collections.

For example:

```bash
ansible-galaxy collection install cisco.ios
```

<br>

Or with `requirements.yml`:

```yaml
---
collections:
  - name: cisco.ios
  - name: cisco.aci
  - name: cisco.nxos
```

```bash
ansible-galaxy collection install -r requirements.yml
```

<br>

Using `requirements.yml` is the recommended way in real projects because it documents exactly which collections your automation depends on and makes it easier to reproduce the environment.

## Quick Reference

- `cisco` = namespace
- `cisco.ios` = collection
- `cisco.ios.ios_command` = fully qualified module name
