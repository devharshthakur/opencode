---
description: Plan with ask, then implement in a separate worktree after explicit approval
agent: ask
subagent: false
---

Load `plan` using the skill tool. This command authorizes its declared dependency manifest only at
written triggers, plus user-requested additions. Isolation: worktree; delivery policy: local.
Request a missing task before proceeding.

During planning, do not edit files, run shell commands, launch subagents, or perform delivery.
Output the plan in conversation. Use the shared handoff's worktree approval question, naming exact
phases and local base (current `HEAD` unless explicitly overridden). On explicit approval, invoke
hidden `implement` with workflow `build` and exact approved phases. Approval authorizes branch/worktree
isolation, edits, and validation only; no staging, commits, or publishing. Use `plan/` in a separate
worktree; preserve the original checkout and never copy dirty files automatically. Retain task
worktree and results. Parent stays in `ask`. Revisions require renewed approval; prevent duplicate dispatch.

Task, explicit local base, and user constraints:
$ARGUMENTS
