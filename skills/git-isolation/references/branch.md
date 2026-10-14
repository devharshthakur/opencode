# Branch-only isolation

Use a verified non-base task branch in the current checkout. Create no worktrees, including
verification worktrees. The calling workflow owns task scope, commits, and delivery;
`git-isolation` owns base selection.

## Preflight

1. Record the original branch/detached SHA, repository, and checkout path. Inspect staged/unstaged
   diffs, untracked files, ignored files a switch could affect, and branch/worktree ownership.
2. A dirty checkout blocks switching. Do not stash, reset, clean, discard, or carry changes across
   branches. Resume on the already selected task branch only when changes are attributable, scope
   and ownership are verified, and no unexpected staged/unrelated work exists.
3. Select exactly one base and label its kind: `base_kind: local` for an explicit valid local base,
   or for a verified local `HEAD` when no remote exists; `base_kind: published` only for a fetched,
   verified published revision. Record the base remote/ref and its exact SHA.
4. Inspect acceptance on that exact recorded revision read-only. If it already holds, report the
   exact revision and evidence without switching or making an empty commit/PR; the proof is labeled
   by its base kind. Defer tests/setup to isolation.

## Isolate or resume

1. Reuse only an attributable task branch with verified repository, ownership, history, base
   relationship, and any PR head. Stop for uncertain changes, unexpected divergence, or shared ownership.
2. If the branch is checked out elsewhere, stop; do not change directories, detach another
   checkout, or bypass Git's ownership checks. Otherwise safely switch to the verified task branch.
3. For new work, create/switch to an unused task branch at the recorded base SHA (local or published
   per `base_kind`). Validate its name and suffix genuine collisions; never replace/reset a branch or
   reuse an unrelated branch.
4. Keep the session directory unchanged. Before tests, setup, instrumentation, or edits, verify
   repository, branch, path, base relationship, status, and applicable destination instructions.
   Execution never runs on the base, `main`, another default/release branch, or a detached base SHA.

**Ready when:** the non-base task branch and checkout are verified and recorded, with existing work preserved.

## Base verification (local and published)

- Local-only work (`base_kind: local`) needs no remote: verify the explicit local base or the local
  `HEAD` SHA, and label its acceptance proof local.
- Published work (`base_kind: published`) requires the fetched, verified revision. Acceptance
  evidence must belong to that recorded SHA, never unmerged task work; only a fetched revision
  counts as published proof.
- For a fresh task branch whose HEAD is the exact recorded base SHA, verify baseline acceptance
  there before editing. Continue in that checkout if changes are needed; retain it for a no-change outcome.
- A resumed branch's acceptance is not base proof. If read-only base evidence is insufficient and
  switching is safe, create an unused non-base verification branch at the recorded base SHA and
  apply the same readiness gate. Create no worktrees and do not reset or detach the resume branch.
  If switching is unsafe, stop.
- Restore the recorded resume branch only when verification leaves the checkout safe to switch;
  otherwise report the remaining files without discarding them. Keep the verification branch.
  Never commit verification artifacts or publish an empty PR.

**Verified when:** acceptance evidence belongs to the recorded base SHA for its labeled kind.

## Retention

Leave the checkout on its task branch after work or a blocker; after verification-only work, report
the actual selected branch. Retain task/verification branches and local changes; there is no
automatic cleanup. Returning to the original branch, deleting branches, or cleaning files requires a
separate explicit request.

For cleanup-only requests, skip implementation/delivery. Identify the exact branch and intended
destination, and whether a correct remote exists. When a remote exists, inspect unpushed commits
against that correct remote branch. For local-only unique commits, retain reachable branches or the
explicit intended retained branch. Inspect staged, unstaged, untracked, and relevant ignored files
and worktree ownership. Use only safe, non-forcing operations authorized by the request; stop for
uncertain ownership, unsafe switching, or any potential loss of work.
