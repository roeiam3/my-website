---
layout: default
title: Learning Automation - Good Automation Practices
permalink: /projects/learning-automation/good-automation-practices/
project: learning-automation
---

# Good Automation Practices

This page focuses on the practices that make automation safer and more reliable.

## Idempotency

Idempotency means repeated runs keep the same desired end-state.

`state: present` means "this config should exist in the final state."

`state: absent` means "this config should not exist in the final state."

Single idempotent code example (`state: present`):

```yaml
- name: Ensure MOTD banner is present
  cisco.ios.ios_banner:
    banner: motd
    text: Authorized access only
    state: present
```

<br>

This single task achieves idempotency with the 3 outcomes:

- If it exists and is correct, leave it unchanged.
- If it does not exist, add it.
- If it exists but is different, alter it to the desired state.

When you want the opposite behavior (remove instead of enforce), use `state: absent`.

<hr>
