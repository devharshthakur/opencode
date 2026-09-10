---
description: Stage logically grouped changes and create approved conventional commits
agent: build
---

# Commit

This command is the user's explicit request to create git commits. Still confirm the plan before committing.

Input/instructions: `$ARGUMENTS`
(Examples: `api only`, `single commit`, `no split`, `scope: web`, `message: ...`. If present, follow them.)

## Step 0 — Hard rules (never break)

- NEVER run destructive git: `reset --hard`, `clean -fd`, `rebase`, `checkout .`, `restore` of unstaged work, or force push.
- NEVER commit secrets: `.env*`, credentials, tokens, keys, `*.pem`, `*.key`, `id_rsa*`, `.npmrc`, `.netrc`, service-account files.
- NEVER stage files unrelated to the described change.
- NEVER amend, push, or create a PR unless the user explicitly approves that step (push is offered in Step 6).
- NEVER invent a scope. Use only scopes that exist in this repo.
- If anything is unclear or risky, use the `question` tool and stop.

## Step 1 — Inspect (read-only)

Run and read the output of:

```
git status
git status --porcelain
git branch --show-current
git diff
git diff --cached
git log --oneline -15
```

List every change: modified, added, deleted, renamed, untracked. If there are no changes, report "nothing to commit" and stop.

## Step 2 — Learn repo conventions

- Detect valid scopes from top-level directories and from recent history (`git log --oneline -30`).
  Prefer a real folder name (`web`, `api`, `shared`, `packages`, `agents`, `commands`, ...).
- Meta scopes are allowed when no folder fits: `deps`, `docs`, `config`, `ci`, `build`.
- Match the repo's existing commit style when it has one.
- If a scope is unclear, omit it. Never guess.

## Step 3 — Plan small commits

- Split changes into small, logically coherent commits: one concern per commit.
- Do not mix unrelated areas.
- Order commits so earlier ones are prerequisites (deps/config before code).
- For each commit define:
  - `type`: feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
  - `scope`: optional and must exist in the repo
  - `title`: imperative, small-to-medium, max ~72 chars, no trailing period
  - `body`: required when the change is non-trivial; explain what and why; wrap at 72 chars

## Step 4 — Present plan and get approval

- Show the full plan (files per commit + exact type/scope/title + body).
- Ask for approval with the `question` tool.
- Do NOT commit anything before approval.

## Step 5 — Commit

For each approved commit, in order:

1. Stage only that commit's files explicitly:
   `git add -- <path> <path> ...`
   For deletions use `git add -- <path>` (git records the removal).
2. Verify staging: `git status --short` and `git diff --cached --stat`.
3. If an unintended file or secret is staged, unstage it (`git restore --staged <path>`) and stop.
4. Commit (use `-m` twice so the body is preserved):
   `git commit -m "<type>(<scope>): <title>" -m "<body>"`
5. Confirm: `git log --oneline -1`.

Never use `git add -A`, `git add .`, or `git commit -a` unless the user explicitly approved committing every listed file.

## Step 6 — Report and offer push

- Show `git status --short` and `git log --oneline -<n>` for the new commits.
- Ask with `question` whether to push. Do NOT push without approval.
- If approved: `git push` (never `--force`). If there is no upstream: `git push -u origin <branch>`.

## Failure handling

- If a commit fails (hook or error): fix the cause, re-stage, and make a NEW commit. Never amend a failed commit.
- If a hook rejects the commit: report the hook output and stop; ask how to proceed.
