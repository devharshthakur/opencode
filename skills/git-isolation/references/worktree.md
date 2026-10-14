# Worktree isolation

Use a separate task worktree, preserving non-task checkouts. A verified task worktree already
selected by the session may resume. The calling workflow owns task scope, commits, and delivery;
`git-isolation` owns base selection. Every executable checkout must have a verified non-base branch.

## Isolate or resume

1. Record original repository, branch/SHA, path, status, and existing worktrees. A dirty original
   checkout is not a blocker if left untouched. Do not stash, reset, clean, discard, switch, or copy
   its changes. If the task depends on uncommitted changes in a non-task checkout, ask how to proceed.
2. Resume only a verified task branch/worktree with matching repository, ownership, scope, history,
   base relationship, and any PR head. Preserve attributable work; stop for uncertain/unrelated
   changes, unexpected staged work/history divergence, or shared ownership.
3. Attach a new worktree to an existing task branch only after verification and only if not checked
   out elsewhere. Do not detach another checkout to free it. If checked out in a non-task checkout
   rather than a separate verified task worktree, resume there only with explicit authority for
   that checkout/isolation; otherwise stop for clarification.
4. Select exactly one base and label its kind before creating work: `base_kind: local` for an
   explicit valid local base or a verified local `HEAD` when no remote exists; `base_kind: published`
   only for a fetched, verified published revision. For new work, use Git to create the
   branch/worktree at the recorded base SHA in an unused sibling directory outside the original
   checkout. Validate names and suffix genuine collisions; never overwrite paths or reset branches.
   Tests/setup do not run in protected non-task checkouts.
5. If advertised, call `opencode.session_move` through `execute` to move the current session to the
   task worktree. Make a **separate subsequent tool call** before destination-dependent reads/edits.
   Otherwise use explicit paths and `shell.workdir`, subject to directory permissions.
6. Before tests, setup, instrumentation, or edits, verify destination repository, non-base branch,
   path, base relationship, status, and instructions. Never execute on the base, `main`, another
   default/release branch, or a detached base SHA.

**Ready when:** the task worktree is verified and recorded, session/path targeting is correct, and
protected non-task checkouts are preserved.

## Base verification (local and published)

- Local-only work (`base_kind: local`) needs no remote: verify the explicit local base or the local
  `HEAD` SHA, and label its acceptance proof local.
- Published work (`base_kind: published`) requires the fetched, verified revision. An unmerged task
  branch/PR is not published proof; only the recorded fetched SHA counts.
- For a fresh task worktree at the exact recorded base SHA, run required baseline verification
  there before editing. Reuse it for implementation, or retain it if no change is needed.
- Only when resumed task work differs from base and executable verification is needed, create an
  additional worktree on an unused non-base verification branch at the recorded base SHA. Apply the
  same repository/branch/path/instruction readiness gate; use explicit paths and `shell.workdir`
  without switching the original checkout. Do not reset the task branch to obtain baseline proof.
- Record and retain verification branches/worktrees. No-change outcomes cite the recorded
  revision/evidence; they do not create task commits or empty PRs.

**Verified when:** acceptance evidence belongs to the recorded base SHA for its labeled kind.

## Retention

Keep task and verification branches/worktrees after delivery, no-change, or a blocker. Report all
created paths/branches so work and cleanup can resume; do not delete them automatically.

## Explicit cleanup requests only

For cleanup-only requests, skip implementation/delivery. Identify the exact worktree and linked
branch/PR; confirm it is not the main worktree, and whether a correct remote exists. Verify no
unpushed commits against the correct remote branch when one exists; for local-only unique commits,
retain reachable branches or the explicit intended retained branch. Inspect tracked, untracked, and
ignored files. Stop for uncertain state/ownership or loss.

If the active session is inside the removal target, move it to a safe retained directory and verify
the move in a separate tool call. If safe targeting cannot be confirmed, stop. Subject to
permissions, remove only the verified worktree without force, using an advertised removal tool or
`git worktree remove <path>`; verify its absence. Leave branch/PR intact unless separately
requested. End with the verified task PR URL when available.
