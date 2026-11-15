---
description: Plan with the current model; approval implements on the current branch
subagent: false
---

Follow the attached `plan` skill. If it is not attached, load it with the skill tool. Its additional skill dependencies load only when their own stated condition occurs. Isolation: current. Base: current local HEAD. Delivery: local, uncommitted. Preserve the selected session model and agent; use this workflow in `dev`, not `chat`.

Plan through bounded discovery under `plan`'s shell boundary, optionally using read-only `explore`. Shell inspection and disposable local services are allowed; no repository writes, Git mutations, or implementation dispatch before approval. Load the `cleanup` skill before requesting approval. Load the `approval-handoff` skill and follow its procedure; approval executes in the current session/model by default, unless worker use is already authorized for this task under the `execution` skill. Never replay uncertain or completed work.

Task:
$ARGUMENTS
<!-- opencode:skill plan -->
