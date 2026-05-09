---
description: Commit changes as one or more meaningful commits
agent: plan
model: deepseek/deepseek-v4-flash
subtask: false
---

# Commit

Organize current Git changes into one or more meaningful commits with user approval.

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

## Instructions (follow strictly)

### 1. Assess

Run `git diff` on individual files to understand exactly what changed. Classify each change by purpose (feature, fix, refactor, chore, style, docs, test, etc.).

### 2. Group

Decide on the commit structure:

**If changes are small and logically coherent** (all changes relate to the same purpose) → propose a **single commit**. Do not split unnecessarily.

**If changes span multiple unrelated purposes** → organize into focused commit groups. Each group must:

- Have a single, clear purpose
- Be small enough for easy review
- Only contain related files

### 3. Present the plan

Show the user a structured commit plan:

### 4. Ask for approval

Ask the user if they want to proceed, regroup, or adjust commit messages and descriptions.

### 5. Execute

After approval, process commits **one at a time**:

1. `git add <files>` for the commit group
2. Build a conventional commit message of the form `type(scope): subject`. Add a description body **only if the change is substantial enough to warrant it** — small changes get a subject line only.
3. `git commit` with the message
4. Show the commit output
5. Proceed to the next commit

### 6. Summary

After all commits, show:

- Total commits created
- Branch name
- Any remaining uncommitted changes (if user chose to leave some out)

## Rules

- **Always** use conventional commit format: `type(scope): subject`. This is non-negotiable. Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`.
- Never commit without explicit approval
- If user rejects the plan, ask how to regroup
- Description body is optional — only include for substantial changes that need explanation
