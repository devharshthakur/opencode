---
description: Plan local commits and request explicit approval before committing
agent: edit
subagent: false
---

Load the skill with exact ID `commit` using the skill tool and follow its safe commit workflow
for the changes and constraints below. Inspect changes and present the full commit plan, including
files per commit and exact headers, bodies, and footers. Use the `question` tool to request explicit
approval of that plan before staging or committing. If the proposed files or messages change,
request renewed approval before proceeding. Invocation alone does not approve the commit plan.

Stop for unclear scope, secrets, or unrelated staged changes; preserve pre-existing work and honor
tool permissions. Do not edit source files, create branches/worktrees, amend, push, or create PRs.
Leave commits on the local machine for the user to push. Finish by reporting commit hashes,
messages, validation performed, and any remaining changes.

Changes to commit and user constraints:
$ARGUMENTS
