# Global Agent Instructions

- **Documentation fetch method priority**: Context7 mcp → library-specific MCP → web search as fallback.
- **Always load relevant skills before working.**
- Always use mcp over clis if available.
- **Before answering, fetch latest docs via available MCP tools when libraries/frameworks are mentioned.**
- Use `pnpm` as package manager for Javascript/Typescript projects unless project says otherwise.
- Use `uv` as package manager for python projects. Never use oldraw `pip`.
- Ask before guessing. Never invent files, APIs, packages, config keys, or docs.
- Local code is source of truth — if docs conflict, follow code.
- Prefer `glob`/`grep`/`read` over `ls`/`cat`/`find`.
- Use`tree` for file infos over `ls`. Use `ls` and other traditional search methods if `tree` is insufficient.
- If user requests a specific docs source, use that.
