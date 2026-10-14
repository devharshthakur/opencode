---
description: Commit current Git changes without routine approval; never publish
agent: edit
subagent: false
---

Load `commit` using the skill tool. Authorize its declared dependency manifest only at written
triggers, plus user-requested additions.

Use the task or scope provided in arguments. If none is provided, derive the task from current Git
status, diffs, and untracked contents; default scope includes all staged, unstaged, and untracked
changes. Honor additional argument constraints.

Confirmation policy: not-required. Invocation authorizes scoped local staging and commits.
Present files and exact messages, then proceed. For ambiguous explicit scope, secrets, staged changes
outside scope, or unsafe state, use `question` with a concise actionable question only.
Honor permissions, hooks, safety checks, and user limits.
Do not edit source files, create branches/worktrees, amend, push, create PRs, or offer automatic push.
Report verified hashes/messages, actual checks, and remaining changes. Leave commits local.

Scope and additional constraints:
$ARGUMENTS
