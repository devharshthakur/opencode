---
description: Update single-file agent briefing
agent: edit
model: deepseek/deepseek-v4-pro
subtask: false
---

# Init Update

Update `AGENTS.md` created by `/init` without unnecessary reads or rewrites.

Arguments: `$ARGUMENTS`

## Goal

Keep `AGENTS.md` accurate, compact, and cheap for future agents. Refresh only durable project knowledge: project purpose, stack, important paths, source-of-truth files, task routing, architecture/boundaries, validation commands, invariants, gotchas, and open questions. Do not create a full code inventory.

Keep single-file setup. Update only `AGENTS.md`. Do not create `.agents/**`, backup folders, or supporting docs.

## Modes

| Mode              | Behavior                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| default / no args | Delta update. Refresh only `AGENTS.md` sections whose owning area drifted.                                          |
| `full`            | Re-scan major areas and refresh all major `AGENTS.md` sections.                                                     |
| `check`           | Read-only stale-doc report. No writes, backups, deletes, moves, formatting.                                         |
| `repair`          | Fix routing/structure issues: stale task routes, broken path refs, missing required sections, overly noisy wording. |

If mode is unclear, ask before proceeding.

## Required docs

Expected: `AGENTS.md` only.

If `AGENTS.md` is missing:

- default/`full`/`check`: tell user to run `/init`, unless existing docs are enough to reconstruct safely.
- `repair`: reconstruct `AGENTS.md` from existing durable docs if possible; otherwise tell user to run `/init`.

## Workflow

Follow in order.

### 1. Size repo

- Run `ls -a` first.
- Read `AGENTS.md` before source grep.
- Read legacy `.agents/**` docs only if needed to recover durable notes into `AGENTS.md`.
- Small/medium repo: targeted reads/globs only after `AGENTS.md` points to likely drift.
- Huge repo/monorepo: use focused `explore` subagents by changed app/package/domain only. No blanket repo agents.

### 2. Load project briefing first

Read, at minimum:

- `AGENTS.md`

Build concise map:

- current project summary
- stack and tools
- important paths and source-of-truth files
- task-routing sections
- boundaries/invariants/gotchas
- any unknowns or stale notes

Input-token rule: use `AGENTS.md` to decide where to look next. Do not broad-grep repo to rediscover facts it already owns.

### 3. Detect drift cheaply

Use cheap signals before content reads:

- `git status --porcelain`
- `git diff --name-only`
- `git diff --cached --name-only`
- `git log --name-only --oneline -20`
- manifests/workspace files, configs, root docs, entrypoints, and source/test tree shape

Look for drift in:

- package/workspace/crate/module structure
- dependencies, scripts, toolchain, package manager
- entrypoints/config/env
- routing/APIs/contracts/auth
- data models/storage/migrations/schemas
- frontend routing/state/components
- backend services/jobs/integrations
- test/build/deploy commands
- architecture boundaries/invariants/gotchas
- stale or broken path references in `AGENTS.md`

Only read source content for drift candidates. If signals are inconclusive, report uncertainty or ask before broadening.

### 4. Choose scope

- default: update only drifted `AGENTS.md` sections; leave stable sections untouched.
- `full`: refresh all major `AGENTS.md` sections from current repo evidence.
- `check`: report stale sections only; no edits/backups/creates/deletes/renames/formatting.
- `repair`: fix structure and routing; add missing required sections; simplify noisy wording.

Even for large repos, keep one `AGENTS.md`. Compress instead of splitting into extra docs.

### 5. Update compactly

Token conservation first:

- Keep `AGENTS.md` primary.
- Update only sections whose facts drifted.
- Preserve stable sections as-is when still correct.
- Use bullets/tables, exact paths, short commands.
- Do not create or depend on supporting docs.
- Remove stale paths only with clear evidence.
- If a fact is uncertain, mark `Unknown` or `Needs verification` instead of guessing.
- Keep wording simple and direct.

Always keep these sections accurate when relevant:

- Project summary
- Stack fingerprint
- Important paths
- Source-of-truth files
- Read first by task
- Architecture and boundaries
- Commands
- Search rules
- Risks/gotchas
- Unknowns/open questions

Most important maintenance target: `Read first by task`. Future agents should know what files to read before grep.

### 6. Security

- Never copy secret values into docs.
- Mention secret-bearing config by safe path/type only.
- Redact tokens, private URLs, credentials, certs, cookies, auth headers.
- Use concise pointers instead of proprietary long dumps.

### 7. Report

Return only:

- Mode used.
- Changed docs.
- Unchanged docs checked.
- Drift found.
- Whether docs stayed single-file.
- Broken links/path refs fixed.
- Subagents used, if any.
- Open questions / unresolved uncertainty.

## Rules

- Be terse and factual.
- Do not print full docs or large diffs in final summary; paths + short notes only.
- No markdown code fences in final summary unless explicitly showing file content.
- Do not commit changes.
