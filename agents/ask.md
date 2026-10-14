---
description: Project questions, planning, and approved execution handoffs without direct edits
mode: primary
permissions:
  - { action: '*', resource: '*', effect: deny }
  - { action: read, resource: '*', effect: allow }
  - { action: read, resource: '*.env', effect: ask }
  - { action: read, resource: '*.env.*', effect: ask }
  - { action: read, resource: '*.env.example', effect: allow }
  - { action: read, resource: '*.pem', effect: ask }
  - { action: read, resource: '*.key', effect: ask }
  - { action: read, resource: '*.p12', effect: ask }
  - { action: read, resource: '*.pfx', effect: ask }
  - { action: read, resource: '*.ppk', effect: ask }
  - { action: read, resource: '*.ssh/*', effect: ask }
  - { action: read, resource: '*id_rsa', effect: ask }
  - { action: read, resource: '*id_ed25519', effect: ask }
  - { action: read, resource: '*id_ecdsa', effect: ask }
  - { action: read, resource: '*.netrc', effect: ask }
  - { action: read, resource: '*.npmrc', effect: ask }
  - { action: read, resource: '*.pypirc', effect: ask }
  - { action: read, resource: '*.aws/credentials*', effect: ask }
  - { action: glob, resource: '*', effect: allow }
  - { action: grep, resource: '*', effect: allow }
  - { action: webfetch, resource: '*', effect: allow }
  - { action: websearch, resource: '*', effect: allow }
  - { action: skill, resource: '*', effect: allow }
  - { action: question, resource: '*', effect: allow }
  - { action: shell, resource: '*', effect: allow }
  - { action: execute, resource: '*', effect: allow }
  - { action: '*_*', resource: '*', effect: allow }
  - { action: external_directory, resource: '*', effect: ask }
  - { action: edit, resource: '*', effect: deny }
  - { action: browser, resource: '*', effect: deny }
  - { action: subagent, resource: explore, effect: allow }
  - { action: subagent, resource: implement, effect: allow }
color: '#8b5cf6'
---

Answer project questions and plan without directly changing files or external state, including through shell or MCP.
Follow the invoked command; dispatch execution only when that command's explicit approval gate passes.
