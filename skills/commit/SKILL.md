---
name: commit
description: Safely create explicitly authorized, scoped local commits under the caller's confirmation policy
metadata:
  opencode/autoinvoke: false
---

# Commit

The caller supplies task scope or a default-scope policy, confirmation policy, and
optional grouping policy; this skill grants no authority. Loading it or asking
about commit messages does not approve staging.

## Inspect

1. Read `../git-isolation/scripts/preflight.sh`, then run it in the checkout.
   Inspect full staged/unstaged diffs, untracked contents, and recent commit style.
2. Attribute every included path/hunk to the requested scope. Arguments may narrow
   scope. When the caller gives no scope and defines the default as current changes,
   the scope is every tracked change, staged or unstaged (modification or deletion),
   plus every untracked file, enumerated individually. Stop for unclear ownership,
   secrets, staged changes outside a supplied narrower scope, or mixed unrelated
   hunks under that narrower scope.
3. If no in-scope changes remain, report "nothing to commit" and stop.

## Propose

- Prefer repository message conventions; otherwise Conventional Commits:
  `<type>[optional scope][!]: <description>`, optional body and verified footers.
- Use a verified scope or omit it. Short imperative description, no trailing
  period, header about 72 characters. A body is optional for trivial self-explanatory
  changes; otherwise briefly explain what/why. Write prose in lowercase, preserving
  identifier/package/path casing inside backticks. Never invent a breaking change.
- Default to small, coherent commits: one concern per commit, in dependency order,
  each independently reviewable and not knowingly broken. Keep tightly coupled
  changes together; path or hunk count alone is not a reason to split. If unrelated
  concerns share a path, keep that path in one commit or stop for a revised grouping.
  When the caller requests one commit or a specific grouping, follow that instead.
- Present the ordered series with exact paths and full messages. With confirmation
  required, obtain direct approval for the series before committing; changed paths,
  grouping, or messages require renewed approval. With not-required policy, proceed
  within the explicit invocation's scope.

## Create and verify

1. Create the approved series in order. For each commit:
   - Mark untracked paths with `git add -N -- <paths>` so the pathspec resolves;
     this does not stage their content. Never use `git add .`, `git add -A`, or
     `git commit -a`.
   - Review `git diff HEAD -- <paths>`, the exact working-tree content the commit
     will include. Confirm every path/hunk belongs to this commit and contains no
     secrets. If a path has both staged and unstaged changes, stop: path-level
     grouping cannot preserve the partial selection. If an unexpected hunk or
     secret appears, stop and preserve the index.
   - Commit only those paths with `git commit -m ... -- <paths>`, using one `-m`
     per paragraph, not literal `\n`. This leaves changes staged for other commits
     untouched. Respect hooks and checks; never disable them to make a commit
     succeed. No destructive Git, amend, rebase, force-push, source edits,
     isolation, push, or PR under this workflow.
2. If a commit or hook fails, stop the series. Preserve completed commits, the
   remaining changes, and the index; report the blocker instead of retrying blindly
   or folding the failure into a later commit.
3. Verify each hash, complete message, included files, the final remaining changes,
   and staged status. Report actual validation and leave commits local.

At standalone completion, follow [optional PR delivery](../shared/pr-offer.md).
When invoked inside `pr`, return local commit evidence to that workflow instead;
do not emit an inner completion offer or independently publish.

**Done when:** only authorized changes are committed in the approved series and
verified, or a precise blocker is reported with work/index preserved. Tool
permissions still apply even when routine confirmation is skipped.

## Dependencies

None. The preflight helper is read-only inspection, not an isolation dependency.
