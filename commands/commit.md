---
description: Review messages and file counts before creating small coherent local commits
subagent: false
---

Follow the attached `commit` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Execute directly using the current model. Confirmation policy: required. Scope: arguments narrow; with no arguments, default to all current changes (every tracked change, staged or unstaged, plus every untracked file). Present the commit messages and per-commit file counts in order, then obtain approval before staging or committing. Changed scope, grouping, or messages need renewed approval even if counts match. Stop for secrets, unclear ownership, or staged changes outside a narrower scope. No source edits, isolation, amend, push, or PR.

Scope and constraints:
$ARGUMENTS
<!-- opencode:skill commit -->
