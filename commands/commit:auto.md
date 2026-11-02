---
description: Explicitly authorize small coherent local commits without routine confirmation
subagent: false
---

Load `commit` using the skill tool. Authorize its dependency manifest only at written triggers. Execute directly using the current model. Confirmation policy: not-required. Invocation authorizes scoped local staging and commits. Scope: arguments narrow; with no arguments, default to all current changes (every tracked change, staged or unstaged, plus every untracked file). Present the ordered commit series with exact files/messages, then proceed. Stop for secrets, unclear ownership, or staged changes outside a narrower scope; obey permissions and hooks. No source edits, isolation, amend, push, or PR.

Scope and constraints:
$ARGUMENTS
