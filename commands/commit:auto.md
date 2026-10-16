---
description: Explicitly authorize scoped local commits without routine confirmation
subagent: false
---

Load `commit` using the skill tool. Authorize its dependency manifest only at written triggers. Execute directly using the current model. Confirmation policy: not-required. Invocation authorizes scoped local staging and commits. Identify scope from arguments or attributable current-task changes, not every workspace change; ask if attribution is unclear. Present exact files/messages, then proceed. Stop for secrets or unrelated staged changes; obey permissions and hooks. No source edits, isolation, amend, push, or PR.

Scope and constraints:
$ARGUMENTS
