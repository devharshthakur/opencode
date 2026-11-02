---
description: Request worker execution for this task with one approval
subagent: false
---

Load `worker` using the skill tool for this explicit user request. Authorize its dependency manifest only at written triggers. Stay in the current session with its selected model. Identify the task and prepare the detailed plan/handoff; ask for task-scoped worker-use approval before dispatch unless that task already has worker authority. One approval covers additional workers needed within that task, not new scope or operations. Preserve the originating workflow's approval, isolation, and delivery gates.

Task (use the current task if omitted):
$ARGUMENTS
