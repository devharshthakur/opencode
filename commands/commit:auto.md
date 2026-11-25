---
description: Explicitly authorize small coherent local commits without routine confirmation
subagent: false
---

Follow the attached `commit` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Execute directly using the current model. Confirmation policy: not-required. Invocation authorizes scoped local staging and commits. Scope: arguments narrow; with no arguments, default to all current changes (every tracked change, staged or unstaged, plus every untracked file). Output MUST be the commit table from the `commit` skill's output template: read `references/output.md` first. Any reply without that table is invalid. Then proceed. Stop for secrets, unclear ownership, or staged changes outside a narrower scope; obey permissions and hooks. No source edits, isolation, amend, push, or PR.

Git snapshot at invocation (read-only preflight plus commit conventions; re-check before staging):
!`sh "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/skills/git-isolation/scripts/preflight.sh" 2>&1`
!`sh "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/skills/commit/scripts/conventions.sh" 2>&1`

Scope and constraints:
$ARGUMENTS
<!-- opencode:skill commit -->
