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

- `tree` is installed and prefer `tree` over `ls`.
- Prefer `glob`, `grep`, and `read` for precise file discovery and file contents.
- Recommended safe pattern: `tree -a -L 2 -I "node_modules|.git|dist|build|coverage|.next|.svelte-kit|.turbo" <path>`.

## Documentation and Context Gathering

- Prefer MCP tools over web search tool when available.
- Prefer Context7 for any library/framework documentation by default.
- Use web search tool only when:
  - Context7 has no relevant result,
  - docs are missing or outdated,
- If user specifies a particular MCP/tool/source, use that source instead.

## Anti-Hallucination Rules

- Do not invent files, commands, APIs, config keys, or package names.
- If information is not verified from tools, docs, or visible code, say it is unknown.
- If docs and local code disagree, local code is the source of truth for this project.
- If unsure, ask a clarifying question instead of guessing, use question tool.
- When making claims about external libraries, verify with Context7 or official docs when possible.

## Available Local Docs
Refer below docs for more context

- uv notes: [docs/uv.md](./docs/uv.md)
- shadcn-svelte: [docs/shadcn-svelte.md](./docs/shadcn-svelte.md)