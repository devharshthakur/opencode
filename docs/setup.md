# Setup

This guide installs the OpenCode config. To plan a documented integration in
another project, use [`/setup`](features.md) from that project instead.

## Prerequisites

- [OpenCode V2](https://opencode.ai/docs/cli) and Git.
- Access to a provider and model you want to use.

## Install

Clone this repository into `~/.config/opencode` on a first install. If the
directory already exists, back it up and merge the files you want. Do not clone
over it or replace an existing local config with the sample.

If neither `opencode.json` nor `opencode.jsonc` exists, create the local config:

```sh
cd ~/.config/opencode
cp -i opencode.sample.jsonc opencode.jsonc
```

## Configure

Connect a provider and set model IDs you can access. The sample records the
defaults. Check the `model:` pins in `agents/implement.md` and `agents/ui.md`
before using those workers; edit the pins if you cannot access those models.

Context7 is enabled in the sample. Set `CONTEXT7_API_KEY` if you use it, or set
`mcp.servers.context7.disabled` to `true` in your local config. Other MCP servers
are opt-in. Set `GITHUB_MCP_TOKEN` only if you enable the sample's GitHub MCP
configuration.

Export keys in your shell before starting OpenCode:

```sh
export CONTEXT7_API_KEY="..."
```

Use environment references in tracked config. Never print or commit secrets.
Local `opencode.jsonc` and `service.json` are Git-ignored.

The Caveman style is optional. The plugin attaches `caveman` only if the skill
is installed and discoverable; it does not install it.

## Verify in the TUI

Start OpenCode from a project. In a fresh session, select `dev` and use `/models`
to select an accessible model. Try this without approving the result:

```text
/plan Add a short project overview to the README. Leave the choice of audience open.
```

Expect a short question before the plan, then a revisioned Markdown plan and a
plain-text approval request. No files should change.

## Troubleshoot

Config changes normally reload automatically. If the command or skill is stale,
use `/reload` and retry in a fresh session. Unwatched plugin dependencies may
need a service restart. If a model fails to resolve, check provider access and
the configured model ID. If a server fails to connect, check its enablement and
credentials without printing secrets.

See [agents and permissions](features.md#agents) and
[architecture](architecture.md#configuration).
