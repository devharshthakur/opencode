# OpenCode workflow

A personal [OpenCode V2](https://opencode.ai/v2/docs/) setup for project work. It
provides two primary agents, specialist workers, slash commands, and shared skills.

## Quick start

1. Clone this repository to `~/.config/opencode`.
2. Create your local config:

   ```sh
   cp opencode.sample.jsonc opencode.jsonc
   ```

3. Set provider accounts, available model IDs, and required environment variables.
4. Start OpenCode and choose a model with `/models`.

The sample config uses environment references. Context7 is enabled by default;
other MCP servers are opt-in. Local `opencode.jsonc` and `service.json` are ignored.

## Start here

| Need | Guide |
| :--- | :--- |
| Install and configure | [Setup](docs/setup.md) |
| Choose an agent or command | [Features](docs/features.md) |
| Understand approvals and task flow | [Workflow](docs/workflow.md) |
| Understand files, plugins, and shared policies | [Architecture](docs/architecture.md) |

## Agents

| Agent | Purpose |
| :--- | :--- |
| `dev` | Default agent for project work and direct execution |
| `chat` | General conversation and external research; no project tools |
| `explore` | Bounded, read-only code discovery |
| `implement` | Executes an approved worker assignment |
| `ui` | Builds UI using existing project conventions |
| `verify` | Independent, read-only change review |

Switch between `dev` and `chat` with <kbd>Shift</kbd> + <kbd>Tab</kbd>. Workers are
subagents, not session modes. See [agent access and models](docs/features.md#agents).

## Safety

- A plan approval authorizes local implementation only.
- Worker execution needs task-scoped authorization, except `/improve*` workflows.
- Commits and GitHub publishing have separate approval gates.
- Planning leaves repository files unchanged; its shell limits are instruction-based.
- `dev` is allow-all. Review the configured permissions and provider data policies.

See [workflow and approvals](docs/workflow.md) for exact boundaries.
