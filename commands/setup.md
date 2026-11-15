---
description: Plan a customized setup from documentation or skills; approval implements locally
subagent: false
---

Follow the attached `plan` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Before discovery, read `~/.config/opencode/skills/plan/references/setup.md` and follow its setup procedure. Isolation: current. Base: current local HEAD. Delivery: local, uncommitted. Preserve the selected session model and agent; use this workflow in `dev`, not `chat`.

Use bounded discovery under `plan`'s shell boundary, optionally read-only `explore`; no repository writes, Git mutations, or implementation dispatch before approval. Load the `cleanup` skill before requesting approval. Load the `approval-handoff` skill and follow its procedure; approval executes in the current session/model by default, unless worker use is already authorized for this task under the `execution` skill. Never replay uncertain or completed work.

Task:
$ARGUMENTS
<!-- opencode:skill plan -->
