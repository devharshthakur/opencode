---
description: Update token-conserving agent docs
agent: edit
model: deepseek/deepseek-v4-pro
subtask: false
---

# Init Update

Update token-conserving agent docs created by `/init` without unnecessary reads or rewrites.

Arguments: `$ARGUMENTS`

## Goal

Keep `.agents/` docs accurate, compact, and cheap for future agents. Update durable project knowledge only: architecture, boundaries, layout, ownership, runtime/config/tooling, APIs/data/frontend/backend/testing/ops, conventions, invariants, gotchas, open questions. Do not create a full code inventory.

## Modes

| Mode | Behavior |
|---|---|
| default / no args | Delta update. Change only docs whose owning area drifted. |
| `full` | Re-scan major areas and refresh stale docs after large changes. |
| `check` | Read-only stale-doc report. No writes, backups, deletes, moves, formatting. |
| `repair` | Fix doc structure/navigation: missing indexes, broken links, missing folder READMEs, taxonomy drift. Avoid broad content rewrite. |

If mode is unclear, ask before proceeding.

## Required docs

Expected: `AGENTS.md`, `.agents/architecture.md`, `.agents/docs/README.md`.

If `.agents/docs/README.md` is missing:

- default/`full`/`check`: tell user to run `/init`, unless existing `.agents/docs/**` is enough to continue safely.
- `repair`: reconstruct indexes from existing `.agents/docs/**` if possible; otherwise tell user to run `/init`.

## Workflow

Follow in order.

### 1. Size repo

- Run `ls -a` first.
- Small repo: targeted reads/globs.
- Huge repo/monorepo: focused `explore` subagents by changed area/module/package. No blanket agents.

### 2. Load docs map first

Read navigation docs before source grep:

- `AGENTS.md`
- `.agents/architecture.md`
- `.agents/docs/README.md`
- `.agents/docs/**/README.md`

Build a concise map: file/folder purpose, owning doc per topic, reading order, open questions, taxonomy shape.

Input-token rule: read only docs needed to map ownership. Broad grep or broad doc reads only when map is missing/stale.

### 3. Detect drift cheaply

Use cheap signals before content reads:

- `git status --porcelain`
- `git diff --name-only`
- `git diff --cached --name-only`
- `git log --name-only --oneline -20`
- manifests/workspace/package files, configs, root docs, source/test tree shape

Detect drift in: apps/packages/modules, package manager/scripts/deps/workspaces, entrypoints/config/env, tests/fixtures, APIs/routes/contracts/auth, data models/migrations/storage/schemas, frontend routing/state/components, backend services/jobs/integrations, architecture flows/boundaries/invariants/gotchas, stale paths, broken README links.

### 4. Choose scope

- default: update only owning docs for changed areas; leave unrelated docs untouched.
- `full`: re-scan major areas; refresh stale `.agents/architecture.md` and `.agents/docs/**`; keep taxonomy unless evidence supports split/merge.
- `check`: read only; report stale docs; no edits/backups/creates/deletes/renames/formatting.
- `repair`: fix navigation/structure; create folder `README.md` only when folder has multiple docs; repair links/map entries; split/merge only when taxonomy blocks selective reading; avoid content refresh unless needed for repair.
- If many top-level areas changed or docs map is unreliable in default mode, recommend `/init-update full` before broad rewrite.

### 5. Back up changed files

Skip in `check` mode.

Before overwriting target files, back them up under:

`.agents/backups/init-update-YYYYMMDD-HHMMSS/<relative-path>`

Targets: changed files under `AGENTS.md`, `.agents/architecture.md`, `.agents/docs/**`.

Backup rules:

- Back up only files you will overwrite.
- Use filesystem copy/move commands (`mkdir -p`, `cp`, `cp -R`, `mv`, or `rsync` if available).
- Do not recreate backups by reading file content and writing it again; this wastes tokens and may alter bytes.
- Preserve relative paths under backup root.
- Do not back up generated/vendor/cache output.
- Preserve/migrate unique manual notes.
- If docs conflict with code, update only with clear evidence. If uncertain, preserve old note and record uncertainty in `decisions.md` or `decisions/open-questions.md`.

### 6. Update compactly

Token conservation first:

- Use bullets/tables, exact paths, short commands.
- Prefer stable patterns, boundaries, invariants, gotchas.
- Do not summarize every source file.
- Do not duplicate facts; update owning doc and link from indexes.
- Keep root `AGENTS.md` tiny; keep README files navigation-only.
- Update indexes when files move/split/merge.
- Remove stale paths only with clear evidence.
- Update `Last reviewed:` only in touched docs if project already uses that convention.

Maintain taxonomy:

- One stable fact, one owning file.
- Put facts where future editing agent will look first.
- Create folders only for multiple independent docs or over-dense docs.
- No empty placeholder sections.

### 7. Security

- Never copy secret values into docs.
- Mention secret-bearing config by safe path/type only.
- Redact tokens, private URLs, credentials, certs, cookies, auth headers.
- Use concise pointers instead of proprietary long dumps.

### 8. Report

Return only:

- Mode used.
- Changed docs.
- Unchanged docs checked.
- Backup directory, if any.
- Drift found.
- Taxonomy changes.
- Broken links/path refs fixed.
- Subagents used, if any.
- Open questions / unresolved uncertainty.

## Rules

- Be terse and factual.
- Do not print full docs or large diffs in final summary; paths + short notes only.
- No markdown code fences in final summary unless explicitly showing file content.
- Do not commit changes.
