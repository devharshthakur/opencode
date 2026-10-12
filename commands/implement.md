---
description: Autonomously implement a task in a separate worktree through a verified PR
agent: edit
subagent: false
---

Explicitly invoke the autonomous implementation workflow for the task below. Load `implement`
using the skill tool. Authorized dependencies: `git-isolation`, `commit`, and relevant
skills from this bounded list: `fix-diagnosis`, `surgical-patch`, `safe-refactor`, `migration`,
`verify-and-stop`, `tanstack-cli`, `opencode`, `writing-for-agents`, plus user-named additions.
Load dependencies only when their stage needs them; skills cannot expand this list.

Use worktree isolation by default through `git-isolation`. Honor an explicit user override: if the
user requests no worktree, use `git-isolation`'s branch-only procedure instead. Invocation authorizes
scoped commits, push, and PR creation/update subject to those overrides and applicable tool
permissions. Isolation and scoped staging are included; commit-plan confirmation is not required.
Honor delivery limits from `AGENTS.md`.
If no task is supplied or identifiable in the conversation, request it and stop before
repository mutation.

Task and user overrides:
$ARGUMENTS
