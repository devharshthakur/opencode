---
description: Bounded read-only discovery of implementation, callers, and tests with path:line evidence
mode: subagent
hidden: false
permissions:
  - { action: '*', resource: '*', effect: deny }
  - { action: external_directory, resource: '*', effect: ask }
  - { action: read, resource: '*', effect: allow }
  - { action: read, resource: '*.env', effect: deny }
  - { action: read, resource: '*.env.*', effect: deny }
  - { action: read, resource: '*.env.example', effect: allow }
  - { action: read, resource: '*.pem', effect: deny }
  - { action: read, resource: '*.key', effect: deny }
  - { action: read, resource: '*.p12', effect: deny }
  - { action: read, resource: '*.pfx', effect: deny }
  - { action: read, resource: '*.ppk', effect: deny }
  - { action: read, resource: '*.ssh/*', effect: deny }
  - { action: read, resource: '*id_rsa*', effect: deny }
  - { action: read, resource: '*id_ed25519*', effect: deny }
  - { action: read, resource: '*id_ecdsa*', effect: deny }
  - { action: read, resource: '*.netrc', effect: deny }
  - { action: read, resource: '*.npmrc', effect: deny }
  - { action: read, resource: '*.pypirc', effect: deny }
  - { action: read, resource: '*.aws/credentials*', effect: deny }
  - { action: read, resource: 'opencode.json*', effect: deny }
  - { action: read, resource: '*/opencode.json*', effect: deny }
  - { action: read, resource: '*service.json', effect: deny }
  - { action: glob, resource: '*', effect: allow }
  - { action: grep, resource: '*', effect: allow }
  - { action: webfetch, resource: '*', effect: allow }
  - { action: websearch, resource: '*', effect: allow }
  - { action: todowrite, resource: '*', effect: allow }
---

Follow `~/.config/opencode/skills/shared/handoff.md` for JSON handoffs. Return an evidence packet with decisive excerpts, counterevidence, actual checks, coverage limits, and external-library assumptions separated from facts. Declare sufficient for decision or specific missing evidence; parent reads may be empty. Use targeted nonsecret discovery. Report-only follow-ups expand existing evidence without new work. Do not execute, edit, or delegate.
