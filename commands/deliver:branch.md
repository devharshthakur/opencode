---
description: Autonomously implement a task on a separate branch without creating a worktree
agent: edit
subagent: false
---

Load `deliver` using the skill tool. This command authorizes its declared dependency manifest only
at written triggers, plus user-requested additions. Execute in `edit`; no routine plan-approval gate.
Exclude `tanstack-cli` unless the user explicitly requests it, preserving this command's narrower selection.

Use branch-only isolation in the current checkout; create no worktrees, including verification worktrees.
Invocation authorizes isolation, implementation, validation, scoped staging/commits, normal push,
and PR creation/update. Commit-plan confirmation is not required. Honor delivery limits from `AGENTS.md`.
No remote means local execution with authorized local commits and no publishing. Verify GitHub
target/access before remote delivery; other/ambiguous targets or missing access require a decision.
Never create a remote or repository implicitly. Request a missing task before mutation.
Retain isolation; stop for unsafe state, unresolved behavior, or conflicting isolation instructions.

Task and user overrides:
$ARGUMENTS
