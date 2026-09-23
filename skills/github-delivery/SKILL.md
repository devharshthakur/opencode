---
name: github-delivery
description: commit, PR, merge, gh, close issue. Use only during approved delivery phases after implementation is complete.
---

# GitHub Delivery

Use only after implementation exists and user explicitly approves delivery work.

## Commit

1. Inspect status, staged diff, unstaged diff, and untracked files.
2. Group only approved files.
3. Propose concise Conventional Commit messages.
4. Commit only after explicit approval.

## PR

1. Require clean committed branch.
2. Review all commits and diff against base branch.
3. Push branch and create PR with summary and validation.
4. Use `Refs #<issue>` by default unless user explicitly wants auto-close wording.

## Merge / close

1. Inspect PR readiness, checks, and review state.
2. Merge only after explicit approval.
3. Close linked issue only after separate approval.

Return links, validation, and blockers only.
