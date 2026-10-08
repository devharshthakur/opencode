---
description: Execute an explicitly approved plan using edit with separate delivery approval
agent: edit
subagent: false
---

Explicitly invoke the approved-plan execution workflow. Load the skill with exact ID `build`
using the skill tool. Identify the exact plan or fix plan, approval, and approved phases from the
conversation and the context below. This command does not silently approve a plan. If the plan,
approval, or scope is missing or unclear, stop before mutation and request it. Planning-only rules
from an earlier completed `/plan` stage do not apply to this explicitly approved execution stage.
Do not automatically create branches/worktrees, stage, commit, push, create PRs, merge, or close
issues; delivery operations require separate explicit approval under the skill.

Plan, phase, approval context, and user constraints:
$ARGUMENTS
