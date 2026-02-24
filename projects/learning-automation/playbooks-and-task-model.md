---
layout: default
title: Learning Automation - Playbooks and Task Model
permalink: /projects/learning-automation/playbooks-and-task-model/
project: learning-automation
---

# Playbooks and Task Model

An Ansible module is a self-contained unit of work that Ansible runs on a managed device or host to perform a specific task, such as sending commands, configuring interfaces, or managing files.

For example, `cisco.ios.ios_command` is a module that knows how to send CLI commands to Cisco IOS devices and return the results in a structured way that Ansible can process.

A playbook is a list of tasks that describe what you want to happen on your managed devices.

Each task calls an Ansible module, which is the actual piece of code that does the work on the target system.

You can think of the playbook as the plan, the tasks as the steps in that plan, and the modules as the tools used to carry out each step.

## Example Task

```yaml
- name: Save config via 'copy running-config startup-config'
  cisco.ios.ios_command:
    commands:
      - copy running-config startup-config
  register: save_result
```

<br>

<u>`name`</u>, <u>`cisco.ios.ios_command`</u>, <u>`commands`</u>, and <u>`register`</u> are the key concepts in this example.

  - This task lives inside a playbook (which may contain many tasks).
  - <u>`name`</u> is a human-readable description of what the task does.
  - <u>`cisco.ios.ios_command`</u> is the module being used.
  - The module takes arguments; in this case, <u>`commands`</u> specifies the CLI command sent to the network device.
  - <u>`register: save_result`</u> stores the module output in a variable for later use in the playbook.

There are many types of modules, ranging from builtin modules to ones developed by vendors or open-source communities for their specific needs.

In the Ansible documentation and Ansible Galaxy, you can find many examples.

## Useful Modules

- `ansible.builtin.debug`: useful for debugging and printing messages while the playbook runs.
- `ansible.builtin.file`: creates files and directories on remote devices.
- `ansible.builtin.shell`: sends shell commands to Linux devices.
- `ansible.builtin.template`: uses pre-configured Jinja templates to apply files with shared values (for example, a Netplan file with shared variables such as gateway and DNS).

## Task Keywords

Some words are task keywords, such as `register`, which means they are distinct from modules.

In this context, `register` stores values from output. For example, when saving config, output may include a result similar to `Building configuration... [OK]`.
