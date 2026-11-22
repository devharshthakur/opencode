---
description: Authorize worker execution for this task directly
subagent: false
---

Follow the attached `worker` skill for this explicit user invocation. If it is not attached, load it with the skill tool. Its additional skill dependencies load only when their own stated condition occurs. Stay in the current session with its selected model. Explicit `/use:worker` invocation directly authorizes task-scoped worker execution—do not ask for a separate worker-use approval. That authorization covers additional workers needed within this task, not new scope or operations. Preserve the originating workflow's implementation-plan, isolation, and delivery gates.

Task (use the current task if omitted):
$ARGUMENTS
<!-- opencode:skill worker -->
