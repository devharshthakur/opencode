# OpenCode Config

My personal setup for [OpenCode V2](https://opencode.ai/v2/docs/). Three agents, a few reusable workflows, and terminal settings that keep the noise down.

Most days, I use **`ask` to understand the code** and **`edit` to change it**. When a task needs more structure, there are commands for planning first or taking it all the way to a pull request.

[Getting started](#getting-started) · [Agents](#agents) · [Workflows](#workflows) · [Configuration](#configuration) · [Skills](#skills)

## Getting started

1. Place the files in `~/.config/opencode`, or `$XDG_CONFIG_HOME/opencode` if you use a custom config directory.
2. Open [`opencode.jsonc`](opencode.jsonc), pick models you have access to, and set up provider authentication.
3. Set `CONTEXT7_API_KEY` in your environment. Context7 is the only MCP integration enabled by default.
4. Install the dependency from this directory:

   ```sh
   npm install
   ```

5. Restart OpenCode and open a fresh session.

> [!NOTE]
> Use `opencode.jsonc`, not `opencode.sample.json`. The sample is an older template and doesn't match the current setup. The active config uses `{env:VAR}` for environment variables.

> [!WARNING]
> This is a personal configuration, not a hardened preset. External-directory access is allowed, and the terminal is set to autoaccept permissions. Review those settings before using it with your projects.

## Agents

**`edit` is the default.** You don't need a special workflow for a small change—just ask it to make the edit.

| Agent | Use it for | Project access |
| --- | --- | --- |
| `chat` | General questions, brainstorming, and web research | None |
| `ask` | Understanding code, diagnosing problems, and discussing plans | Read-only work |
| `edit` | Making changes, running checks, and Git/GitHub tasks | Full access, subject to permissions |

For example:

```text
@ask How does authentication work in this project?
@edit Add a regression test for the login timeout.
@chat Help me think through a naming convention.
```

<details>
<summary>Models and access boundaries</summary>

The three primary agents inherit the default model, currently `opencode-go/deepseek-v4.1-flash`. Built-in subagents have their own overrides:

- `explore`: `opencode/big-pickle`
- `general`: `opencode-go/deepseek-v4.1-flash#high`

`chat` cannot read project files, run shell commands, or launch subagents. `ask` denies file edits and can use the read-only `explore` subagent. Its shell access is broad: avoiding commands that write files is an instruction, not a shell permission restriction.

`edit` adds no agent-specific tool restrictions. Global permissions, project permissions, and policies still apply.

The built-in `plan` and `build` agents are disabled in this config. Planning and building use skills instead; a project's configuration can override the agent settings.

</details>

## Workflows

Choose how much control you want over the task:

| Command | What happens |
| --- | --- |
| `/plan <task>` | `ask` writes a plan for you to review |
| `/build [plan or phase]` | `edit` carries out a plan you've explicitly approved |
| `/implement <task>` | Implements, validates, commits, pushes, and opens or updates a PR in a separate worktree |
| `/implement-branch <task>` | The same delivery workflow, on a separate branch in the current checkout |

### Plan first, then build

Use this when you want to review the approach before anything changes.

1. Run `/plan <task>`.
2. Review the plan and explicitly approve it, or approve a specific phase.
3. Run `/build` in the same session.

```text
/plan Add password reset to the existing authentication flow
```

Planning doesn't edit files, run shell commands, or launch subagents. Building only starts when the plan, approval, and scope are clear. It includes validation, but **commits, pushes, and PRs need separate approval**.

### Take a task through to a PR

Use `/implement` when you want the whole delivery workflow. You can supply a task, an existing plan, an issue number, or an issue URL.

```text
/implement Fix the timeout described in issue #42
/implement-branch Add tests for the settings page
```

> [!IMPORTANT]
> These commands authorize scoped commits, a push, and PR creation or updates, subject to tool permissions. An ordinary request like “implement this change” does **not** authorize publishing.

You can narrow that permission in the request:

```text
/implement Add tests for the settings page; no commits, no push, no PR
```

<details>
<summary>Delivery rules and safety checks</summary>

- **Isolation:** `/implement` uses a worktree by default and preserves the original checkout, even if it's dirty. `/implement-branch` creates no worktrees and stops if branch switching would be unsafe.
- **Base:** uses published `main`, or the verified remote default branch if `main` doesn't exist. You can request a different base.
- **Overrides:** `no commits` also means no staging, push, or PR. `no push` also means no PR. `no PR` still allows commits and a push.
- **History:** published commits are append-only. The workflow doesn't routinely amend, rebase, or force-push.
- **Limits:** missing essential facts or unsafe state stop execution. Merging, deployment, destructive actions, and cleanup aren't part of normal delivery.
- **Issues:** stay open by default. Closing an issue requires an explicit request and a separate confirmation through `question`.
- **Finish:** task branches and worktrees are retained. When a PR is available, the response ends with its verified URL and reports any failed or pending checks honestly.

The approved-plan `/build` workflow also checks dirty-checkout state, scope, and validation. It doesn't automatically create branches or worktrees, stage changes, or publish anything.

All four commands run in the current session. If the task or required approval is missing, they ask before changing the repository. Use a fresh session when returning from autonomous delivery to ordinary editing.

Skills describe how to work; they don't grant tool permissions or bypass approvals.

</details>

## Configuration

The main files are split by responsibility:

| File or folder | What's inside |
| --- | --- |
| [`opencode.jsonc`](opencode.jsonc) | Models, agents, permissions, MCP integrations, and the `zsh` shell |
| [`cli.json`](cli.json) | Terminal appearance and interaction settings |
| [`AGENTS.md`](AGENTS.md) | Shared rules for development, documentation, and verification |
| [`agents/`](agents/) | The `chat`, `ask`, and `edit` definitions |
| [`commands/`](commands/) | The four workflow commands |
| [`skills/`](skills/) | Reusable workflow instructions |

The terminal uses a light theme, unified diffs, and low verbosity. Thinking output and the sidebar are hidden, and tabs are off.

<details>
<summary>Optional integrations and other settings</summary>

**MCP integrations**

Context7 is enabled. These integrations are configured but disabled:

- AWS and GitHub
- Google Cloud: general, Backup and DR, observability, and storage
- Homebrew, Vercel, and Cloudflare
- Canva, Notion, and LinkedIn
- Chrome DevTools and Kite

Enable only what you need and check each integration's authentication and local prerequisites. The optional GitHub MCP integration uses `GITHUB_MCP_TOKEN`.

**Sensitive files**

The global rules request approval before reading environment files, private keys, and common credential files. `.env.example` is allowed. Review these rules alongside the terminal's permission-autoaccept setting.

**Dependencies and local state**

`package.json` pins `@opencode-ai/plugin` to `1.18.35`, with `package-lock.json` tracking the install. There are no package scripts, local plugin implementations, or configured plugin entries.

`opencode.json` and `service.json` are ignored by Git. Keep credentials and local service state out of commits.

</details>

## Skills

Agents load relevant skills when they need them, rather than loading every workflow at the start of a session.

<details>
<summary>Browse the repository's skills</summary>

| Skill | Purpose |
| --- | --- |
| `plan` | Write a reviewable plan and hand off to `/build` |
| `build` | Execute an explicitly approved plan |
| `implement` | Deliver a task through validation and a PR |
| `commit` | Review changes and get approval before committing |
| `fix-diagnosis` | Find the root cause and write a fix plan without edits |
| `investigate-first` | Gather evidence when the cause isn't clear |
| `lean-build` | Build a focused feature without overbuilding |
| `migration` | Make reversible, compatibility-safe transitions |
| `safe-refactor` | Change structure while preserving behavior |
| `surgical-patch` | Fix a bug at the responsible layer |
| `verify-and-stop` | Check acceptance criteria without expanding scope |
| `tanstack-cli` | Work with TanStack scaffolding, add-ons, and templates |

`plan`, `build`, and `implement` require explicit invocation. Their metadata sets `opencode/autoinvoke: false`, and the workflow commands load them directly. Reading or discussing a skill doesn't authorize running it.

For a standalone commit, request the `commit` skill. There's no repository-defined `/commit` command. For GitHub issue analysis, ask `ask`; there's no local `/github-issue-analysis` command either.

Built-in or externally installed skills may also be available in your session. They aren't maintained in this repository.

</details>

## License

MIT
