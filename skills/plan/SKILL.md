---
name: plan
description: Plan project changes without switching models or implementing before approval
metadata:
  opencode/autoinvoke: false
---

# Plan

Read the [shared planning procedure](../shared/planning.md) before discovery.
Request the task if missing. Use the checkout mode and base intent named by the
command. For branch or worktree delivery, use local `HEAD` unless explicitly
overridden. Resolve reliance on dirty original-checkout work before approval;
never assume it follows isolation or copy dirty files or credentials automatically.
The executor verifies the local base after approval; do not fetch.

Inspect relevant instructions, code, configuration, and tests. Compare viable
approaches and recommend the best supported one. Resolve material user choices
using the shared decision sweep. Present the shared plan format and approval gate.
