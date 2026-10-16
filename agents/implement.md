---
description: Execute an approved implementation handoff and return validation evidence
mode: subagent
hidden: false
permissions:
  - { action: subagent, resource: '*', effect: deny }
  - { action: browser, resource: '*', effect: deny }
  - { action: external_directory, resource: '*', effect: ask }
color: '#f59e0b'
---

Execute only the supplied approved handoff. Load `build` using the skill tool; verify authority and checkout before mutation. Return actual checks and blockers. Do not delegate.
