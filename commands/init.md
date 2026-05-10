---
description: Initialize token-conserving agent docs
agent: edit
model: deepseek/deepseek-v4-pro
subtask: false
---

# Init

Create token-conserving agent docs for this repo. This command overrides OpenCode built-in `/init`.

## Goal

Make future agent sessions cheap and accurate with small, navigable, agent-facing docs instead of large root context.

## Required outputs

- `AGENTS.md` — tiny router; points to `.agents/docs/README.md` first.
- `.agents/architecture.md` — boundaries, core flows, invariants, risks, gotchas.
- `.agents/docs/README.md` — reading order, file/folder map, ownership table.
- `.agents/docs/**` — mutually exclusive project context docs.
- Per-folder `README.md` — only when folder has multiple docs; explains each file and when to read it.

## Workflow

Follow in order.

### 1. Size repo

- Run `ls -a` first.
- Small repo: use targeted reads/globs.
- Huge repo/monorepo: use focused `explore` subagents by app/package/domain. No vague blanket agents.

### 2. Explore durable context

Gather stable project knowledge only:

- Manifests, package/workspace files, configs, runtime entrypoints.
- Existing docs/root markdown.
- Source tree shape, major modules, boundaries.
- Tests/tooling commands.
- APIs, data models, frontend/backend areas, jobs, integrations where present.

Avoid token waste:

- Do not summarize every source file.
- Do not dump lockfiles.
- Do not read generated/vendor/build output.
- Check docs/indexes/tree shape before broad grep.

Exclude: `.git/`, `node_modules/`, `vendor/`, `dist/`, `build/`, `.next/`, `.svelte-kit/`, `coverage/`, caches/temp folders, secrets, credentials, tokens, private certs. Generated code only if it defines public contracts not documented elsewhere. You can refer project's 
`.gitignore` files

### 3. Choose taxonomy

Use smallest useful split. Prefer flat files until a topic becomes dense.

Default small-repo docs:

- `.agents/docs/product.md` — purpose, users, domain terms, user-visible flows.
- `.agents/docs/codebase.md` — layout, conventions, dependencies, ownership map.
- `.agents/docs/runtime.md` — entrypoints, config/env, local/dev/prod behavior.
- `.agents/docs/testing.md` — test strategy, commands, fixtures, conventions.
- `.agents/docs/decisions.md` — accepted tradeoffs, constraints, open questions.

Use folders only when useful, e.g.:

- `.agents/docs/api/{README.md,routes.md,contracts.md,auth.md}`
- `.agents/docs/data/{README.md,models.md,storage.md,migrations.md}`
- `.agents/docs/frontend/{README.md,components.md,routing.md,state.md}`
- `.agents/docs/backend/{README.md,services.md,jobs.md,integrations.md}`
- `.agents/docs/operations/{README.md,build.md,deploy.md,observability.md}`
- `.agents/docs/decisions/{README.md,accepted.md,open-questions.md}`

Taxonomy rules:

- One stable fact, one owning file.
- Link instead of duplicate.
- Put facts where future editing agent will look first.
- No empty placeholder sections.
- Mark uncertainty in decisions/open questions; do not guess.

### 4. Back up before overwrite

Before replacing existing target files/folders, back them up under:

`.agents/backups/init-YYYYMMDD-HHMMSS/<relative-path>`

Targets: `AGENTS.md`, `.agents/architecture.md`, `.agents/docs/**`.

Backup rules:

- Use filesystem copy/move commands (`mkdir -p`, `cp`, `cp -R`, `mv`, or `rsync` if available).
- Do not recreate backups by reading file content and writing it again; this wastes tokens and may alter bytes.
- Preserve relative paths under backup root.
- Back up only user-authored target content, not generated/vendor/cache output.
- Never silently discard user instructions. Migrate unique notes into owning docs.
- If old instructions conflict with inferred behavior, preserve them and record conflict in `decisions.md` or `decisions/open-questions.md`.

### 5. Write compact docs

Optimize for future input-token savings:

- Bullets/tables, exact paths, short commands.
- Stable patterns, boundaries, invariants, gotchas.
- Root `AGENTS.md` stays tiny.
- README files are navigation only.
- Docs should guide selective reading without broad grep.

Root `AGENTS.md` content should be this small shape:

- Start here: `.agents/docs/README.md`.
- Use `.agents/architecture.md` for architecture, boundaries, flows, invariants.
- Before editing: read only relevant docs, follow project conventions, avoid broad grep until docs are insufficient, update owning doc when project knowledge changes.
- External docs: use Context7 unless `AGENTS.md` or user names a specific MCP/tool.

`.agents/docs/README.md` must include reading order, file/folder map, “read this when…” guidance, and maintenance rules.

`.agents/architecture.md` must include system purpose, major components, runtime/data/control flows, boundaries/ownership, invariants/constraints, high-risk areas/gotchas, and open questions.

### 6. Security

- Never copy secret values into docs.
- Mention secret-bearing config by safe path/type only.
- Redact tokens, private URLs, credentials, certs, cookies, auth headers.
- Use concise pointers instead of proprietary long dumps.

### 7. Report

Return only:

- Created files.
- Overwritten files.
- Backup directory.
- Taxonomy chosen.
- Subagents used, if any.
- Uncertainties/open questions.

## Rules

- Be terse and factual.
- Do not print full generated docs in final summary; paths + short notes only.
- No markdown code fences in final summary unless explicitly showing file content.
- Do not commit changes.
