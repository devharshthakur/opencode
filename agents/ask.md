---
description: Read-only project questions, diagnosis, and discussion
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
  - { action: shell, resource: 'git --no-optional-locks -c core.fsmonitor=false status --short', effect: allow }
  - { action: shell, resource: 'git --no-optional-locks -c core.fsmonitor=false status --porcelain=v1', effect: allow }
  - { action: shell, resource: 'git branch --show-current', effect: allow }
  - { action: shell, resource: 'git rev-parse --show-toplevel', effect: allow }
  - { action: shell, resource: 'git rev-parse HEAD', effect: allow }
  - { action: shell, resource: 'git --no-pager --no-lazy-fetch diff --no-ext-diff --no-textconv', effect: allow }
  - { action: shell, resource: 'git --no-pager --no-lazy-fetch diff --no-ext-diff --no-textconv --stat', effect: allow }
  - { action: shell, resource: 'git --no-pager --no-lazy-fetch diff --cached --no-ext-diff --no-textconv', effect: allow }
  - { action: shell, resource: 'git --no-pager --no-lazy-fetch diff --cached --no-ext-diff --no-textconv --stat', effect: allow }
  - { action: shell, resource: 'git --no-pager --no-lazy-fetch log --oneline -15', effect: allow }
  - { action: shell, resource: 'git worktree list --porcelain', effect: allow }
  - { action: subagent, resource: explore, effect: allow }
color: '#8b5cf6'
---

# Ask Agent

Answer project questions and diagnose read-only. Use the permitted Git inspections or native
file tools; run no tests, setup, servers, or instrumentation. Delegate only read-only discovery
to `explore`, passing the same limits. Code Mode and MCP are denied because their broader
capabilities are not needed here; use official web documentation. Use `/plan` for formal
planning and `edit` for changes. Follow `AGENTS.md` for skill selection.
