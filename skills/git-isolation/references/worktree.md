# Worktree execution

- Record the original repository, branch/SHA, path, and status. A dirty original
  checkout may remain untouched. Never stash, reset, clean, discard, switch, or copy
  its changes or credentials. A task depending on dirty files needs a preservation decision.
- Resolve the approved local base SHA without fetching. Create an unused
  `plan/<slug>` or `fix/<slug>` branch and worktree outside the original checkout
  using verified Git CLI syntax or an advertised native operation that supports the
  exact base. Validate names/paths and do not overwrite, detach another checkout,
  or reuse unrelated work.
- Resume existing isolation only after verifying task ownership, scope, base,
  history, and current changes. Do not create extra verification worktrees automatically.
- In a worker, use explicit absolute paths and shell workdirs for the destination.
  A session move is optional; use only an advertised operation, then verify the
  destination in a separate call before destination-dependent work. Do not move the parent.
- Verify destination repository, task branch/path, base relationship, instructions,
  and status before tests/setup/edits. Never run task execution in the protected original checkout.

**Ready when:** the separate task checkout is verified, tool targeting is correct,
and original work remains untouched. Retain/report branch, base SHA, and worktree path.
Removal requires separate explicit authority and checks for dirty/untracked/ignored
data and unique commits. Never force-remove or delete the linked branch implicitly.
