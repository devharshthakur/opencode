---
description: Initialize token-conserving agent docs
agent: edit
model: deepseek/deepseek-v4-pro
subtask: false
---

# Init

Create a token-conserving agent documentation system for this repository. This command overrides OpenCode's built-in `/init`.

## Goal

Make future agent sessions cheap and accurate by replacing large root context with navigable, agent-facing docs.

## Required output in target repo

- `AGENTS.md` — tiny router only; points agents to `.agents/docs/README.md` first.
- `.agents/architecture.md` — mandatory agent-facing architecture doc: boundaries, core flows, invariants, risks, gotchas.
- `.agents/docs/README.md` — root doc index: reading order, folder/file map, ownership table.
- `.agents/docs/**` — split project context into mutually exclusive markdown docs.
- Per-folder `README.md` files — only when a folder contains multiple docs; explain what each file contains and when to read it.

## Workflow

### 1. Size project with `ls -a`

Run `ls -a` first. Use the top-level shape to decide exploration depth.

- Small repo: inspect directly with targeted reads/globs.
- Huge repo or monorepo: use focused `explore` subagents. Split by obvious top-level apps/packages/domains. Do not dispatch vague blanket agents.

### 2. Explore project context

Gather only durable project knowledge:

- Manifests and package/workspace files.
- Existing docs and root markdown files.
- Config files and runtime entrypoints.
- Source tree shape and major modules.
- Tests and tooling commands.
- API routes, data models, frontend/backend boundaries, jobs, integrations where present.

Avoid token waste:

- Do not summarize every source file.
- Do not read generated/vendor/build outputs.
- Do not dump lockfile contents.
- Do not broad-grep before checking docs/indexes/tree shape.

Exclude by default:

- `.git/`, `node_modules/`, `vendor/`, `dist/`, `build/`, `.next/`, `.svelte-kit/`, `coverage/`, cache/temp folders.
- Generated code unless it defines public contracts not documented elsewhere.
- Secrets, credentials, API keys, tokens, private certs.

### 3. Choose smallest useful taxonomy

Split context into mutually exclusive docs. Prefer flat files until a topic becomes too large.

Default small-repo shape:

- `.agents/docs/product.md` — purpose, users, domain terms, user-visible flows.
- `.agents/docs/codebase.md` — repo layout, conventions, dependencies, ownership map.
- `.agents/docs/runtime.md` — entrypoints, config, env, local/dev/prod behavior.
- `.agents/docs/testing.md` — test strategy, stable commands, fixtures, test conventions.
- `.agents/docs/decisions.md` — accepted tradeoffs, constraints, open questions.

Use folders only when needed, for example:

- `.agents/docs/api/README.md`, `routes.md`, `contracts.md`, `auth.md`
- `.agents/docs/data/README.md`, `models.md`, `storage.md`, `migrations.md`
- `.agents/docs/frontend/README.md`, `components.md`, `routing.md`, `state.md`
- `.agents/docs/backend/README.md`, `services.md`, `jobs.md`, `integrations.md`
- `.agents/docs/operations/README.md`, `build.md`, `deploy.md`, `observability.md`
- `.agents/docs/decisions/README.md`, `accepted.md`, `open-questions.md`

Taxonomy rules:

- One stable fact has one owning file.
- Link instead of duplicate.
- If a fact fits two places, put it where future editing agent would first look.
- Create no empty placeholder sections.
- If uncertainty exists, mark it in decisions/open questions instead of guessing.

### 4. Backup before overwrite

Before replacing any existing target file or folder content, back it up under:

`.agents/backups/init-YYYYMMDD-HHMMSS/<relative-path>`

Targets include:

- `AGENTS.md`
- `.agents/architecture.md`
- `.agents/docs/**`

Rules:

- Never silently discard user-authored instructions.
- Migrate unique existing project instructions into the new owning doc.
- If existing instructions conflict with inferred behavior, preserve them and record conflict in `decisions.md` or `decisions/open-questions.md`.
- Do not back up generated/vendor/cache output.

### 5. Write compact docs

Optimize for future agent input-token savings:

- Use bullets, tables, and exact paths.
- Prefer stable patterns, boundaries, invariants, commands, gotchas.
- Avoid narrative filler and obvious restatements of filenames.
- Keep root `AGENTS.md` tiny.
- Keep each docs `README.md` as navigation only.
- Make docs useful for selective reading: agents should know which file to fetch without grepping.

Root `AGENTS.md` should be similar to:

```md
# Agent Instructions

Start here: `.agents/docs/README.md`.

Use `.agents/architecture.md` for architecture, boundaries, flows, and invariants.

Before editing:
- Read only relevant docs under `.agents/docs/`.
- Prefer existing project conventions.
- Avoid broad grep until docs are insufficient.
- Update owning doc when project knowledge changes.
```

`.agents/docs/README.md` must include:

- Reading order.
- Folder/file map.
- “Read this when…” guidance for every child file/folder.
- Maintenance rules: one fact, one owner; link instead of duplicate; update docs with architectural/convention changes.

`.agents/architecture.md` must include:

- System purpose.
- Major components/modules.
- Runtime/data/control flows.
- Boundaries and ownership.
- Invariants and constraints.
- High-risk areas and gotchas.
- Open questions if inference is uncertain.

### 6. Security

- Never copy secret values into docs.
- If secret-bearing config exists, mention only safe path/type, never value.
- Redact tokens, private URLs, credentials, certificates, cookies, and auth headers.
- Do not include proprietary long dumps when concise pointers suffice.

### 7. Finish report

Return concise summary:

- Created files.
- Overwritten files.
- Backup directory.
- Taxonomy chosen.
- Subagents used, if any.
- Uncertainties/open questions.

## Output rules

- Be terse and factual.
- No markdown code fences in final summary unless showing file content explicitly.
- Do not commit changes.
- Always add : - If want to fetch any docs from web if not found in `.agents/docs` or anything else use contex 7 mcp unless a specefic mcp is stated in `AGENTS.md`