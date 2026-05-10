---
description: Commit changes as one or more meaningful commits
agent: plan
model: deepseek/deepseek-v4-flash
subtask: false
---

# Commit

Organize current Git changes into one or more meaningful commits. Commit only after user approval.

## Skills

**Mandatory (load on start):**
- `caveman` — ultra-compressed communication
- `caveman-commit` — compressed conventional commit message format

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

Follow in order.

### 1. Assess

Inspect changes before proposing commits:

- Use `git diff` / `git diff --cached` on relevant files.
- Check untracked files before adding them.
- Classify each change by purpose: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`.

### 2. Group

Choose commit structure:

- Small coherent changes → propose one commit. Do not split unnecessarily.
- Unrelated purposes → propose focused groups.

Each group must have one clear purpose, related files only, and reviewable size.

### 3. Present commit plan

Show:

- Commit count.
- For each commit: message, purpose, files included.
- Files intentionally left out, if any.

### 4. Ask approval

Ask user to proceed, regroup, or adjust messages/descriptions. Do not commit before approval.

### 5. Execute

After approval, process one commit at a time:

1. `git add <files>` for that group only.
2. Build conventional message: `type(scope): subject`.
3. Add body only when substantial context is needed; small commits use subject only.
4. Run `git commit`.
5. Show commit output.
6. Continue to next approved group.

### 6. Summary

After all commits, report:

- Total commits created.
- Branch name.
- Remaining uncommitted changes, if any.

## Rules

- Always use conventional commit format: `type(scope): subject`.
- Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`.
- Never commit without explicit approval.
- If user rejects plan, ask how to regroup.
- Do not include unrelated files.
- Do not push unless user explicitly asks.
- Keep output concise; no large diffs in final summary.
