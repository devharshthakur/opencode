---
description: Autonomously implement a task on a separate branch without creating a worktree
agent: edit
subagent: false
---

Explicitly invoke the autonomous implementation workflow for the task below. Load the skill with
exact ID `implement` using the skill tool, then read `references/branch.md` relative to its base
directory before repository mutation. Use a separate task branch in the current checkout. Do not
create any worktree, including verification worktrees. Honor explicit user overrides; stop for
clarification if isolation instructions conflict. Invocation authorizes scoped commits, push, and
PR creation/update subject to those overrides and applicable tool permissions. If no task is supplied
or identifiable in the conversation, request it and stop before repository mutation.

Task and user overrides:
$ARGUMENTS
