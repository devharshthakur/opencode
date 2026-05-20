# OpenCode Config

Personal [OpenCode](https://opencode.ai) configuration — custom agents, commands, plugins, and project-wide rules for AI-assisted development.

## Setup

1. Copy `opencode.sample.json` → `opencode.json`
2. Fill in your API keys (the sample uses `$VAR` placeholders)
3. Run `pnpm install`

## Agents

Default agent: **build**. The `plan` agent is disabled.

| Agent    | Model                         | Role                                         | Read-only |
| -------- | ----------------------------- | -------------------------------------------- | --------- |
| `ask`    | deepseek-v4-flash-free        | Q&A / codebase exploration                   | ✓         |
| `build`  | deepseek-v4-pro               | Plan-first, approval-gated                   |           |
| `build+` | openai-gpt-5.5                | Large/complex task planner                   |           |
| `edit`   | deepseek-v4-flash-free        | Lightweight targeted edits                   |           |
| `fix`    | deepseek-v4-pro (high-effort) | Root-cause bug diagnosis                     |           |
| `issue`  | deepseek-v4-pro               | GitHub issue → plan → implement → PR → merge |           |

## Commands

| Command           | Description                                         |
| ----------------- | --------------------------------------------------- |
| `/caveman`        | Toggle caveman communication mode (lite/full/ultra) |
| `/caveman-commit` | Stage and commit with conventional commit messages  |
| `/caveman-review` | Code review with compressed feedback                |
| `/init`           | Initialize project context for OpenCode             |
| `/init-update`    | Update existing project context                     |
| `/review`         | Standard code review                                |

## Plugins

### Caveman Plugin

Lifecycle plugin (`plugins/caveman/`) that handles caveman mode state across sessions:

- **`session.created`** — writes active mode flag on session start
- **`tui.prompt.append`** — parses slash commands and natural-language toggles, appends reinforcement line each prompt so model doesn't drift

Skills directory (`~/.agents/skills/`) provides the actual caveman skill definitions. The plugin handles only dynamic state — the always-on ruleset comes from `AGENTS.md`.

## License

MIT
