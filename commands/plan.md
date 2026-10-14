---
description: Plan with ask, then implement on the current branch after explicit approval
agent: ask
subagent: false
---

Load `plan` using the skill tool. This command authorizes its declared dependency manifest only at
written triggers, plus user-requested additions. Isolation: current; delivery policy: local.
Request a missing task before proceeding.

During planning, do not edit files, run shell commands, launch subagents, or perform delivery.
Output the plan in conversation. Offer approval-triggered execution: ask "Approve and implement
this plan locally, without isolation, commits, or publishing?" On explicit approval, follow the
skill's shared handoff procedure and invoke hidden `implement` with workflow `build` and exact
approved phases. Approval authorizes edits and validation on the current branch only; create no
branches/worktrees. Parent stays in `ask`.
Revisions require renewed approval; prevent duplicate dispatch. `/build` remains a manual alternative.

Task and user constraints:
$ARGUMENTS
