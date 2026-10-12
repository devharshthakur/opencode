# Branch-only isolation

Use a verified non-base task branch in the current checkout. Create no worktrees, including
verification worktrees. The calling workflow owns task scope, commits, and delivery;
`git-isolation` owns published-base selection.

## Preflight

1. Record the original branch/detached SHA, repository, and checkout path. Inspect staged/unstaged
   diffs, untracked files, ignored files a switch could affect, and branch/worktree ownership.
2. A dirty checkout blocks switching. Do not stash, reset, clean, discard, or carry changes across
   branches. Resume on the already selected task branch only when changes are attributable, scope
   and ownership are verified, and no unexpected staged/unrelated work exists.
3. Inspect published-base acceptance read-only when sufficient. If it already holds, report the
   exact revision/evidence without switching or making an empty commit/PR. Defer tests/setup to isolation.

## Isolate or resume

1. Reuse only an attributable task branch with verified repository, ownership, history, base
   relationship, and any PR head. Stop for uncertain changes, unexpected divergence, or shared ownership.
2. If the branch is checked out elsewhere, stop; do not change directories, detach another
   checkout, or bypass Git's ownership checks. Otherwise safely switch to the verified task branch.
3. For new work, create/switch to an unused task branch at the recorded published base SHA. Validate
   its name and suffix genuine collisions; never replace/reset a branch or reuse an unrelated branch.
4. Keep the session directory unchanged. Before tests, setup, instrumentation, or edits, verify
   repository, branch, path, base relationship, status, and applicable destination instructions.
   Execution never runs on the base, `main`, another default/release branch, or a detached base SHA.

**Ready when:** the non-base task branch and checkout are verified and recorded, with existing work preserved.

## Executable published-base verification

- For a fresh task branch whose HEAD is the exact published base SHA, verify baseline acceptance
  there before editing. Continue in that checkout if changes are needed; retain it for a no-change outcome.
- A resumed branch's acceptance is not published-base proof. If read-only base evidence is insufficient,
  executable verification requires a clean, safely switchable checkout. Record the resume branch/SHA,
  create an unused non-base verification branch at the published SHA, and apply the same readiness gate.
  Create no worktrees and do not reset or detach the resume branch. If switching is unsafe, stop.
- Restore the recorded resume branch only when verification leaves the checkout safe to switch;
  otherwise report the remaining files without discarding them. Keep the verification branch.
  Never commit verification artifacts or publish an empty PR.

**Verified when:** acceptance evidence belongs to the recorded published SHA, not unmerged task work.

## Retention

Leave the checkout on its task branch after work or a blocker; after verification-only work, report
the actual selected branch. Retain task/verification branches and local changes. Returning to the
original branch, deleting branches, or cleaning files requires a separate explicit request.

For cleanup-only requests, skip implementation/delivery. Identify the exact branch and requested
destination; inspect staged, unstaged, untracked, and relevant ignored files, worktree ownership,
and unpushed commits against the correct remote. Use only safe, non-forcing operations authorized
by the request. Stop for uncertain ownership, unsafe switching, or any potential loss of work.
