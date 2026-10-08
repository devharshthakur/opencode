# Worktree isolation

Use a separate worktree for the implementation workflow. Follow the shared skill for task scope,
published-base selection, validation, commits, and delivery.

## Isolate or resume

1. A dirty original checkout is not a blocker if a separate worktree can leave it untouched.
   Never stash, reset, clean, discard, or switch its changes. Do not copy unrelated dirty files
   into the task worktree.
2. Reuse a verified task branch and linked worktree when repository identity, ownership, history,
   and any existing PR head agree. Resume attributable task changes without discarding them.
   Stop for ambiguous changes, unexpected staged work, diverged history, or shared branch ownership.
3. If that branch exists without a worktree, attach a new worktree only after verifying it.
   Do not replace or reset it. If it is checked out in the original checkout, do not detach that
   checkout to free the branch; stop unless the verified existing checkout can be safely resumed.
4. Otherwise use Git to create the task branch and worktree at the verified published base SHA.
   Use an unused sibling directory outside the original checkout. Validate the branch name and
   add a suffix for genuine naming collisions; never overwrite an existing path or branch.
5. If `opencode.session_move` is advertised, call it through `execute` with the selected directory.
   Make a **separate subsequent tool call** before destination-dependent reads or edits.
   If unavailable, use explicit destination paths and `shell.workdir`, subject to directory permissions.
6. Confirm the selected repository, branch, base relationship, status, and destination instructions
   before editing. Keep the original checkout intact.

## Published-base verification

Verify acceptance against the exact published base SHA, not an unmerged task branch. If execution
needs isolation, use a separate verification worktree without switching the original checkout.
If no implementation is needed, do not create task commits or an empty PR. Record and retain any
verification worktree so cleanup remains explicit.

## Retention

Keep the task worktree and branch after delivery or a blocker so review and CI fixes can resume.
Report their path and name. Do not delete them automatically.

## Explicit cleanup requests only

For cleanup-only requests, skip implementation and delivery. Identify the exact task worktree and
its linked branch/PR. Confirm it is not the main worktree; inspect tracked, untracked, and ignored
files and verify no unpushed commits against the correct remote branch. Stop if state or ownership
is uncertain or anything would be lost.

Move the active session to a safe retained directory before removal, then verify the move in a
separate tool call. If safe movement cannot be confirmed, stop. Subject to tool approval, remove
only the verified worktree with `git worktree remove <path>` without `--force`. Verify its absence.
Leave the branch and PR intact unless separately requested. End with the verified task PR URL
when one is available.
