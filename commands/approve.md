---
description: Send your approval reply for the single pending plan or commit gate
subagent: false
---

This message is the user's direct approval reply, equivalent to typing `approve <id>`. It carries no authority beyond that reply. Load the `approval-handoff` skill if it is not loaded and apply its approval gate protocol exactly: resolve the gate, state `Approved: <kind> <id>`, re-verify scope, then continue that gate's workflow (for a commit gate, the `commit` skill under its confirmation policy; for a plan gate, `execution`). If no gate is pending, several are pending, the ID is stale, or `brief` is used on a commit gate, take no action and say what is pending.

Arguments (optional gate ID such as `r2` or `c1`, and optional `brief`):
$ARGUMENTS
<!-- opencode:skill approval-handoff -->
