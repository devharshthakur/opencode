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
   ignored files affected by switching, and existing task branches/PRs separately. Read the
   script before running it. Before authority is granted, do not fetch, create branches or
   worktrees, or mutate the checkout.
2. Record original branch or detached SHA and path. Verify repository, base remote, and
   remote default branch without exposing credentials. GitHub publishing targets verify the
   target repository, base remote, and push remote separately; none is assumed to be `origin`.
3. Select exactly one base and label it:
   - `base_kind: local` when the caller gives an explicit valid local base, or for a verified
     local `HEAD` when no remote exists.
   - `base_kind: published` when using published `main` (or the verified remote default branch
     when `main` is absent). Fetch the selected base without switching the original checkout,
     and record its exact published SHA.
   A published base requires an authorized fetch of the exact revision. A fetch failure is not a no-remote: local/stale refs are not a substitute for a required published base. Stop for missing bases, ambiguous targets, or unavailable access.
4. Stop for an unborn repository; never create an initial commit or remote implicitly.
5. Inspect acceptance on that exact revision read-only. Sufficient no-change evidence ends the
   task without an empty commit/PR; executable checks wait for verified isolation. Local and
   published base proof are distinguished, and an unmerged task branch/PR is not published proof.

## Prepare and verify

Follow the selected reference to resume attributable work or create an unused branch at the
recorded SHA. Names use the caller's prefix (`fix/<slug>`, `deliver/<slug>`, or
`issue/<number>-<slug>`); validate names and suffix genuine collisions, never overwrite.
Report mode, repository, base kind and base remote/ref/SHA, task branch/path, original
checkout state, and any fallback. Keep these records across compaction; recheck ownership and Git state before
resuming. Existing attributable task isolation is resumable after verifying ownership, base,
and state. Retain task and verification isolation after success or a blocker; there is no
automatic cleanup. Any separately authorized cleanup must use loss-preventing checks and
never force by default.

**Ready when:** the reference's readiness gate passes and destination instructions are
read. Tests, setup, instrumentation, and edits belong only in that verified non-base
checkout. Cleanup follows the selected reference only when separately requested.

## Dependencies

None. The caller supplies isolation mode, task identity, base, and prefix; this skill prepares
isolation and does not authorize it.
