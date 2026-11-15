---
description: Diagnose on a temporary branch and plan a Todo fix; approval implements on a local feature branch
subagent: false
---

Follow the attached `fix` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Isolation: branch. Base: current local HEAD unless explicitly overridden; no fetch. Delivery: local, uncommitted. Preserve the selected session model and agent; use `dev`.

Diagnose the issue on a temporary `fix/diag-<slug>` branch using `diag-branch.sh` (carrying and restoring uncommitted changes deterministically via Git) and `diagnosing-bugs`, then delete the temporary branch and switch back to the parent branch before asking for approval. Resolve dependencies on dirty work before approval. Break the repair into a Markdown Todo checklist. Load the `approval-handoff` skill and follow its procedure; approval executes in the current session/model by default. Only with task-scoped worker authority under the `execution` skill, select `single-worker` for small fixes or sequential `per-todo-worker` for large fixes. Create no worktrees, including verification worktrees. Never replay uncertain or completed work.

Issue:
$ARGUMENTS
<!-- opencode:skill fix -->
