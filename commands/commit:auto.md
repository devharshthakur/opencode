---
description: Explicitly authorize small coherent local commits without routine confirmation
subagent: false
---

Follow the attached `commit` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Execute directly using the current model. Confirmation policy: not-required. Invocation authorizes scoped local staging and commits. Scope: arguments narrow; with no arguments, default to all current changes (every tracked change, staged or unstaged, plus every untracked file). Present the commit messages and per-commit file counts in order, then proceed. Stop for secrets, unclear ownership, or staged changes outside a narrower scope; obey permissions and hooks. No source edits, isolation, amend, push, or PR.

Scope and constraints:
$ARGUMENTS
<!-- opencode:skill commit -->
