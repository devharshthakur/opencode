# Branch-only isolation

Use a separate task branch in the current checkout. Do not create or attach any worktree,
including temporary verification worktrees. Follow the shared skill for task scope,
published-base selection, validation, commits, and delivery.

## Preflight and published-base verification

1. Inspect the current branch, staged and unstaged diffs, untracked files, ignored files that a
   switch could affect, and existing worktrees before switching branches.
2. A dirty checkout is a blocker for branch switching. Never stash, reset, clean, discard, or
   switch its changes. An already selected, verified task branch may resume attributable task
   changes only when ownership is clear and no unexpected staged or unrelated work exists.
3. Check acceptance against the exact published base SHA using read-only inspection when sufficient.
   If execution requires checking out that revision, first verify the checkout is clean and safe
   to switch, record the original branch or detached SHA, then temporarily check out that exact
   revision. Do not create a verification worktree or commit changes in this verification checkout.
4. If acceptance already holds, restore the recorded original branch or detached SHA only if
   verification left the checkout safe to switch. Otherwise stop and report the remaining files;
   never discard them. Report the published evidence and do not create an empty PR.
5. If further work is needed, proceed to a verified task branch. If the checkout cannot safely
   be switched for required verification or isolation, stop with the blocker.

## Isolate or resume

1. Reuse an attributable task branch only when repository identity, ownership, history, and any
   existing PR head agree. Stop for ambiguous changes, unexpected staged work, diverged history,
   or shared branch ownership. Do not replace or reset an existing branch.
2. If the task branch is checked out in another worktree, stop. Do not switch directories,
   detach that worktree, or override Git's branch ownership checks.
3. Otherwise create and switch to an unused task branch at the verified published base SHA.
   Validate the branch name and add a suffix for genuine naming collisions. Do not commit
   directly to the target base branch or reuse the user's unrelated current branch.
4. Keep the current session directory unchanged. Confirm the repository, task branch, base
   relationship, status, and applicable instructions before editing.

## Retention

Leave the checkout on the task branch after implementation, delivery, or a blocker. Report the
checkout path and branch. Do not automatically switch back, delete the branch, or clean files.
Branch deletion, switching after completion, or other cleanup requires a separate explicit request
and applicable permissions; stop whenever state or ownership is uncertain or user work would be lost.
