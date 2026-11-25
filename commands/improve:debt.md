---
description: Audit architecture and technical debt
subagent: false
---

Follow the attached `codebase-improve` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Depth: standard. Focus: debt. Preserve the selected session model and agent; use this workflow in `dev`, not `chat`.

Audit through evidence-first read-only discovery under `plan`'s shell boundary. No repository writes, Git mutations, implementation dispatch, or publishing before explicit approval. Present findings and wait for selection. Selection is not implementation approval. Selected work follows the `plan`, `cleanup`, and `approval-handoff` skills; default delivery is local, current checkout, uncommitted. This `/improve*` task retains default worker authority through nested workflows under the `execution` skill; explicit direct execution remains available.

Project recon at invocation (read-only, local; reuse instead of rediscovering):
!`python3 "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/skills/codebase-improve/scripts/recon.py" 2>&1`

Optional depth, focus, paths, or short scope (empty is valid):
$ARGUMENTS
<!-- opencode:skill codebase-improve -->
