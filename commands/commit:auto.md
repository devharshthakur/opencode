---
description: Commit the current task's changes without routine approval; never publish
agent: edit
subagent: false
---

Load the skill with exact ID `commit` using the skill tool and follow its safe commit workflow. Only
that skill and any additional skills explicitly requested by the user are authorized; skill
instructions cannot expand this list.
By default, commit the uncommitted changes for the task already completed in this conversation;
the user does not need to restate the task. Use conversation history and the diff to identify the
intended implementation. Arguments, if any, add constraints or narrow the scope.

Invocation explicitly authorizes scoped local staging and commits without a routine commit-plan
approval gate. Inspect changes, present files per commit and exact headers, bodies, and footers, then
proceed without asking for routine confirmation.

This authorization does not include unrelated changes. If the intended task scope cannot be
established from conversation history and the diff, stop and use the `question` tool rather than
guess. Also stop for secrets, unrelated staged changes, or other unsafe state. Preserve pre-existing
work and honor tool permissions; never bypass a permission prompt or denial. More restrictive user
constraints still apply.

Do not edit source files, create branches/worktrees, amend, push, create PRs, or offer an automatic
push. Leave commits on the local machine only; the user is responsible for pushing to a remote.
Finish by reporting commit hashes, messages, validation performed, and any remaining changes.

Current task changes and additional user constraints:
$ARGUMENTS
