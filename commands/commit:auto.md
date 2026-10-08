---
description: Create scoped local commits without routine approval; never publish
agent: edit
subagent: false
---

Load the skill with exact ID `commit` using the skill tool and follow its safe commit workflow
for the changes and constraints below. Invocation explicitly authorizes scoped local staging and
commits without a routine commit-plan approval gate. Inspect changes, present files per commit
and exact headers, bodies, and footers, then proceed without asking for routine confirmation.

This authorization does not include unrelated changes. If the intended scope cannot be established
from the request and conversation, stop and use the `question` tool rather than guess. Also stop
for secrets, unrelated staged changes, or other unsafe state. Preserve pre-existing work and honor
tool permissions; never bypass a permission prompt or denial. More restrictive user constraints
still apply.

Do not edit source files, create branches/worktrees, amend, push, create PRs, or offer an automatic
push. Leave commits on the local machine only; the user is responsible for pushing to a remote.
Finish by reporting commit hashes, messages, validation performed, and any remaining changes.

Changes to commit and user constraints:
$ARGUMENTS
