# OpenCode Config

Personal [OpenCode](https://opencode.ai/v2/docs/) V2 configuration — custom agents, commands, skills, terminal preferences, and project-wide rules for AI-assisted development.

## Setup

1. Place this configuration in `~/.config/opencode` (or `$XDG_CONFIG_HOME/opencode`). Review the personal settings before using them.
2. Use the tracked `opencode.jsonc` as the current configuration. Choose models available to your account and configure provider authentication.
3. Set `CONTEXT7_API_KEY` in the environment for the enabled Context7 MCP server. Optional GitHub MCP uses `GITHUB_MCP_TOKEN` and is disabled by default.
4. Run `npm install` to install the dependency in `package.json`; the repository currently tracks `package-lock.json`.
5. Restart OpenCode and start a fresh session after changing agents or skills.

`opencode.sample.json` is an older template, not a mirror of the active configuration: it still selects `plan`, uses legacy configuration shapes, and contains literal `$VAR` placeholders. Do not copy it unchanged to reproduce the current setup. The active configuration uses `{env:VAR}` environment substitutions.

## Configuration files

| Path | Purpose |
| --- | --- |
| `opencode.jsonc` | Current model, default agent, subagent overrides, permissions, MCP servers, and `zsh` shell |
| `cli.json` | Terminal preferences: light theme, unified diffs, low verbosity, hidden thinking/sidebar, and tabs off |
| `AGENTS.md` | Global development, documentation, tooling, and verification instructions |
| `agents/` | Custom primary agents: `chat`, `ask`, and `edit` |
| `commands/` | Explicit planning, approved-build, and autonomous implementation commands |
| `skills/` | Repository-maintained workflow skills and supporting references |
| `opencode.sample.json` | Older example configuration requiring review before use |
| `package.json`, `package-lock.json` | `@opencode-ai/plugin` dependency pinned to `1.18.35`; no package scripts |

There are no local plugin implementations or configured plugin entries. `opencode.json` and `service.json` are ignored by Git; do not publish local service state or credentials.

### MCP and permissions

Context7 is the only MCP server enabled by default. Optional disabled integrations are AWS, GitHub, Google Cloud (general, Backup and DR, observability, storage), Homebrew, Vercel, Canva, Notion, Chrome DevTools, Cloudflare, LinkedIn, and Kite. Enable only the integrations you need and supply their authentication and local prerequisites.

Global permissions allow external-directory access and request approval for reads of environment files, private keys, and common credential files; `.env.example` is allowed. `cli.json` currently selects permission autoaccept, so review that preference alongside the configured permission rules before using this setup.

## Agents

Default agent: **edit**. Use `chat` for non-project conversation, `ask` for read-only project analysis and planning, and `edit` for execution. Formal planning and approved-plan building are skills invoked through `/plan` and `/build`, not separate agents.

| Agent   | Model                                | Role                                           | Read-only |
| ------- | ------------------------------------ | ---------------------------------------------- | --------- |
| `chat`  | `opencode-go/deepseek-v4.1-flash`    | General chat with MCP/web, no project access   | ✓         |
| `ask`   | `opencode-go/deepseek-v4.1-flash`    | Project Q&A, diagnosis, issue analysis, and planning | ✓     |
| `edit`  | `opencode-go/deepseek-v4.1-flash`    | Full-access development and Git/GitHub work    |           |

The primary agent files do not pin models; they inherit the configured default unless overridden. Built-in subagents are configured separately: `explore` uses `opencode/big-pickle`, and `general` uses `opencode-go/deepseek-v4.1-flash#high`.

`chat` cannot access the workspace or launch subagents. `ask` denies file edits but retains its existing broad shell access and read-only `explore` subagent access; avoiding write-producing shell commands is an instruction, not a shell permission restriction. Its short prompt answers ordinary questions directly and loads relevant workflows. `edit` is the general-purpose execution agent: ordinary edits and small tasks run directly, and explicitly requested workflows use relevant skills. It has no agent-specific tool restrictions; global secret-read approvals, project permissions, and applicable policies remain enforced.

The custom `plan` and `build` agent files have been removed, and both built-in agent IDs are disabled in `opencode.jsonc` so they do not reappear. Later project configuration can override global disabling. The default remains `edit`; existing sessions may retain a retired agent until restarted with a fresh session.

`/plan <task>` uses `ask` to produce a phased, approval-ready plan in conversation without edits, shell execution, subagents, or delivery. After explicitly approving the plan or phase, invoke `/build` in the same session to select `edit` and execute that scope. `/build` does not silently approve a plan and stops before mutation if plan, approval, or scope is missing. Planning-stage restrictions end at the explicitly approved execution transition, not permanently for the conversation.

The `build` skill preserves dirty-checkout confirmation, scope and validation gates, and separate delivery approval. It does not create branches/worktrees, stage, commit, push, or create PRs automatically. Its destructive-command prohibitions and confirmation steps are instructions; the former build agent's hard command denials and removal approvals are no longer configured. This approval-gated workflow is separate from autonomous `implement` delivery.

The former `implement` agent is now the `implement` skill, explicitly invoked through `/implement`, `/implement-branch`, or an `@implement` skill mention with a task. It is not advertised for automatic invocation. Ordinary requests such as "implement this change" do not activate autonomous delivery. Skills provide workflow instructions, not enforced permissions. Explicit issue-close requests require a separate confirmation through `question` under this skill; the former agent-specific tool approval is no longer configured.

Provide task text, a plan, an issue number, or an issue URL. Explicit invocation authorizes implementation, validation, small scoped Conventional Commits, push, and PR creation/update without routine conversational approval, subject to tool permissions. User overrides such as `no commits`, `no push`, `no PR`, or an explicit base take precedence. The workflow targets published `main`, falling back to the verified remote default branch, and ends with the verified PR URL when available. Missing essential facts or unsafe state stop execution. Published history is append-only; issues remain open. Merging, deployment, destructive actions, and cleanup are not part of default delivery.

Worktree mode preserves the original checkout even when dirty and retains the task worktree. Branch-only mode uses the current checkout, refuses unsafe or dirty branch switching, creates no worktrees, and leaves the checkout on the task branch. Both retain task state after delivery or a blocker. Restart OpenCode and use a fresh session after agent or skill changes; use a fresh session when moving from autonomous delivery back to ordinary editing.

## Skills

Skills are advertised by description and loaded on demand. Agent prompts select the applicable workflow rather than loading every skill into every session.

| Skill | Purpose |
| --- | --- |
| `plan` | Explicit formal planning with `ask`, an approval request, and a `/build` handoff |
| `build` | Explicit approved-plan execution with `edit`; delivery needs separate approval |
| `implement` | Explicit autonomous task, plan, or issue delivery with shared instructions and worktree/branch supporting workflows |
| `commit` | Standalone, approval-gated scoped commits; not used for autonomous implementation delivery |
| `fix-diagnosis` | Read-only root-cause diagnosis and fix-plan format |
| `investigate-first` | Evidence-ranked diagnosis for ambiguous failures |
| `lean-build`, `migration`, `safe-refactor`, `surgical-patch`, `verify-and-stop` | Scoped implementation and validation workflows |
| `tanstack-cli` | TanStack CLI scaffolding, add-ons, templates, and agent introspection |

This table lists skills maintained in this repository. Built-in or externally installed skills may also be available in a running OpenCode session; they are not stored here.

`plan`, `build`, and `implement` are registered but hidden from automatic model invocation with `opencode/autoinvoke: false`. Their commands explicitly load the exact skill IDs. Loading a skill to inspect or discuss it does not authorize executing its workflow.

## Commands

| Command | Description |
| --- | --- |
| `/plan <task>` | Select `ask`, explicitly load the planning skill, and request approval of the resulting plan |
| `/build [plan/phase context]` | Select `edit`, explicitly load the build skill, and verify existing plan approval before execution |
| `/implement <task>` | Run `edit` with the autonomous implementation skill; separate worktree by default |
| `/implement-branch <task>` | Run `edit` with the same skill on a separate branch in the current checkout; no worktrees |

These are the four repository-defined commands. For standalone commits, explicitly request the `commit` skill; there is no local `/commit` command file. GitHub issue analysis can be requested from `ask`; there is no local `/github-issue-analysis` command file.

Both implementation commands explicitly load the skill, run in the current session, preserve user overrides, and use no embedded shell commands. With no task or identifiable task context, they request a task before repository mutation. For implementation without delivery, use `/implement <task>; no commits, no push, no PR` or the branch-only equivalent.

The planning/build commands also run in the current session, pass user arguments, and use no embedded shell commands. Use `/plan <task>`, explicitly approve the presented plan or phase, then invoke `/build`. Plan approval authorizes only implementation of that scope, not publishing. Ordinary questions and edits do not automatically enter either workflow.

## License

MIT
