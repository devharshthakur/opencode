# Results and repair PRs

Use only at planning output or completion. State actual facts, not intended checks as completed proof.

## Fix commands and repair workers

Use exactly these top-level sections, in this order. Put additional details inside them.

```markdown
## issue
Symptom and confirmed cause with evidence, or leading hypotheses and uncertainty.

## fix plan
Planned or approved changes, validation, isolation, base, and delivery scope.

## result
Diagnosis or implementation outcome.
Checks passed, failed, blocked, or unrun; limitations and remaining work.
Local/committed/published status, base fallback, branch, retained worktree paths, and cleanup blockers.
Verified PR URL when available.
```

For `/fix`, say "Diagnosis only; no changes made." Never ask for execution approval from diagnosis-only mode.
Before approval-triggered execution, state "Awaiting approval; no changes made" and include the approval
question under `result`. Final results use the same format and name any partial implementation or blocker.
If a repair PR exists, its verified URL is the final line inside `result`, including after a later blocker.

## Other workflows

Report changes, actual checks, limitations, repository/base, branch/path, delivery state, and retained
resources concisely. Local build reports also distinguish pre-existing work and staged status.
When a task PR was created, updated, or verified, its verified URL is the final line unless the user
explicitly requests another format. No URL is invented for local-only or failed PR creation.

## PR body

Use clear prose, not compressed worker shorthand. Include only:

```markdown
## Issue
What was wrong or missing.

## Fix
What changed and why it addresses the cause or requirement.

## Validation
Actual checks and any limitations or pending CI.
```

A short fenced `diff` snippet is optional only when it explains the root fix better than prose.
Use the actual reviewed change, no secrets and no complete patch. Reference issues with `Refs #<number>`
or verified URLs; never use auto-closing keywords without separate explicit closure authority and confirmation.
