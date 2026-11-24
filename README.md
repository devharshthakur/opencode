# OpenCode workflow

A personal [OpenCode V2](https://opencode.ai/v2/docs/) setup for project work:
two primary agents, specialist subagents (including an optional heavy-model `planner`), slash commands, and shared skills for
planning, implementation, review, and delivery.

[![Release](https://img.shields.io/github/v/release/devharshthakur/opencode?include_prereleases&style=flat-square)](https://github.com/devharshthakur/opencode/releases)
[![Documentation](https://img.shields.io/badge/docs-read%20the%20guide-2ea44f?style=flat-square)](https://devharshthakur.github.io/opencode/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

> [!NOTE]
> This repository is a global configuration, not a project template. Install it
> once, and every project you open uses the same agents, commands, and skills.

## Quick start

```sh
git clone https://github.com/devharshthakur/opencode.git ~/.config/opencode
cd ~/.config/opencode
cp -i opencode.sample.jsonc opencode.jsonc
```

Then:

1. Set your provider credentials and accessible model IDs.
2. Start OpenCode in a project.
3. Pick a model with `/models`.

> [!TIP]
> Context7 is enabled by default. Other MCP servers are opt-in. Local
> `opencode.jsonc` and `service.json` files are Git-ignored.

> [!IMPORTANT]
> Check the worker model pins in [`agents/implement.md`](agents/implement.md) and
> [`agents/ui.md`](agents/ui.md) before using `implement` or `ui`.

## Documentation

| Guide | What it covers |
| :--- | :--- |
| [Getting Started](docs/guide/getting-started.md) | Install, configure, verify |
| [About the Setup](docs/guide/about-setup.md) | Structure, primary agents, subagents |
| [Commands and Workflows](docs/guide/commands-and-workflows.md) | Approvals, isolation, delivery gates |
| [Using the Setup](docs/guide/using-the-setup.md) | Day-to-day walkthrough |

Full reference: [Agents](docs/reference/agents.md) · [Commands](docs/reference/commands.md) · [Skills](docs/reference/skills.md) · [Architecture](docs/reference/architecture.md)

## Safety

> [!WARNING]
> `dev` is allow-all, including shell commands and sensitive reads. Review the
> configured permissions and your provider's data policy before use.

- Plan approval authorizes local implementation only. Reply `approve r<N>`, or run
  `/approve` when exactly one gate is pending. Commit gates use `approve c<N>` the same way.
- Worker execution needs task-scoped `/use:worker` or `@worker` authorization,
  except `/improve*`.
- Commits, pushes, PRs, and deployment have separate approval gates.
- The configured Muse Contributor model is not zero-data-retention.

## License

[MIT](LICENSE) © Harsh Thakur
