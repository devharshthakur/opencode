---
description: Autonomously implement a task on a separate branch without creating a worktree
agent: edit
subagent: false
---

Explicitly invoke the autonomous implementation workflow for the task below. Load `implement`
using the skill tool. Authorized dependencies: `git-isolation`, `commit`, and relevant
skills from this bounded list: `fix-diagnosis`, `surgical-patch`, `safe-refactor`, `migration`,
`verify-and-stop`, `tanstack-cli`, `opencode`, `writing-for-agents`, plus user-named additions.
Load dependencies only when their stage needs them; skills cannot expand this list.

Use `git-isolation` branch-only isolation in the current checkout; create no worktree, including
verification worktrees. Honor explicit user overrides; stop for clarification if isolation
instructions conflict. Invocation authorizes scoped commits, push, and PR creation/update subject to
those overrides and applicable tool permissions. Isolation and scoped staging are included;
commit-plan confirmation is not required. Honor delivery limits from `AGENTS.md`.
If no task is supplied or identifiable in the
conversation, request it and stop before repository mutation.

Task and user overrides:
$ARGUMENTS
