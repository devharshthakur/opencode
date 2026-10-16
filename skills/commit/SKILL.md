---
name: commit
description: Safely create explicitly authorized, scoped local commits under the caller's confirmation policy
metadata:
  opencode/autoinvoke: false
---

# Commit

The caller supplies task scope and confirmation policy; this skill grants no
authority. Loading it or asking about commit messages does not approve staging.

## Inspect

1. Read `../git-isolation/scripts/preflight.sh`, then run it in the checkout.
   Inspect full staged/unstaged diffs, untracked contents, and recent commit style.
2. Attribute every included path/hunk to the requested task. Arguments may narrow
   scope. Never assume all workspace changes belong to it. Stop for unclear scope,
   secrets, unrelated staged changes, or mixed unrelated hunks in the same file.
3. If nothing attributable remains, report "nothing to commit" and stop.

## Propose

- Prefer repository message conventions; otherwise Conventional Commits:
  `<type>[optional scope][!]: <description>`, optional body and verified footers.
- Use a verified scope or omit it. Short imperative description, no trailing
  period, header about 72 characters. A body is optional for trivial self-explanatory
  changes; otherwise briefly explain what/why. Write prose in lowercase, preserving
  identifier/package/path casing inside backticks. Never invent a breaking change.
- Group coherent concerns; do not split needlessly or produce knowingly broken commits.
- Present exact files and full messages. With confirmation required, obtain direct
  approval before staging; changed files/messages require renewed approval.
  With not-required policy, proceed within the explicit invocation's scope.

## Create and verify

1. Stage explicit paths only (`git add -- <paths>`), never `git add .`, `git add -A`,
   or `git commit -a`. Verify the complete staged diff, paths, and absence of secrets.
2. If staging includes an unexpected hunk or secret, stop. Preserve the pre-existing
   index; do not silently unstage someone else's work.
3. Commit using one `-m` per paragraph, not literal `\n`. Respect hooks and checks;
   never disable them to make a commit succeed. No destructive Git, amend, rebase,
   force-push, source edits, isolation, push, or PR under this workflow.
4. Verify hashes, complete messages, included files, remaining changes, and staged
   status. Report actual validation and leave commits local.

At standalone completion, follow [optional PR delivery](../shared/pr-offer.md).
When invoked inside `pr`, return local commit evidence to that workflow instead;
do not emit an inner completion offer or independently publish.

**Done when:** only authorized changes are committed and verified, or a precise
blocker is reported with work/index preserved. Tool permissions still apply even
when routine confirmation is skipped.

## Dependencies

None. The preflight helper is read-only inspection, not an isolation dependency.
