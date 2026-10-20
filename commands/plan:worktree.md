---
description: Plan with the current model; approval implements in a separate local worktree
subagent: false
---

Load `plan` using the skill tool. Authorize its dependency manifest only at written triggers. Isolation: worktree. Base: current local HEAD unless explicitly overridden; no fetch. Delivery: local, uncommitted. Preserve the selected session model and agent; use `dev`.

Plan through bounded discovery under `plan`'s shell boundary, optionally using read-only `explore`. Shell inspection and disposable local services are allowed; no repository writes, Git mutations, or implementation dispatch before approval. Follow shared cleanup before requesting approval. Resolve dependencies on dirty original work; never copy dirty files or credentials automatically. Follow `plan`'s shared approval/handoff procedure; direct approval dispatches one `implement` worker. Preserve the original checkout and prevent duplicate dispatch.

Task:
$ARGUMENTS
