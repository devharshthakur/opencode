---
name: ht-git
description: Personal HT git and GitHub delivery workflow for clean-tree checks, issue branches, commit grouping, PR creation, merge, and issue close. Use when implementing approved work, committing changes, creating PRs, merging PRs, or closing GitHub issues.
---

# HT Git Workflow

Shared git/GitHub mechanics for agents acting on HT's behalf.

## Defaults

- Use `main` as base unless HT specifies otherwise.
- Use branch `issue/<issue-number>` for issue work.
- Never overwrite existing branches silently.
- Never commit, push, create PR, merge, or close issue without explicit approval for that phase.
- Use `caveman-commit` for commit message style.
- Use `pnpm` for Node and `uv` for Python unless repo says otherwise.

## Before implementation

1. Verify GitHub/repo access when needed:
   - `gh auth status`
   - confirm repo has GitHub remote if needed
2. Check state:
   - `git status --porcelain`
   - `git branch --show-current`
   - `git fetch origin`
3. Base branch handling:
   - If current branch is `main`, continue after clean-tree handling.
   - If current branch is not `main`, check whether `origin/main` is ahead.
   - If safe and tree clean, checkout `main` and `git pull --ff-only origin main`.
   - If not safe, report blocker and ask HT.

## Dirty tree handling

If `git status --porcelain` is not clean, ask with `question` tool:

| Choice | Action |
| --- | --- |
| `Commit current changes` | Follow `/commit` flow; commit only after approval; re-check status. |
| `Work in current branch` | Continue only if current branch is `main` and HT accepts risk. |
| `Stash the changes` | Ask stash description, run `git stash push -m "<description>"`, re-check status. |
| `Custom instruction` | Follow HT's explicit direction; ask if unclear. |

Never include unrelated dirty changes in issue commits or PR.

## Create issue branch

1. Ensure base branch is current and up to date:
   - `git checkout main`
   - `git pull --ff-only origin main`
2. Create branch:
   - `git checkout -b issue/<issue-number>`
3. If branch exists, ask HT:
   - use existing branch
   - choose new branch name
   - delete/recreate branch (warn before deletion)

## Commit workflow

Use for `/commit` and approved implementation commits.

1. Inspect before proposing:
   - `git status --porcelain`
   - `git diff`
   - `git diff --cached`
   - untracked files via `git ls-files --others --exclude-standard`
2. Classify changes by purpose: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`, `build`.
3. Group commits:
   - small coherent change → one commit
   - multi-part implementation → multiple meaningful commits
   - unrelated work → separate or leave out
4. Present commit plan before committing:
   - commit count
   - message per commit
   - purpose per commit
   - files included
   - files left out
5. Ask approval.
6. After approval, for each commit:
   - `git add <files>` only for that group
   - `git commit -m "<message>"` with body only when needed
7. Summarize commits, branch, remaining changes.

Rules:

- Conventional commits only: `type(scope): subject`.
- Never commit secrets or unrelated files.
- Never push during commit phase unless PR phase is approved.

## PR workflow

Start only after HT approves PR creation.

1. Verify clean state:
   - `git status --porcelain`
   - if dirty, stop and ask.
2. Review PR content:
   - `git log --oneline main..HEAD`
   - `git diff --stat main...HEAD`
3. Push branch:
   - `git push -u origin <branch>`
4. Create PR:
   - `gh pr create --base main --head <branch> --title "<title>" --body "<body>"`

PR body:

## Summary
- <change 1>
- <change 2>

## Validation
- <test/check>

Refs #<issue>

5. Return PR URL.
6. Ask: `Merge PR and close issue?`

## Merge and close workflow

Start only after HT approves merge/close.

1. Inspect readiness:
   - `gh pr view <pr> --json number,url,isDraft,mergeStateStatus,reviewDecision,statusCheckRollup`
2. Stop and ask if:
   - PR is draft
   - checks fail/pending and HT has not approved override/waiting
   - review required or changes requested
   - merge state blocked/dirty/unknown
3. Merge with merge commit default:
   - `gh pr merge <pr> --merge --delete-branch`
4. Close issue separately:
   - `gh issue close <issue> --comment "Implemented in <PR URL>."`
5. Final report: PR URL, issue URL, merge method, any caveats.

## Issue creation workflow

For prompt/problem work where HT chooses issue-first:

1. Draft issue:
   - title
   - problem/goal
   - acceptance criteria
   - implementation notes
   - validation plan
   - labels if clear
2. Ask approval before creating.
3. Run `gh issue create` only after approval.
4. Return issue URL/number, then continue with issue workflow.
