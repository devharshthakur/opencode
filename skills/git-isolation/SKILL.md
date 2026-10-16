---
name: git-isolation
description: Prepare explicitly approved local branch or worktree isolation without delivery
metadata:
  opencode/autoinvoke: false
---

# Local isolation

The approved handoff supplies task identity, original checkout, mode, local base
(`HEAD` by default), and operation limits. This skill grants no new authority.
Current-checkout execution does not load it.

1. Read `scripts/preflight.sh`, then run it in the original checkout. Inspect
   relevant staged/unstaged diffs and untracked files separately; its bounded
   output is not ownership proof. Record original branch/path and exact local base SHA.
2. Stop for an unborn repository, invalid base, or unclear ownership. Never create
   an initial commit/remote, fetch, or substitute a remote/stale base implicitly.
3. Read exactly [branch](references/branch.md) or [worktree](references/worktree.md).
   Use `plan/<task-slug>` or `fix/<task-slug>` names matching the command family,
   validate names, and suffix real collisions. Never overwrite an existing branch
   or directory or reuse unrelated work.
4. Prepare only the approved isolation; verify destination instructions, repository,
   selected branch/path, base relationship, and status before tests/setup/edits.

**Ready when:** the selected reference's readiness gate passes and original work
is preserved. Retain/report the resulting branch/path and local changes. No staging,
commits, pushes, PRs, verification isolation, or automatic cleanup.

## Dependencies

None. Base and isolation authority come from the approved handoff.
