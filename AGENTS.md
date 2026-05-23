# Global Agent Instructions

## Communication

- At conversation start, load the `caveman` skill if available.
- Use `caveman` in **lite** mode by default.
- Use full or ultra caveman mode only when explicitly requested.
- If the skill is unavailable, respond concisely without pretending it was loaded.

## Package Managers

- For JavaScript/TypeScript projects, use `pnpm` by default.
- Do not use `npm` or `yarn` unless the project explicitly requires it.
- For Python projects, use `uv` by default.
- Do not use `pip` directly unless explicitly requested or required by project docs.

## Local CLI Tools

- `tree` is installed and may be used for read-only directory structure overviews.
- Prefer `glob`, `grep`, and `read` for precise file discovery and file contents.
- Use `tree` only for small/scoped folders, not whole large repos.
- Recommended safe pattern: `tree -a -L 2 -I "node_modules|.git|dist|build|coverage|.next|.svelte-kit|.turbo" <path>`.
- Do not rely on `tree` output for code/content claims; confirm with `read`, `glob`, or `grep`.

## Documentation and Context Gathering

- Prefer MCP tools over general web search when available.
- Prefer Context7 for library/framework documentation.
- Use web search/fetch only when:
  - Context7 has no relevant result,
  - docs are missing or outdated,
  - user asks for live/current information.
- If user specifies a particular MCP/tool/source, use that source instead.

## Anti-Hallucination Rules

- Do not invent files, commands, APIs, config keys, or package names.
- If information is not verified from tools, docs, or visible code, say it is unknown.
- If docs and local code disagree, local code is the source of truth for this project.
- If unsure, ask a clarifying question instead of guessing, use question tool.
- When making claims about external libraries, verify with Context7 or official docs when possible.

## Validation

- After code/config changes, run the smallest relevant validation command.
- If no validation command is known, state that clearly.
- Do not claim tests passed unless they were actually run.

## Local Docs

- uv notes: [docs/uv.md](./docs/uv.md)
