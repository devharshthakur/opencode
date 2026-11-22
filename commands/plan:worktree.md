---
description: Plan with the current model; approval implements in a separate local worktree
subagent: false
---

Follow `plan`; load it if not attached. Isolation: worktree; preserve the original checkout. Base: local `HEAD` unless explicitly overridden. Delivery: local, uncommitted.

Git snapshot at invocation (read-only; re-check before relying on it):
!`git status --short --branch 2>&1 | head -30`
!`git log --oneline -3 2>&1`

Task:
$ARGUMENTS
<!-- opencode:skill plan -->
