---
description: Plan with the current model; approval implements on the current branch
subagent: false
---

Load `plan` using the skill tool. Authorize its dependency manifest only at written triggers. Isolation: current. Base: current local HEAD. Delivery: local, uncommitted. Preserve the selected session model and agent; use this workflow in `dev`, not `chat`.

Plan through read-only discovery, optionally using `explore`. No shell, edits, or implementation dispatch before approval. Ask: "Approve and implement this plan locally, without isolation, commits, or publishing?" Direct approval dispatches one `implement` worker through the shared handoff procedure. Never replay uncertain or completed work. `/build` is the explicitly selected direct alternative.

Task:
$ARGUMENTS
