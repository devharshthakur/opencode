---
description: Execute directly without a planning gate, using the current model
subagent: false
---

Execute the requested task directly in `dev` using the current session model and checkout. Invocation authorizes implementation and validation, not isolation, staging, commits, or publishing. Do not delegate implementation or impose a detailed plan/approval gate, regardless of complexity. Clarify genuine missing requirements and honor blockers, permissions, destructive-operation confirmations, and material unrequested expansion. Use task-specific methods only when their triggers apply. Validate, review the diff, and report actual results.

Before resource creation, load the `cleanup` skill; verify cleanup before completion or blocker reporting. Then load the `reporting` skill and follow its optional PR offer protocol; publishing still requires separate explicit authorization.

Task:
$ARGUMENTS
