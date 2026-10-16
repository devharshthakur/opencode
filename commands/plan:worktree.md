---
description: Plan with the current model; approval implements in a separate local worktree
subagent: false
---

Load `plan` using the skill tool. Authorize its dependency manifest only at written triggers. Isolation: worktree. Base: current local HEAD unless explicitly overridden; no fetch. Delivery: local, uncommitted. Preserve the selected session model and agent; use `dev`.

Plan through read-only discovery, optionally using `explore`. No shell, edits, or implementation dispatch before approval. Resolve dependencies on dirty original work; never copy dirty files or credentials automatically. Ask: "Approve and implement this plan in a separate worktree, without commits or publishing?" Direct approval dispatches one `implement` worker through the shared handoff procedure. Preserve the original checkout and prevent duplicate dispatch.

Task:
$ARGUMENTS
