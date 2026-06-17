# OpenCode Config

Personal [OpenCode](https://opencode.ai) configuration — custom agents, commands, plugins, and project-wide rules for AI-assisted development.

## Setup

1. Copy `opencode.sample.json` → `opencode.json`
2. Fill in your API keys (the sample uses `$VAR` placeholders)
3. Run `pnpm install`

## Agents

Default agent: **ask**. Use `chat` for non-project conversation, `plan` for risky work, `edit` for small safe changes, and `build` to implement an approved plan.

| Agent   | Model                  | Role                                          | Read-only |
| ------- | ---------------------- | --------------------------------------------- | --------- |
| `chat`  | deepseek-v4-flash-free | General chat with MCP/web, no project access  | ✓         |
| `ask`   | deepseek-v4-flash-free | Project Q&A, diagnosis, issue analysis        | ✓         |
| `plan`  | deepseek-v4-pro        | Formal phased planning for complex/risky work | ✓         |
| `build` | deepseek-v4-flash-free | Implements approved plans and delivery steps  |           |
| `edit`  | deepseek-v4-flash-free | Lightweight targeted edits                    |           |

`chat` stays off-project. `ask` handles read-only repo analysis, bug diagnosis, and issue analysis. `plan` stays reserved for formal phased plans.

## Skills

| Skill                   | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `fix-diagnosis`         | Root-cause workflow and fix-plan format  |
| `github-issue-analysis` | Read-only GitHub issue analysis workflow |
| `github-delivery`       | Commit / PR / merge / issue-close flow   |

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
