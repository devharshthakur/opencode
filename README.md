# OpenCode Config

Personal [OpenCode](https://opencode.ai) configuration — custom agents, commands, skills, and project-wide rules for AI-assisted development.

## Structure

| Path                   | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `agents/`              | Custom AI agents with model, permissions, and instructions                     |
| `commands/`            | Slash commands (`/commit`, `/review`, `/init`) that invoke agents + skills     |
| `skills/`              | Installed skill packs for specialized workflows (caveman, tdd, graphify, etc.) |
| `AGENTS.md`            | Global rules enforced across all agents                                        |
| `opencode.json`        | Active config: model, default agent, MCP server connections                    |
| `opencode.sample.json` | Shareable template with `$VAR` placeholders                                    |
| `package.json`         | Single dependency: `@opencode-ai/plugin`                                       |

## Setup

1. Copy `opencode.sample.json` → `opencode.json`
2. Fill in your API keys (the sample uses `$VAR` placeholders)
3. Run `npm install`

## Agents

| Agent     | Model                  | Role                            | Read-only |
| --------- | ---------------------- | ------------------------------- | --------- |
| `plan`    | deepseek-v4-pro        | Planner (default agent)         | ✓         |
| `plan+`   | openai-gpt-5.5(medium) | Planner for large/complex tasks | ✓         |
| `execute` | deepseek-v4-flash      | Implementation                  |           |
| `edit`    | deepseek-v4-flash      | Lightweight edits               |           |
| `ask`     | deepseek-v4-flash      | Q&A / exploration               | ✓         |
| `fix`     | deepseek-v4-flash      | Bug fixing                      |           |

## Commands

- `/commit` — stage and commit changes with conventional commit messages
- `/review` — code review with compressed feedback
- `/init` — initialize project context for OpenCode
- `/init-update` — update existing project context

## Global Rules (AGENTS.md)

- Use Context7 MCP for documentation lookups
- Use `pnpm` for Node package management
- Use `uv` for Python package management (never pip)

## License

MIT
