---
name: git-isolation
description: Prepare verified branch or worktree isolation for an explicitly authorized task
metadata:
  opencode/autoinvoke: false
---

# Git isolation

The caller supplies isolation mode, task identity, optional base, and branch prefix. This
procedure prepares isolation only; it does not authorize creation, execution, or delivery.
Read exactly `references/branch.md` or `references/worktree.md` for the selected mode.

## Inspect and select base

1. Inspect repository instructions and Git state. If shell is permitted, run
   `sh <this-skill-base>/scripts/preflight.sh` with `shell.workdir` set to the checkout.
   It emits bounded status, statistics, and worktree metadata, not a complete diff or
   ownership proof. Inspect relevant staged/unstaged contents, untracked files, history,
   ignored files affected by switching, and existing task branches/PRs separately.
2. Record original branch or detached SHA and path. Verify repository, base remote, and
   remote default branch without exposing credentials. Publishing workflows also identify
   push remote and PR target independently; neither is assumed to be `origin`.
3. Use the explicit base; otherwise published remote `main`, falling back to the verified
   remote default branch only when `main` is absent. Fetch the selected base without
   switching the original checkout and record its published SHA. Stop for missing bases,
   ambiguous targets, or unavailable access; local/stale refs are not a substitute.
4. Inspect acceptance on that exact revision read-only. Sufficient no-change evidence ends
   the task without an empty commit/PR; executable checks wait for verified isolation.

## Prepare and verify

Follow the selected reference to resume attributable work or create an unused branch at
the recorded SHA. Names use the caller's prefix (`fix/<slug>`, `implement/<slug>`, or
`issue/<number>-<slug>`); validate names and suffix genuine collisions, never overwrite.
Report mode, repository, base remote/branch/SHA, task branch/path, original checkout state,
and any fallback. Keep these records across compaction; recheck ownership and Git state
before resuming. Retain task and verification isolation after success or a blocker.

**Ready when:** the reference's readiness gate passes and destination instructions are
read. Tests, setup, instrumentation, and edits belong only in that verified non-base
checkout. Cleanup follows the selected reference only when separately requested.
