---
description: Commit changes, push a verified head branch, and create or update a GitHub PR
subagent: false
---

Follow the attached `pr` skill. If it is not attached, load it with the skill tool. Authorize its dependency manifest only at written triggers. Execute directly in `dev` with the current session model; no worker. This invocation is the only authority for the PR flow: it authorizes branch preparation, staging, commits, push, missing type-label creation, and PR creation/update, subject to user limits and permissions. Preserve unrelated work; stop for ambiguous repository or blocked target. Syntax: `/pr [:<base>] [@<remote>] [draft]`, any order, each at most once; reject other arguments. Default base: `main`. Default target repository: the push remote's repository. Resolve targets by running the skill's `scripts/pr-target.sh` with the arguments quoted as separate words; `references/targets.md` is its rule spec. On success, reply with only the verified PR URL. No force-push, merge, deployment, or issue closure.

Git snapshot at invocation (read-only, local only; re-check before pushing). Run `pr-target.sh` for target resolution:
!`sh "${XDG_CONFIG_HOME:-$HOME/.config}/opencode/skills/git-isolation/scripts/preflight.sh" 2>&1`
!`printf '\n## Recent commits\n'; git --no-pager log --oneline -5 2>&1`

Arguments:
$ARGUMENTS
<!-- opencode:skill pr -->
