---
description: Execute an explicitly approved plan using edit
agent: edit
subagent: false
---

Load `build` using the skill tool. This command authorizes its declared dependency manifest only
at written triggers, plus user-requested additions. Execute locally in `edit`, not another worker.

Identify the exact plan, explicit approval, and approved phases from conversation/context. Invocation
alone is not approval. If any are missing or unclear, request them before mutation. After approval,
the earlier planning-only restrictions end for this execution stage.
Do not create branches/worktrees, stage, commit, push, create PRs, merge, or close issues.
Preserve existing work, validate acceptance, and stop at verified results or an exact blocker.

Plan, phase, approval context, and user constraints:
$ARGUMENTS
