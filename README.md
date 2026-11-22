# OpenCode workflow

A personal [OpenCode V2](https://opencode.ai/v2/docs/) setup for project work. It
provides two primary agents, specialist workers, slash commands, and shared skills
for planning, implementation, review, and delivery.

This repository is a configuration collection, not a standalone application. Copy
or adapt the pieces you need.

## Documentation

The full documentation is published at
[devharshthakur.github.io/opencode](https://devharshthakur.github.io/opencode/).

| Section | What it covers |
| :--- | :--- |
| [Getting Started](docs/guide/getting-started.md) | Prerequisites, installation, provider setup, and a first-run check |
| [About the Setup](docs/guide/about-setup.md) | How the setup is structured, primary agents, subagents, and why they are split |
| [Commands and Workflows](docs/guide/commands-and-workflows.md) | Slash commands, approval boundaries, isolation, and delivery gates |
| [Using the Setup](docs/guide/using-the-setup.md) | Practical starter guide for picking agents, commands, and running your first tasks |
| [Workers](docs/guide/workers.md) | Worker roles, handoffs, and task-scoped authorization |
| [Agents](docs/reference/agents.md) | Primary agents, workers, models, and access |
| [Commands](docs/reference/commands.md) | Slash commands for asking, planning, fixing, shipping, and improving |
| [Skills](docs/reference/skills.md) | Workflow, delivery, shared-policy, and tool skills |
| [Architecture](docs/reference/architecture.md) | Repository layout, plugins, configuration, and maintenance |

## Quick start

1. Clone this repository to `~/.config/opencode`.
2. Create your local config from the tracked sample:

   ```sh
   cp opencode.sample.jsonc opencode.jsonc
   ```

3. Set provider accounts, accessible model IDs, and required environment variables.
4. Start OpenCode from a project and choose a model with `/models`.

> [!TIP]
> Context7 is enabled in the sample config. Other MCP servers are opt-in. Local
> `opencode.jsonc` and `service.json` files are Git-ignored.

The sample records defaults only. Check the model pins in `agents/implement.md` and
`agents/ui.md` before using those workers, and edit them if you cannot access the
listed models.

## Safety

- Plan approval authorizes local implementation only.
- Worker execution needs task-scoped authorization, except `/improve*` workflows.
- Commits, pushes, pull requests, and deployment have separate approval gates.
- `dev` is allow-all. Review configured permissions and provider data policies.
- The configured Muse Contributor model is not zero-data-retention.

See [Commands and Workflows](docs/guide/commands-and-workflows.md) for the full boundaries.

## License

[MIT](LICENSE) © Harsh Thakur
