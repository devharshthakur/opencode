# About the Setup

This repository is a global [OpenCode V2](https://opencode.ai/docs/cli) configuration
that lives in `~/.config/opencode`. Instead of repeating prompts and safety rules in
every project, you install this setup once and every project you open gets the same
agents, slash commands, skills, and plugins.

This page explains how the pieces fit together, which agents and subagents exist, and
why they are split the way they are.

## How the setup is structured

Think of the setup as five building blocks that layer on top of each other:

| Folder or file | Role | Plain-English summary |
| :--- | :--- | :--- |
| `opencode.jsonc` | Local config | Your machine-specific settings: providers, models, and MCP servers. Created from `opencode.sample.jsonc` and ignored by Git. |
| `AGENTS.md` | Shared rules | Baseline instructions that apply across the setup (preserve existing work, ask before risky actions, verify changes). |
| `agents/` | Who does the work | Defines the two primary agents you talk to (`dev`, `chat`) and four specialist subagents (`explore`, `implement`, `ui`, `verify`). |
| `commands/` | How you start a task | Slash commands like `/plan`, `/fix`, `/improve`, `/commit`, and `/pr` that launch repeatable workflows. |
| `skills/` | Step-by-step playbooks | Reusable instructions that commands or agents load when needed (for planning, execution, Git isolation, verification, cleanup, and reporting). |
| `plugins/` | Small automations | Background TypeScript hooks that attach command skills automatically, keep responses in English, and optionally load the concise `caveman` style. |

When you run a command such as `/plan Add dark mode`, OpenCode loads the command file
from `commands/`, attaches its matching skill from `skills/` via the
`command-skills.ts` plugin, and runs the workflow using your active primary agent
(`dev`) and your chosen model.

## Primary agents: `dev` and `chat`

Primary agents are the main session modes you interact with directly. Switch between
them anytime with <kbd>Shift</kbd> + <kbd>Tab</kbd>.

| Agent | Best for | Tool access |
| :--- | :--- | :--- |
| `dev` (default) | Everyday coding, repo questions, and slash-command workflows | Full access (read/edit files, shell commands, subagents) |
| `chat` | Brainstorming, general questions, and web research | No project files or shell; web search, skills, questions, and todos only |

### Why have two primary agents?

Separating `dev` and `chat` gives you a clean boundary:

- Use **`dev`** when you are working on a codebase and want OpenCode to read files,
  run commands, edit code, or run workflows like `/plan` and `/fix`.
- Use **`chat`** when you want to talk through an idea or look something up online
  without risking accidental file edits or shell commands in your current directory.

> [!WARNING]
> `dev` is configured as allow-all, including shell commands and reading sensitive
> files. Review the configured permissions in
> [`agents/`](https://github.com/devharshthakur/opencode/tree/main/agents) before
> working on sensitive repositories.

## Subagents (workers)

Subagents—called **workers** in this setup—are specialist helpers that `dev` can
launch in a background child session for a specific job. They are not session modes
you switch into; `dev` delegates a focused task to them and reviews what they return.

| Subagent | What it does | Can it edit files or run shell? |
| :--- | :--- | :--- |
| `explore` | Searches the codebase and reports where things live (`path:line` evidence) | No — strictly read-only |
| `implement` | Carries out an approved implementation step and runs checks | Yes — scoped edits and checks; cannot spawn other workers |
| `ui` | Builds UI components, pages, and styles matching your project's design | Yes — edits, shell, web, and image generation; sensitive files denied |
| `verify` | Independently reviews actual changes against the approved plan | No — strictly read-only |

### Why split work across subagents?

Splitting responsibilities solves four common problems in AI-assisted coding:

1. **Cleaner context:** `explore` can read dozens of files to find callers and tests
   and send back a short summary, keeping your main `dev` session uncluttered.
2. **Safer boundaries:** `explore` and `verify` cannot edit files or run shell
   commands, so discovery and review stay read-only. `ui` and `verify` also block
   access to common secret files.
3. **Independent review:** Having `verify` inspect the finished diff in a fresh
   read-only session makes it easier to catch missed requirements or unintended edits
   than asking the same session that wrote the code.
4. **Right model for the job:** Subagents can pin their own models in their agent
   files, independent of the model you picked in your main session.

### When do subagents run?

Your main `dev` session owns work by default:

- **Read-only helpers (`explore`, `verify`)** can be used whenever `dev` needs
  focused codebase search or an independent review—no extra opt-in needed.
- **Implementation workers (`implement`, `ui`)** do **not** run automatically on
  regular tasks. Running `/use:worker` or `@worker` directly authorizes worker use
  for that task—no extra confirmation prompt needed. The only other way they run is
  inside `/improve*` workflows, which carry worker authority for the task after you
  choose findings and approve the plan.

For the full handoff lifecycle and rules, see [Workers](./workers.md).

## Models and plugins at a glance

- **Session model:** Pick any model you have access to with `/models`. Commands keep
  your chosen session model instead of silently switching it.
- **Pinned worker models:** `implement` and `ui` pin specific models in their agent
  frontmatter (`agents/implement.md` and `agents/ui.md`). Check those pins if you do
  not have access to those models.
- **Plugins:** Three small plugins in `plugins/` handle automatic skill attachment
  for slash commands (`command-skills.ts`), consistent English output
  (`english-output.ts`), and optional concise replies (`caveman-auto.ts`).

> [!NOTE]
> The configured Muse Contributor model is not zero-data-retention—prompts and
> completions may be used for training. Pick a zero-data-retention model before
> sharing private or sensitive code.

## Next steps

- Learn how slash commands and approval gates work in
  [Commands and Workflows](./commands-and-workflows.md).
- Walk through your first tasks in [Using the Setup](./using-the-setup.md).
- Dive deeper into subagent handoffs in [Workers](./workers.md).
- Look up exact specs in [Agents](../reference/agents.md) and
  [Architecture](../reference/architecture.md).
