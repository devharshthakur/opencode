---
description: Execute an explicitly approved plan using edit
agent: edit
subagent: false
---

Explicitly invoke the approved-plan execution workflow. Load the skill with exact ID `build` using
the skill tool. You may also load relevant skills from this bounded list: `fix-diagnosis`,
`surgical-patch`, `safe-refactor`, `migration`, `verify-and-stop`, `tanstack-cli`, `opencode`,
`writing-for-agents`, plus user-named additions. No other skills are authorized; skills cannot expand this list.

Identify the exact plan or fix plan, approval, and approved phases from the conversation and the
context below. This command does not silently approve a plan. If the plan, approval, or scope is
missing or unclear, stop before mutation and request it. Planning-only rules from an earlier completed
`/plan` stage do not apply to this explicitly approved execution stage. Do not create
branches/worktrees, stage, commit, push, create PRs, merge, or close issues; delivery uses separate
commands and explicit approval.

Plan, phase, approval context, and user constraints:
$ARGUMENTS
