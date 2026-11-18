# Setup

This repository is an OpenCode config directory. Install it at
`~/.config/opencode`.

## Install

Clone the repository into that directory, then create a local config:

```sh
cp opencode.sample.jsonc opencode.jsonc
```

Edit `opencode.jsonc` to select provider accounts and model IDs you can access.
Agent model pins in `agents/*.md` take precedence over `agents.<id>.model` config.
The sample records tracked defaults.

## Environment

| Variable | Required when | Purpose |
| :--- | :--- | :--- |
| `CONTEXT7_API_KEY` | Using the enabled Context7 server | Context7 authentication |
| `GITHUB_MCP_TOKEN` | Enabling the GitHub MCP server | GitHub MCP authentication |

Export keys in your shell before starting OpenCode:

```sh
export CONTEXT7_API_KEY="..."
```

Add `GITHUB_MCP_TOKEN` only if you enable GitHub MCP. The sample uses environment
references; never print or commit secrets. Local `opencode.jsonc` and `service.json`
are gitignored.

## MCP servers

Context7 is enabled by default. Other servers in the sample config are disabled.
Enable only the services you need, and review their credentials and data policies.
Avoid servers that duplicate native filesystem tools.

## Verify

Start OpenCode in the config directory and run `/models` to select a session model.
Use a fresh session to verify agent, permission, or skill changes. Config and CLI
preferences normally reload automatically; plugin changes outside watched
directories may need an explicit reload or service restart.

See [agents and permissions](features.md#agents) and
[architecture](architecture.md#configuration).
