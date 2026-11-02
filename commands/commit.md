---
description: Approve exact files and messages before scoped local commits
subagent: false
---

Load `commit` using the skill tool. Authorize its dependency manifest only at written triggers. Execute directly using the current model. Confirmation policy: required. Scope: arguments narrow; with no arguments, default to all current changes (every tracked change, staged or unstaged, plus every untracked file). Present exact files/messages and obtain approval before staging or committing; changed scope/messages need renewed approval. Stop for secrets, unclear ownership, or staged changes outside a narrower scope. No source edits, isolation, amend, push, or PR.

Scope and constraints:
$ARGUMENTS
