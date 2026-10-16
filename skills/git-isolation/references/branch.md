# Branch-only execution

- Record original checkout/branch and the approved local base's exact SHA.
- A dirty checkout blocks switching. Never stash, reset, clean, discard, or carry
  changes across branches. Resume an existing selected task branch only after
  verifying attributable work, ownership, base, and absence of unrelated staged work.
- Create/switch to an unused `plan/<slug>` or `fix/<slug>` branch at the verified
  local base using verified Git CLI syntax. Do not fetch. If an existing branch is
  checked out elsewhere, stop rather than detaching or moving its checkout.
- Keep the session directory unchanged. Create no worktrees, including verification
  worktrees. Do not create extra verification branches under ordinary isolation approval.
- Before execution, verify repository, selected task branch, path, base relationship,
  instructions, and status. Never run on the original base branch by mistake.

**Ready when:** the task branch is selected in the original checkout, verified at
the approved base (or verified attributable continuation), and prior work is preserved.

Retain the branch and uncommitted task changes. Switching back or deleting branches
requires a separate request and loss-preventing checks; never force cleanup.
