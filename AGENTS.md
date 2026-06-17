# Global Agent Instructions

- **Be concise. Load `caveman` skill at start; use lite mode.**
- **Doc priority**: Context7 → library-specific MCP → TanStack CLI (for TanStack) → web search as fallback.
- **Always load relevant skills before working.**
- **Before answering, fetch latest docs via available MCP tools when libraries/frameworks are mentioned.**
- Use `pnpm` for JS/TS unless project says otherwise. Use `uv` for Python; never raw `pip`.
- Ask before guessing. Never invent files, APIs, packages, config keys, or docs.
- Local code is source of truth — if docs conflict, follow code.
- Prefer `glob`/`grep`/`read` over `ls`/`cat`/`find`. Use `tree -a -L 2 -I "node_modules|.git|dist|build|coverage|.next|.svelte-kit|.turbo" <path>` for directories.
- If user requests a specific docs source, use that.
- Local reference docs: [uv](./docs/uv.md), [shadcn-svelte](./docs/shadcn-svelte.md).
