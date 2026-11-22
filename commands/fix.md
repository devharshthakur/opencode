---
description: Investigate safely in disposable storage and propose an evidence-backed repair
subagent: false
---

Follow the attached `fix` skill. If it is not attached, load it with the skill tool. Load additional dependencies only at their stated triggers. Preserve the selected session model and agent; use `dev`, not `chat`.

Use read-only discovery first; perform investigative mutations only in a task-owned disposable environment, never the original checkout. Diagnose the current working source, including relevant uncommitted files. Retain diagnostic evidence and the environment through repair-plan review. No repair before approval.

Repair execution defaults: current checkout, current local HEAD, local uncommitted delivery. Resolve explicitly requested branch/worktree execution in the approval plan. Follow `approval-handoff`; execute in the current session/model unless task-scoped worker use is authorized under `execution`. Never replay uncertain or completed work.

Git snapshot at invocation (read-only; re-check before relying on it):
!`git status --short --branch 2>&1 | head -30`
!`git log --oneline -3 2>&1`

Issue:
$ARGUMENTS
<!-- opencode:skill fix -->
