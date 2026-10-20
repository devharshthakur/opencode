---
description: Diagnose on a temporary branch and plan a Todo fix; approval implements on a local feature branch
subagent: false
---

Load `fix` using the skill tool. Authorize its dependency manifest only at written triggers. Isolation: branch. Base: current local HEAD unless explicitly overridden; no fetch. Delivery: local, uncommitted. Preserve the selected session model and agent; use `dev`.

Diagnose the issue on a temporary `fix/diag-<slug>` branch using `diag-branch.sh` (carrying and restoring uncommitted changes deterministically via Git) and `diagnosing-bugs`, then delete the temporary branch and switch back to the parent branch before asking for approval. Resolve dependencies on dirty work before approval. Break the repair into a Markdown Todo checklist (`single-worker` for small fixes; sequential `per-todo-worker` for large fixes). Follow `fix`'s shared approval/handoff procedure; approval dispatches `implement` in the selected mode. Create no worktrees, including verification worktrees. Never replay uncertain or completed work.

Issue:
$ARGUMENTS
