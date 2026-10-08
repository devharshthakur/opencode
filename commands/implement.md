---
description: Autonomously implement a task in a separate worktree through a verified PR
agent: edit
subagent: false
---

Explicitly invoke the autonomous implementation workflow for the task below. Load the skill with
exact ID `implement` using the skill tool, then read `references/worktree.md` relative to its base
directory before repository mutation. Use worktree isolation by default. Honor explicit user overrides;
if the user requests no worktree, read and use `references/branch.md` instead. Invocation authorizes
scoped commits, push, and PR creation/update subject to those overrides and applicable tool permissions.
If no task is supplied or identifiable in the conversation, request it and stop before repository mutation.

Task and user overrides:
$ARGUMENTS
