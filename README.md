# OpenCode Config

Personal [OpenCode](https://opencode.ai) V1 configuration — custom agents, commands, plugins, skills, and project-wide rules for AI-assisted development.

## Setup

1. Copy `opencode.sample.json` → `opencode.json`
2. Fill in your API keys (the sample uses `$VAR` placeholders)
3. Run `pnpm install`

## Agents

Default agent: **edit**. Use `chat` for non-project conversation, `ask` for read-only project analysis, `plan` for complex or risky work, and `build` to implement an approved plan.

| Agent   | Model                                | Role                                           | Read-only |
| ------- | ------------------------------------ | ---------------------------------------------- | --------- |
| `chat`  | `opencode-go/deepseek-v4.1-flash`    | General chat with MCP/web, no project access   | ✓         |
| `ask`   | `opencode-go/deepseek-v4.1-flash`    | Project Q&A, diagnosis, and issue analysis     | ✓         |
| `plan`  | `opencode-go/deepseek-v4.1-flash`    | Formal phased planning for complex or risky work | ✓       |
| `build` | `opencode-go/deepseek-v4.1-flash`    | Implements approved plans and explicit delivery |           |
| `edit`  | `opencode-go/deepseek-v4.1-flash`    | Full-access development and Git/GitHub work    |           |

`chat` cannot access the workspace or launch subagents. `ask` can inspect code and use only read-only Git commands. `plan` cannot edit, use shell commands, or launch subagents. `edit` is the full development agent: it can delegate to any enabled subagent, ordinary shell commands run directly, and all Git and GitHub mutations require a user approval prompt.

## Skills

Skills are advertised by description and loaded on demand. Agent prompts select the applicable workflow rather than loading every skill into every session.

| Skill | Purpose |
| --- | --- |
| `fix-diagnosis` | Read-only root-cause diagnosis and fix-plan format |
| `github-delivery` | Explicit commit, PR, merge, or issue-close workflow |
| `investigate-first` | Evidence-ranked diagnosis for ambiguous failures |
| `lean-build`, `migration`, `safe-refactor`, `surgical-patch`, `verify-and-stop` | Scoped implementation and validation workflows |
| `caveman-explore` | Compact routing guidance for the read-only `explore` subagent |

## Commands

| Command | Description |
| --- | --- |
| `/commit` | Stage approved changes and create approved Conventional Commits |
| `/github-issue-analysis` | Read-only GitHub issue analysis and implementation guide |

## License

MIT
