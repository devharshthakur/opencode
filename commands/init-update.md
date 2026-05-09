---
description: Update token-conserving agent docs
agent: edit
model: deepseek/deepseek-v4-pro
subtask: false
---

# Init Update

Update the token-conserving agent docs created by `/init` so they match the latest project state without unnecessary rewrites.

Arguments: `$ARGUMENTS`

## Modes

- Default / no args: delta update. Update only docs whose owning project area changed.
- `full`: broad re-scan. Refresh all stale agent docs after major refactors or large project changes.
- `check`: read-only stale-doc report. Do not create, edit, delete, move, or back up files.
- `repair`: fix doc system structure: missing indexes, broken links, missing per-folder READMEs, taxonomy drift. Avoid broad content rewrite.

If mode is unclear, ask the user before proceeding.

## Goal

Keep `.agents/` docs accurate, compact, and cheap for future agents to read.

Update durable project knowledge only:

- architecture and boundaries
- source layout and ownership
- runtime/config/tooling
- APIs/data/frontend/backend/testing/ops docs where present
- conventions, invariants, gotchas, open questions

Do not turn update into full code inventory.

## Required existing docs

Expected files:

- `AGENTS.md`
- `.agents/architecture.md`
- `.agents/docs/README.md`

If `.agents/docs/README.md` is missing:

- In default, `full`, or `check` mode: tell user to run `/init` first, unless enough `.agents/docs/**` structure exists to continue safely.
- In `repair` mode: reconstruct indexes from existing `.agents/docs/**` if possible; otherwise tell user to run `/init`.

## Workflow

### 1. Size project with `ls -a`

Run `ls -a` first. Use top-level shape to decide exploration depth.

- Small repo: inspect directly with targeted reads/globs.
- Huge repo or monorepo: use focused `explore` subagents by changed area/module/package.
- Never dispatch vague blanket subagents.

### 2. Load current agent-doc map

Read navigation docs first:

- `AGENTS.md`
- `.agents/architecture.md`
- `.agents/docs/README.md`
- `.agents/docs/**/README.md`

Build a concise docs map:

- each docs file/folder purpose
- owning doc per domain/topic
- reading order
- open questions / uncertainty sections
- current taxonomy shape

Prefer docs map before grep. Broad grep only when docs are insufficient.

### 3. Detect project drift cheaply

Use cheap signals before reading many files:

- `git status --porcelain`
- `git diff --name-only`
- `git diff --cached --name-only`
- `git log --name-only --oneline -20`
- manifests/package/workspace files
- config files
- root docs
- source tree shape
- test tree shape

Detect drift types:

- new/removed/renamed apps, packages, modules, directories
- changed package manager, scripts, dependencies, workspace config
- changed entrypoints, runtime config, env variables
- changed test commands, fixtures, test strategy
- new/removed APIs, routes, contracts, auth behavior
- changed data models, migrations, storage, schemas
- changed frontend routing, state, component conventions
- changed backend services, jobs, integrations
- stale architecture flows, boundaries, invariants, gotchas
- stale path references in docs
- broken links in `.agents/docs/README.md` or per-folder READMEs

### 4. Choose update scope

Default delta mode:

- Update only docs whose owning area changed.
- Leave unrelated docs untouched.
- If many top-level areas changed or docs map is unreliable, recommend `/init-update full` before broad rewrite.

`full` mode:

- Re-scan all major areas.
- Refresh stale docs across `.agents/architecture.md` and `.agents/docs/**`.
- Keep existing taxonomy unless clear evidence supports split/merge.

`check` mode:

- Read only.
- Produce stale-doc report.
- No edits, backups, file creation, deletes, renames, or formatting.

`repair` mode:

- Fix docs navigation and structure.
- Create missing `README.md` files for folders with multiple docs.
- Repair broken links and stale map entries.
- Split/merge docs only when taxonomy clearly blocks selective reading.
- Avoid broad content refresh unless required to repair navigation.

### 5. Backup before overwrite

Skip this section in `check` mode because no writes are allowed.

Before replacing any existing target file, back it up under:

`.agents/backups/init-update-YYYYMMDD-HHMMSS/<relative-path>`

Targets include any changed file under:

- `AGENTS.md`
- `.agents/architecture.md`
- `.agents/docs/**`

Rules:

- Back up only files you will overwrite.
- Do not back up generated/vendor/cache output.
- Never silently discard user-authored instructions.
- Preserve and migrate unique manual notes.
- If existing docs conflict with current code, update only when evidence is clear.
- If uncertain, preserve old note and record uncertainty in `decisions.md` or `decisions/open-questions.md`.

### 6. Update docs compactly

Keep token conservation first:

- Use bullets, tables, exact paths, and short commands.
- Prefer stable patterns, boundaries, invariants, and gotchas.
- Do not summarize every source file.
- Do not duplicate facts; update owning doc and link from indexes.
- Keep root `AGENTS.md` tiny.
- Keep README files navigation-only.
- Update indexes when files move/split/merge.
- Remove stale path refs only with clear evidence.
- Optional: update a `Last reviewed:` line only in docs you touched; do not add churn if project docs do not use this convention.

Maintain taxonomy:

- One stable fact has one owning file.
- If a fact fits two docs, place it where future editing agent would first look.
- Create folders only when a topic has multiple independent docs or one doc becomes too dense.
- Avoid empty placeholder sections.

### 7. Security

- Never copy secret values into docs.
- If secret-bearing config exists, mention only safe path/type, never value.
- Redact tokens, private URLs, credentials, certificates, cookies, and auth headers.
- Do not include proprietary long dumps when concise pointers suffice.

### 8. Final report

Return concise summary:

- Mode used.
- Changed docs.
- Unchanged docs that were checked.
- Backup directory, if any.
- Drift found.
- Taxonomy changes.
- Broken links/path refs fixed.
- Subagents used, if any.
- Open questions / unresolved uncertainty.

## Output rules

- Be terse and factual.
- No markdown code fences in final summary unless showing file content explicitly.
- Do not commit changes.
