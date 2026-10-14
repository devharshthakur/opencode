---
name: commit
description: Use when asked to commit changes or create a git commit; inspect changes, group Conventional Commits, and commit safely under the caller's approval policy.
metadata:
  opencode/autoinvoke: false
---

# Commit

Defines safe commit mechanics and message style; it grants no authority. The invoking command or
explicit user request defines authorization and whether commit-plan confirmation is required. Loading
or discussing this skill alone does not authorize staging or committing. Follow the caller's approval
policy and any commit-specific instructions (for example `api only`, `single commit`, `no split`,
`scope: api`, or `message: ...`).

## Hard rules (never break)

- Never run destructive git: `reset --hard`, `clean -fd`, `rebase`, `checkout .`, `restore` of
  unstaged work, or force push.
- Never commit secrets: `.env*`, credentials, tokens, keys, `*.pem`, `*.key`, `id_rsa*`, `.npmrc`,
  `.netrc`, service-account files.
- Never stage files unrelated to the described change.
- Amend, push, and PR creation are outside ordinary commit authorization; never perform them without
  separate explicit authorization, and honor any caller local-only restriction.
- Never invent a scope or a footer value; use only scopes and facts you can verify.
- Never write `BREAKING CHANGE` or `!` unless the change really is incompatible.
- Never bypass a hook, weaken checks, or disable validation to make a commit succeed; resolve task
  hook failures properly instead.
- If scope is unclear, secrets are present, or unrelated changes are staged, stop before mutation and
  use `question`. Skipping routine confirmation never bypasses safety checks or tool permissions.

## Inspect (read-only)

With shell permission, run `sh <this-skill-base>/../git-isolation/scripts/preflight.sh` in
the checkout; this invokes inspection only. Inspect full staged/unstaged diffs, untracked
contents, and recent commit history separately. Identify every modified, added, deleted,
renamed, and untracked change. If none exist, report "nothing to commit" and stop.

## Conventions and scopes

- Prefer a real top-level folder as scope (`web`, `api`, `shared`, `packages`, `agents`, `commands`);
  the meta scopes `deps`, `docs`, `config`, `ci`, `build` are allowed when no folder fits.
- Scope is a single verified noun in parentheses, `fix(parser):`, and is OPTIONAL: omit it rather than
  guess. Never put backticks in the scope. Match the repo's existing commit style when it has one.

## Format (Conventional Commits 1.0.0)

`<type>[optional scope][!]: <description>` followed by an optional blank-line-separated body and
footers.

- `type` is a required noun: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`, `revert`. Only `feat` and `fix` carry SemVer meaning.
- `description` is required: short, imperative, no trailing period, header about 72 characters.
- `body` begins one blank line after the description, explains what and why, and wraps near 72 chars.
- `footer(s)` begin one blank line after the body; tokens use `-` rather than spaces (`Acked-by`,
  `Reviewed-by`, `Refs`), except the uppercase `BREAKING CHANGE`.
- Mark a real incompatibility with `!` and/or a `BREAKING CHANGE:` footer. If a change fits more than
  one type, split it into multiple commits.

### Message style

- Write the description as a short imperative "what" (well under 72 chars) and move concrete detail —
  files, modules, identifiers, versions, configuration, rationale — into the body.
- Include a body by default when the change carries detail a reader would otherwise dig for; the body
  is optional for trivial, self-explanatory changes. Keep it to one or two short sentences unless the
  detail genuinely needs more.
- Write prose in lowercase, including acronyms (`mcp`, `cli`, `ui`, `api`), except the casing inside
  code spans. Wrap package names, paths, and library or tool names in backticks, preserving their real
  casing: `Nuxt`, `ImageKit`, `@prisma/orm-postgres`, `pnpm-workspace.yaml`.

Example:

```
fix(prisma): type-check `Prisma` config files

include `prisma.config.ts` in the `Nuxt` node tsconfig and `prisma/**/*.ts`
in the server tsconfig so typecheck covers them.
```

## Plan and commit

- Split changes into small, logically coherent commits: one concern per commit, unrelated areas
  separate, prerequisites first, and no knowingly broken commit. For each commit define `type`, an
  optional verified `scope`, a breaking flag, `description`, `body`, and only verifiable footers.
- Show the full plan: files per commit plus the exact header, body, and footers. Apply the caller's
  approval policy before staging or committing; this skill adds no routine confirmation gate of its
  own. If authorization or the approval policy is unclear, stop and request it.
- For each authorized commit, in order:
  1. Stage only its files explicitly: `git add -- <path> <path> ...` (deletions included).
   2. Verify staging with `git status --short`, statistics, and the **full staged diff**; confirm
      every staged path/hunk belongs to this commit and contains no secrets.
  3. If an unintended file or secret is staged, unstage it (`git restore --staged <path>`) and stop.
  4. Commit with one `-m` per paragraph: header first, then body, then footers. Never put `\n` inside
     a single `-m`. Examples:
     - `git commit -m "fix(api): reject expired tokens"`
     - `git commit -m "fix(api): reject expired tokens" -m "<body paragraph>"`
     - `git commit -m "feat(api)!: drop legacy auth" -m "BREAKING CHANGE: tokens are now required"`
  5. Verify the message with `git log -1 --format=%B`.

Never use `git add -A`, `git add .`, or `git commit -a`; stage each commit's files explicitly.

**Done when:** each authorized commit's hashes, full messages, and included files are verified;
report these with actual checks and remaining changes. Do not edit source or automatically publish.

## Dependencies

None. This skill defines commit mechanics and message style only and grants no authority.
