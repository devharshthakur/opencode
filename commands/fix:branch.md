---
description: Diagnose and repair on a feature branch without commits or publishing
agent: edit
subagent: false
---

Load `git-isolation`, `fix-diagnosis`, and `surgical-patch` with the skill tool at their stages,
in that sequence, to repair the bug.
Those skills and relevant `opencode` are authorized, plus user-named additions.
Use branch-only isolation in the current checkout, prefix `fix/`; create no worktrees,
including verification worktrees. This authorizes isolation, local repair, and validation
only: no staging, commits, push, or PRs. Stay in `edit`; do not require `/build`.
Follow the shared isolation/repair gates, retain the branch and changes, and report cause,
proof/limitations, checks, base SHA/fallback, branch, and checkout path. Request a missing bug
before mutation. Stop for ambiguous cause/behavior or material scope expansion.

Bug, explicit base, and user constraints:
$ARGUMENTS
