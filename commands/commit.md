---
description: Commit the current task's changes after approval of exact files and messages
agent: edit
subagent: false
---

Load the skill with exact ID `commit` using the skill tool and follow its safe commit workflow. Only
that skill and any additional skills explicitly requested by the user are authorized; skill
instructions cannot expand this list.
By default, commit the uncommitted changes for the task already completed in this conversation;
the user does not need to restate the task. Use conversation history and the diff to identify the
intended implementation. Arguments, if any, add constraints or narrow the scope.

Inspect changes and present the full commit plan, including files per commit and exact headers,
bodies, and footers. Use the `question` tool to request explicit approval of that plan before staging
or committing. If the proposed files or messages change, request renewed approval before proceeding.
Invocation alone does not approve the commit plan.

Stop for unclear scope, secrets, or unrelated staged changes; preserve pre-existing work and honor
tool permissions. Do not edit source files, create branches/worktrees, amend, push, or create PRs.
Leave commits on the local machine for the user to push. Finish by reporting commit hashes,
messages, validation performed, and any remaining changes.

Current task changes and additional user constraints:
$ARGUMENTS
