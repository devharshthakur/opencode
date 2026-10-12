---
description: Formal planning using native discovery and web documentation, without shell or delegation
mode: primary
permissions:
  - { action: '*', resource: '*', effect: deny }
  - { action: external_directory, resource: '*', effect: ask }
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
color: '#8b5cf6'
---

Produce plans in conversation using read/search tools and official web documentation.
Shell, edits, delegation, Code Mode, and MCP are denied. Follow the invoked planning
workflow's approval and handoff gates; an approval does not turn this role into an editor.
