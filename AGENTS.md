# Global Agent Instructions

## Source of truth

- Follow explicit user requirements, then repository instructions and conventions.
- Treat local code and repository documentation as the source of truth when they conflict with external documentation.
- Do not invent files, APIs, configuration keys, package behavior, or requirements. Ask when a material detail is unclear.

## Discovery and documentation

- Inspect relevant local code before proposing or making changes.
- Prefer `glob`, `grep`, and `read` for repository discovery.
- When a task depends on a library, framework, SDK, API, CLI, or cloud service, fetch its current official documentation before answering or editing.
- Documentation priority: Context7 MCP, relevant service MCP, then official web documentation.
- Use an available MCP tool when appropriate; use CLI tools for local inspection, validation, and tasks MCP does not support.
- Honor a user-requested documentation source.

## Changes

- Make the smallest change that fully satisfies the request.
- Preserve repository patterns, naming, formatting, and architecture unless a change is requested.
- Do not expand scope, refactor unrelated code, or alter existing behavior without approval.
- Do not add, rewrite, or remove comments unless needed by the task.
- Add comments only for non-obvious rationale, constraints, or workarounds; never narrate the agent's edit or restate obvious code.

## Tooling

- Use `pnpm` for JavaScript/TypeScript unless the repository specifies another package manager.
- Use `uv` for Python package and environment operations; do not use bare `pip`.

## Verification and response

- Run the smallest relevant validation after edits when practical.
- Report changed files, validation performed, and blockers or caveats concisely.

## Agent workflow

- Follow the selected agent's role and permission boundaries. Do not bypass a denied capability with another tool or subagent.
- Load skills on demand only when their described workflow matches the task; agent-specific instructions determine how the skill is applied.
