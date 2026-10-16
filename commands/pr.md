---
description: Commit task changes, push a verified head branch, and create or update a GitHub PR
subagent: false
---

Load `pr` using the skill tool. Authorize its dependency manifest only at written triggers. Execute directly in `dev` with the current session model; no worker. Invocation authorizes task-scoped branch preparation, staging, commits, push, missing type-label creation, and PR creation/update, subject to user limits and permissions. Preserve unrelated work; stop for ambiguous scope or repository. Default base: `main`. Syntax: `/pr [:<base>] [draft]`; reject other arguments. Follow the shared PR offer/authorization protocol and the skill's verification gates. End with the verified PR URL, not another offer. No force-push, merge, deployment, or issue closure.

Arguments:
$ARGUMENTS
