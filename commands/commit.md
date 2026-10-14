---
description: Commit the current task's changes after approval of exact files and messages
agent: edit
subagent: false
---

Load `commit` using the skill tool. Authorize its declared dependency manifest only at written
triggers, plus user-requested additions. Default scope: the completed task's uncommitted changes
identified from conversation and diff; arguments narrow or constrain that scope.

Confirmation policy: required. Present files per commit and exact headers, bodies, and footers.
Use `question` to request explicit approval before staging or committing. If files/messages change,
request renewed approval. Invocation alone does not approve the commit plan.
Stop for unclear scope, secrets, or unrelated staged changes. Preserve existing work and obey permissions.
Do not edit source files, create branches/worktrees, amend, push, or create PRs.
Report verified hashes/messages, actual checks, and remaining changes. Leave commits local.

Current task changes and additional user constraints:
$ARGUMENTS
