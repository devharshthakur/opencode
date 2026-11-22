---
description: Commit task changes, push a verified head branch, and create or update a GitHub PR
subagent: false
---

Follow the attached `pr` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Execute directly in `dev` with the current session model; no worker. Invocation authorizes task-scoped branch preparation, staging, commits, push, missing type-label creation, and PR creation/update, subject to user limits and permissions. Preserve unrelated work; stop for ambiguous scope or repository. Default base: `main`. Syntax: `/pr [:<base>] [draft]`; reject other arguments. Follow the [`pr-offer` skill](../skills/shared/pr-offer/SKILL.md) offer/authorization protocol and the skill's verification gates. On success, reply with only the verified PR URL. Do not emit another offer. No force-push, merge, deployment, or issue closure.

Git snapshot at invocation (read-only; re-check before pushing):
!`git status --short --branch 2>&1 | head -30`
!`git log --oneline -5 2>&1`

Arguments:
$ARGUMENTS
<!-- opencode:skill pr -->
