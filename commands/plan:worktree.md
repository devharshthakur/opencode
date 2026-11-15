---
description: Plan with the current model; approval implements in a separate local worktree
subagent: false
---

Follow the attached `plan` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Isolation: worktree. Base: current local HEAD unless explicitly overridden; no fetch. Delivery: local, uncommitted. Preserve the selected session model and agent; use `dev`.

Plan through bounded discovery under `plan`'s shell boundary, optionally using read-only `explore`. Shell inspection and disposable local services are allowed; no repository writes, Git mutations, or implementation dispatch before approval. Load the `cleanup` skill before requesting approval. Resolve dependencies on dirty original work; never copy dirty files or credentials automatically. Load the `approval-handoff` skill and follow its procedure; approval executes in the current session/model by default, unless worker use is already authorized for this task under the `execution` skill. Preserve the original checkout and prevent duplicate dispatch.

Task:
$ARGUMENTS
<!-- opencode:skill plan -->
