---
description: Initialize single-file agent briefing
agent: edit
model: deepseek/deepseek-v4-pro
subtask: false
---

# Init

Create simple, high-signal `AGENTS.md` for this repo. This command overrides OpenCode built-in `/init`.

## Goal

Make future agent sessions cheap and accurate with one durable project briefing that tells agents what this repo does, which files are source of truth, which files to read first for common tasks, how to validate changes, and which paths to ignore.

Always output one `AGENTS.md`. Do not create `.agents/**`, backup folders, or supporting docs.

## Required outputs

- `AGENTS.md` — required; only output file; primary project briefing and routing doc.

## Workflow

Follow in order.

### 1. Map repo cheaply

- Run `ls -a` first.
- If `AGENTS.md` already exists, read it before anything else.
- If legacy `.agents/**` docs exist, read only what is needed to migrate durable notes into `AGENTS.md`.
- Start from manifests, workspace files, root docs, config, runtime entrypoints, and major source roots.
- Small/medium repo: use targeted reads/globs only.
- Huge repo/monorepo: use focused `explore` subagents only after manifests/tree shape identify app/package/domain. No blanket repo-wide agents.

### 2. Gather durable project context

Capture only stable facts future agents need often:

- Project purpose, users, domain terms, user-visible flows.
- Detected ecosystem and stack from repo files.
- Repo layout and important folders.
- Source-of-truth files: manifests, workspace config, runtime/bootstrap files, routing files, schemas/contracts, migrations, test config, deployment/build config.
- Architecture boundaries, invariants, risky areas, gotchas.
- Common task routes: which files to read first for API/backend/frontend/data/auth/tests/build/tooling work.
- Validation commands for install, lint, typecheck, tests, run/dev.

Avoid token waste:

- Do not summarize every source file.
- Do not dump lockfiles.
- Do not read generated/vendor/build output.
- Do not broad-grep repo before manifests/config/docs identify target areas.
- Every grep/read must have a target path and reason.

Exclude: `.git/`, `node_modules/`, `vendor/`, `dist/`, `build/`, `.next/`, `.svelte-kit/`, `coverage/`, caches/temp folders, secrets, credentials, tokens, private certs. Include generated code only if it defines public contracts not documented elsewhere.

### 3. Detect stack and include only relevant guidance

Use repo evidence, not generic guesses.

Check only relevant files for detected ecosystem:

- Node.js / webdev: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, framework config (`next.config.*`, `vite.config.*`, `svelte.config.*`, etc.), app/router entrypoints, API/schema files, test config.
- Python: `pyproject.toml`, `uv.lock`, lint/test config, package/app entrypoints, migrations/schema files.
- Go: `go.mod`, `go.work`, `cmd/*`, `internal/*`, `pkg/*`, router/bootstrap/config files.
- Rust: `Cargo.toml`, workspace `Cargo.toml`, `src/main.rs`, `src/lib.rs`, `crates/*`, integration tests, build/config files.

Include only stacks and commands actually verified from files.

### 4. Write compact `AGENTS.md`

Optimize for future input-token savings.

Hard rules:

- Target `AGENTS.md` at 120-220 lines when practical.
- Every section must help routing, validation, or constraints.
- Use bullets/tables, exact paths, short commands.
- Do not duplicate facts.
- Cite exact source paths for non-obvious claims.
- If a fact is not verified, mark it `Unknown` or `Needs verification`.
- Keep wording simple and direct.

Required `AGENTS.md` sections:

- Project summary — what repo does, product/domain terms, runtime shape.
- Stack fingerprint — languages, frameworks, package/build tools, test tools.
- Important paths — only key folders/files and why they matter.
- Source-of-truth files — manifests, config, entrypoints, routes, schemas/contracts, migrations, test/build/deploy files.
- Read first by task — exact files/folders to read first for common tasks such as feature work, bug fix, API/backend change, DB/data change, auth, frontend/UI, tests, build/deploy/tooling.
- Architecture and boundaries — major components, ownership, invariants, high-risk areas.
- Commands — install, dev/run, lint, typecheck, test, build, package-specific commands when relevant.
- Search rules — read `AGENTS.md` first, then targeted files; avoid broad grep/tree/subagents unless `AGENTS.md` is stale or insufficient.
- Risks/gotchas — fragile areas, hidden coupling, migration concerns.
- Unknowns/open questions — only if verified facts are missing.

Most important section: `Read first by task`. It should tell future agents exactly which files to open before grep.

Even for large repos, keep one file. Compress aggressively instead of splitting into extra docs.

### 5. Security

- Never copy secret values into docs.
- Mention secret-bearing config by safe path/type only.
- Redact tokens, private URLs, credentials, certs, cookies, auth headers.
- Use concise pointers instead of proprietary long dumps.

### 6. Validate docs

- Confirm `AGENTS.md` exists and is only output file.
- Confirm it routes common tasks to exact source paths.
- Confirm it includes only verified, high-value facts.
- Confirm no new `.agents/**` docs or backup folders were created.
- Confirm no duplicated facts or copied secrets.
- Confirm referenced paths exist where practical.

### 7. Report

Return only:

- Created files.
- Overwritten files.
- Whether output stayed single-file.
- Validation run.
- Subagents used, if any.
- Uncertainties/open questions.

## Rules

- Be terse and factual.
- Do not print full generated docs in final summary; paths + short notes only.
- No markdown code fences in final summary unless explicitly showing file content.
- Do not commit changes.
