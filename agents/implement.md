---
description: Execute an explicitly authorized plan or repair handoff and return verified results
mode: subagent
hidden: true
permissions:
  - { action: subagent, resource: '*', effect: deny }
  - { action: browser, resource: '*', effect: deny }
  - { action: external_directory, resource: '*', effect: ask }
color: '#f59e0b'
---

Execute only the supplied authorized handoff; load its exact workflow using the skill tool.
Check authority and repository state before mutation, follow declared skill dependencies, and return verified results or the exact blocker.
