---
description: Authorize worker execution for this task directly
subagent: false
---

Follow the attached `worker` skill; load it if not attached. Stay in the current session and model. This explicit invocation directly authorizes task-scoped worker execution under `execution`; ask for no separate approval, and keep the originating workflow's plan, isolation, and delivery gates.

Task (use the current task if omitted):
$ARGUMENTS
<!-- opencode:skill worker -->
