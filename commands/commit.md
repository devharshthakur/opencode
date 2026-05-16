---
description: Commit changes as one or more meaningful commits
agent: plan
model: opencode/deepseek-v4-flash-free
subtask: false
---

# Commit

Organize current Git changes into one or more meaningful commits. Commit only after user approval.

## Skills

**Mandatory (load on start):**
- `caveman` — ultra-compressed communication
- `caveman-commit` — compressed conventional commit message format
- `ht-git` — HT commit grouping and approval workflow

**On-demand:**
Pull any other skill relevant to the commit context using the `skill` tool.

## Current repository state

Untracked files:
!`git ls-files --others --exclude-standard`

Staged changes:
!`git diff --cached --stat`

Unstaged changes:
!`git diff --stat`

## Workflow

Follow `ht-git` commit workflow exactly:

- inspect staged, unstaged, and untracked changes
- group by meaning
- present commit plan with messages, purpose, files included/left out
- ask approval before committing
- commit one approved group at a time
- summarize commits, branch, and remaining uncommitted changes

## Rules

- Always use conventional commit format: `type(scope): subject`.
- Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`, `build`.
- Never commit without explicit approval.
- If user rejects plan, ask how to regroup.
- Do not include unrelated files.
- Do not push unless user explicitly asks.
- Keep output concise; no large diffs in final summary.
