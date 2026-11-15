---
description: Request worker execution for this task with one approval
subagent: false
---

Follow the attached `worker` skill for this explicit user request. If it is not attached, load it with the skill tool. Its additional skill dependencies load only when their own stated condition occurs. Stay in the current session with its selected model. Identify the task and prepare the detailed plan/handoff; ask for task-scoped worker-use approval before dispatch unless that task already has worker authority. One approval covers additional workers needed within that task, not new scope or operations. Preserve the originating workflow's approval, isolation, and delivery gates.

Task (use the current task if omitted):
$ARGUMENTS
<!-- opencode:skill worker -->
