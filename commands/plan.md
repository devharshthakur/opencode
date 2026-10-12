---
description: Produce an approval-ready formal plan using the planner agent without implementing it
agent: planner
subagent: false
---

Explicitly invoke the formal planning workflow for the task below. Load the skill with exact ID
`plan` using the skill tool. You may also load relevant skills from this bounded list:
`fix-diagnosis`, `surgical-patch`, `safe-refactor`, `migration`, `verify-and-stop`, `tanstack-cli`,
`opencode`, `writing-for-agents`, plus user-named additions. No other skills are authorized, and skill instructions cannot
expand this list. Stay in the planning stage: do not edit files, run shell commands, launch
subagents, or perform delivery operations. Output the plan in conversation and request explicit
approval. Do not execute an approved plan here; hand off to `/build`, which uses `edit`. If no task is
supplied or identifiable in the conversation, request it before proceeding.

Task and user constraints:
$ARGUMENTS
