# Getting Started

This repository is a personal, machine-wide [OpenCode V2](https://opencode.ai/docs/cli)
configuration. Install it once into your global OpenCode config directory, and every
project you open uses the same agents, commands, and skills.

## Prerequisites

- macOS (primary target) or Linux. The paths below assume a Unix-like home directory.
- [OpenCode V2](https://opencode.ai/docs/cli) and Git.
- Access to at least one supported provider and model.

## Install

Clone the repository into the global OpenCode config directory, `~/.config/opencode`:

```sh
git clone https://github.com/devharshthakur/opencode.git ~/.config/opencode
cd ~/.config/opencode
```

If `~/.config/opencode` already exists, back it up and merge the files you want. Do
not clone over an existing configuration.

> [!NOTE]
> This is a global configuration, not a project template. Do not clone it inside a
> project. After installation it applies to every project you open.

If neither `opencode.json` nor `opencode.jsonc` exists, create the local machine
config from the tracked sample:

```sh
cd ~/.config/opencode
cp -i opencode.sample.jsonc opencode.jsonc
```

> [!WARNING]
> Never replace an existing local config with the sample. The sample is a template,
> not an upgrade path.

## Configure

Connect a provider and set model IDs you can actually access. The sample records the
defaults. Check the model pins in
[`agents/implement.md`](https://github.com/devharshthakur/opencode/blob/main/agents/implement.md)
and
[`agents/ui.md`](https://github.com/devharshthakur/opencode/blob/main/agents/ui.md)
before using those workers, and edit the pins if needed.

| Service | Default | Setup |
| :--- | :--- | :--- |
| Context7 | Enabled in the sample | Set `CONTEXT7_API_KEY`, or disable it |
| GitHub MCP | Opt-in | Set `GITHUB_MCP_TOKEN` only if you enable it |
| Other MCP servers | Opt-in | Enable explicitly in your local config |

Export keys in your shell before starting OpenCode:

```sh
export CONTEXT7_API_KEY="..."
```

Use environment references in tracked config. Never print or commit secrets. Local
`opencode.jsonc` and `service.json` are Git-ignored.

The Caveman writing style is optional. Its plugin attaches the `caveman` skill only
when that skill is installed and discoverable. The plugin does not install it.

## Verify in the TUI

Open a terminal in any project directory and start OpenCode. In a fresh session,
select `dev` and use `/models` to pick an accessible model. Try this without
approving the result:

```text
/plan Add a short project overview to the README. Leave the choice of audience open.
```

Expect a short clarifying question, then a revisioned Markdown plan and a plain-text
approval request. No repository files should change during planning.

## Troubleshoot

Config changes normally reload automatically. If a command or skill looks stale, run
`/reload` and retry in a fresh session. Unwatched plugin dependencies may need a
service restart.

| Symptom | Check |
| :--- | :--- |
| Model fails to resolve | Provider access and the configured model ID |
| MCP server fails to connect | Enablement and credentials, without printing secrets |
| Command or skill text is stale | `/reload`, then a fresh session |
| Plugin behavior is stale | Service restart for unwatched dependencies |

## Next steps

- Read [About the Setup](./about-setup.md) to see how agents, subagents, commands,
  skills, and plugins fit together.
- Read [Commands and Workflows](./commands-and-workflows.md) to learn how slash
  commands and approval boundaries work.
- Follow [Using the Setup](./using-the-setup.md) for a practical walkthrough of your
  first tasks.
