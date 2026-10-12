---
description: Diagnose and repair in a retained worktree without commits or publishing
agent: edit
subagent: false
---

Load `git-isolation`, `fix-diagnosis`, and `surgical-patch` with the skill tool at their stages,
in that sequence, to repair the bug.
Those skills and relevant `opencode` are authorized, plus user-named additions.
Use worktree isolation, prefix `fix/`, preserving the original checkout. This authorizes
isolation, local repair, and validation only: no staging, commits, push, or PRs.
Stay in `edit`; do not require `/build`. Follow the shared isolation/repair gates, retain
the worktree and changes, and report cause, proof/limitations, checks, base SHA/fallback,
branch, and worktree path. Request a missing bug before mutation. Stop for ambiguous
cause/behavior, conflicting isolation instructions, or material scope expansion.

Bug, explicit base, and user constraints:
$ARGUMENTS
