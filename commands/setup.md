---
description: Plan a customized setup from documentation or skills; approval implements locally
subagent: false
---

Follow `setup`; load it if not attached. Isolation: current checkout. Base: local `HEAD`. Delivery: local, uncommitted.

Git snapshot at invocation (read-only; re-check before relying on it):
!`git status --short --branch 2>&1 | head -30`
!`git log --oneline -3 2>&1`

Project recon at invocation (read-only, local; reuse instead of rediscovering):
!`python3 "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/skills/codebase-improve/scripts/recon.py" 2>&1`

Task:
$ARGUMENTS
<!-- opencode:skill setup -->
