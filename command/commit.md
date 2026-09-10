---
description: Stage logically grouped changes and create approved Conventional Commits
agent: build
---

# Commit

This command is the user's explicit request to create git commits. Still confirm the plan before committing.

Input/instructions: `$ARGUMENTS`
(Examples: `api only`, `single commit`, `no split`, `scope: api`, `message: ...`. If present, follow them.)

## Step 0 — Hard rules (never break)

- NEVER run destructive git: `reset --hard`, `clean -fd`, `rebase`, `checkout .`, `restore` of unstaged work, or force push.
- NEVER commit secrets: `.env*`, credentials, tokens, keys, `*.pem`, `*.key`, `id_rsa*`, `.npmrc`, `.netrc`, service-account files.
- NEVER stage files unrelated to the described change.
- NEVER amend, push, or create a PR unless the user explicitly approves that step (push is offered in Step 7).
- NEVER invent a scope or a footer value. Use only scopes and facts you can verify.
- NEVER write `BREAKING CHANGE` or `!` unless the change really is incompatible.
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
- A scope MUST be a single noun describing a section of the codebase, inside parentheses, e.g. `fix(parser):`.
- Match the repo's existing commit style when it has one.
- Scope is OPTIONAL: if it is unclear, omit it. Never guess.

## Step 3 — Conventional Commits 1.0.0 format

Every commit message MUST follow this structure:

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

Required element rules:

- `type` is REQUIRED and is a noun (`feat`, `fix`, ...), immediately followed by an OPTIONAL scope, OPTIONAL `!`, then a REQUIRED colon + space, then the description.
- `description` is REQUIRED, is a short summary, uses imperative mood, has no trailing period, and the whole header line SHOULD stay within 72 characters.

Optional element rules:

- `scope`: a noun in parentheses, e.g. `feat(parser):`.
- `!`: place immediately before `:` to flag a breaking change, e.g. `feat(api)!: ...`.
- `body`: MAY be added, MUST begin one blank line after the description; free-form, any number of paragraphs; explain what and why; wrap near 72 chars.
- `footer(s)`: MAY be added, MUST begin one blank line after the body. Each footer is a token, then either `: ` or ` #`, then a value, e.g. `Refs: #123`, `Reviewed-by: Z`, `Acked-by: Q`.
  - Footer tokens use `-` instead of spaces (`Acked-by`, `Reviewed-by`, `Refs`). The only exception is `BREAKING CHANGE`.
  - A footer value MAY contain spaces and newlines.

Breaking changes (MUST be marked when compatibility breaks):

- Either append `!` in the type/scope prefix, or add a footer `BREAKING CHANGE: <description>`.
- `BREAKING CHANGE` MUST be uppercase. `BREAKING-CHANGE` is an equivalent token.
- If `!` is used, the `BREAKING CHANGE:` footer MAY be omitted; the description then describes the break.
- A breaking change can belong to a commit of any type.

Types (the spec only assigns meaning to `feat` and `fix`; others are allowed):

| type       | use                                   | SemVer effect        |
| ---------- | ------------------------------------- | -------------------- |
| `feat`     | a new feature                         | MINOR                |
| `fix`      | a bug fix                             | PATCH                |
| `docs`     | documentation only                    | none                 |
| `style`    | formatting/whitespace, no logic       | none                 |
| `refactor` | code change that is neither feat/fix  | none                 |
| `perf`     | performance improvement               | none                 |
| `test`     | tests                                 | none                 |
| `build`    | build system or dependencies          | none                 |
| `ci`       | CI configuration                      | none                 |
| `chore`    | other maintenance                     | none                 |
| `revert`   | revert a previous commit              | none                 |

- Casing is not significant to tools, EXCEPT `BREAKING CHANGE`, which MUST be uppercase.
- For a revert, prefer the `revert` type and reference the reverted commits in a footer, e.g.:

  ```
  revert: remove experimental caching

  Refs: 676104e, a215868
  ```

- If a change fits more than one type, split it into multiple commits.

## Step 4 — Plan small commits

- Split changes into small, logically coherent commits: one concern per commit.
- Do not mix unrelated areas.
- Order commits so earlier ones are prerequisites (deps/config before code).
- For each commit define:
  - `type` (required)
  - `scope` (optional; must be real, else omit)
  - breaking? (`!` prefix and/or `BREAKING CHANGE:` footer)
  - `description` (required; imperative; no trailing period; header ≤ ~72 chars)
  - optional `body` (what and why; wrap ~72 chars)
  - optional `footer(s)` (only verifiable values, e.g. `Refs: #123`, `Reviewed-by: Z`)

## Step 5 — Present plan and get approval

- Show the full plan: files per commit, plus the exact header, body, and footers.
- Ask for approval with the `question` tool.
- Do NOT commit anything before approval.

## Step 6 — Commit

For each approved commit, in order:

1. Stage only that commit's files explicitly:
   `git add -- <path> <path> ...`
   For deletions use `git add -- <path>` (git records the removal).
2. Verify staging: `git status --short` and `git diff --cached --stat`.
3. If an unintended file or secret is staged, unstage it (`git restore --staged <path>`) and stop.
4. Commit with one `-m` per paragraph. The first `-m` is the header; each later `-m` becomes a new paragraph (body first, then footers). Never put `\n` inside a single `-m`.

   Header only:
   `git commit -m "<type>(<scope>): <description>"`
   With body:
   `git commit -m "<type>(<scope>): <description>" -m "<body paragraph>"`
   With footer:
   `git commit -m "<type>(<scope>): <description>" -m "<body>" -m "Refs: #123"`
   Breaking change:
   `git commit -m "feat(api)!: drop legacy auth" -m "BREAKING CHANGE: tokens are now required"`

5. Verify the full message is correct: `git log -1 --format=%B`.

Never use `git add -A`, `git add .`, or `git commit -a` unless the user explicitly approved committing every listed file.

## Step 7 — Report and offer push

- Show `git status --short` and `git log --oneline -<n>` for the new commits.
- Ask with `question` whether to push. Do NOT push without approval.
- If approved: `git push` (never `--force`). If there is no upstream: `git push -u origin <branch>`.

## Failure handling

- If a commit fails (hook or error): fix the cause, re-stage, and make a NEW commit. Never amend a failed commit.
- If a hook rejects the commit: report the hook output and stop; ask how to proceed.
