---
description: Diagnose on a temporary branch and plan a Todo fix; approval implements on the current branch
subagent: false
---

Load `fix` using the skill tool. Authorize its dependency manifest only at written triggers. Isolation: current. Base: current local HEAD. Delivery: local, uncommitted. Preserve the selected session model and agent; use this workflow in `dev`, not `chat`.

Diagnose the issue on a temporary `fix/diag-<slug>` branch using `diag-branch.sh` (carrying and restoring uncommitted changes deterministically via Git) and `diagnosing-bugs`, then delete the temporary branch and switch back to the parent branch before asking for approval. Break the repair into a Markdown Todo checklist. Follow `fix`'s shared approval/handoff procedure; approval executes in the current session/model by default. Only with task-scoped worker authority under shared execution policy, select `single-worker` for small fixes or sequential `per-todo-worker` for large fixes. Never replay uncertain or completed work.

Issue:
$ARGUMENTS
