---
description: Produce an approval-ready formal plan using ask without implementing it
agent: ask
subagent: false
---

Explicitly invoke the formal planning workflow for the task below. Load the skill with exact ID
`plan` using the skill tool. Stay in the planning stage: do not edit files, run shell commands,
launch subagents, or perform delivery operations. Output the plan in conversation and request
explicit approval. Do not execute an approved plan here; hand off to `/build`, which uses `edit`.
If no task is supplied or identifiable in the conversation, request it before proceeding.

Task and user constraints:
$ARGUMENTS
