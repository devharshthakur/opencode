# OpenCode Config

My personal setup for [OpenCode V2](https://opencode.ai/v2/docs/). Focused agents, reusable workflows, and terminal settings that keep the noise down.

Most days, I use **`ask` to understand the code** and **`edit` to change it**. When a task needs more structure, there are commands for planning first or taking it all the way to a pull request.

[Getting started](#getting-started) · [Agents](#agents) · [Workflows](#workflows) · [Configuration](#configuration) · [Skills](#skills)

## Getting started

1. Place the files in `~/.config/opencode`, or `$XDG_CONFIG_HOME/opencode` if you use a custom config directory.
2. Copy the sample config and adjust it:

   ```sh
   cp opencode.sample.jsonc opencode.jsonc
   ```

   Pick models you have access to and set up provider authentication.
3. Set `CONTEXT7_API_KEY` in your environment. Context7 is the only MCP integration enabled by default.
4. Install the dependency from this directory:

   ```sh
   npm install
   ```

5. Restart OpenCode and open a fresh session.

> [!NOTE]
> `opencode.jsonc` is ignored by Git so your personal models and tokens stay local. Use [`opencode.sample.jsonc`](opencode.sample.jsonc) as the starting template. It uses `{env:VAR}` for environment variables.

> [!WARNING]
> This is a personal configuration, not a hardened preset. External-directory access is allowed, and the terminal is set to autoaccept permissions. Review those settings before using it with your projects.

## Agents

**`edit` is the default.** You don't need a special workflow for a small change—just ask it to make the edit.

| Agent | Use it for | Project access |
| --- | --- | --- |
| `chat` | General questions, brainstorming, and web research | None |
| `ask` | Understanding code, diagnosing problems, and discussing plans | Read-only work |
| `edit` | Making changes, running checks, and Git/GitHub tasks | Full access, subject to permissions |
| `planner` | The strict `/plan` workflow | Read/search and web only; no shell or delegation |

For example:

```text
@ask How does authentication work in this project?
@edit Add a regression test for the login timeout.
@chat Help me think through a naming convention.
```

<details>
<summary>Models and access boundaries</summary>

The primary agents inherit the default model, currently `opencode-go/deepseek-v4.1-flash`. Subagents have their own model overrides:

- `explore`: `opencode/big-pickle`
- `general`: `opencode-go/deepseek-v4.1-flash#high`

`chat` has web access but no local tools, shell, MCP, Code Mode, or delegation. `ask` allows
native discovery, web tools, skill loading, questions, exact read-only Git inspection commands,
and the restricted `explore` profile. Other tool actions are denied, with external-directory
access requiring approval. `planner` also denies shell and delegation.
Read-only profiles deny Code Mode because session/worktree utilities do not all perform
individual permission checks; they use official web docs rather than Code Mode MCP tools.
Git status disables optional index writes and filesystem-monitor helpers; diffs disable external
diff/text conversion helpers. Use native tools for inspections outside the exact shell allowlist.

`edit` adds no agent-specific tool restrictions. Global permissions, project permissions, and policies still apply.

The built-in `plan` and `build` agents are disabled. `/plan` selects `planner`; `/build` selects
`edit`. Agent permissions use native V2 arrays. Later project configuration can override these
profiles, so this preset is not an immutable security policy.

</details>

## Workflows

Choose how much control you want over the task:

| Command | What happens |
| --- | --- |
| `/plan <task>` | `planner` writes a plan in conversation for you to review |
| `/build [plan or phase]` | `edit` carries out a plan you've explicitly approved |
| `/fix <bug>` | `ask` reports the root cause and a fix plan without writes |
| `/fix:branch <bug>` | `edit` diagnoses, repairs, and validates on a feature branch; no staging or commits |
| `/fix:worktree <bug>` | The same local repair workflow in a retained worktree |
| `/fix:pr <bug or issue>` | Diagnoses and repairs through commits, push, a verified PR, and CI checks |
| `/commit [constraints]` | Plans local commits and asks for approval before staging or committing |
| `/commit:auto [constraints]` | Creates scoped local commits without routine confirmation; never pushes |
| `/implement <task>` | Implements, validates, commits, pushes, and opens or updates a PR in a separate worktree |
| `/implement:branch <task>` | The same delivery workflow, on a separate branch in the current checkout |

### Plan first, then build

Use this when you want to review the approach before anything changes.

1. Run `/plan <task>`.
2. Review the plan and explicitly approve it, or approve a specific phase.
3. Run `/build` in the same session.

```text
/plan Add password reset to the existing authentication flow
```

Planning doesn't edit files, run shell commands, or launch subagents. Building only starts when the plan, approval, and scope are clear. It includes validation, but **commits, pushes, and PRs need separate approval**.

### Diagnose or repair a bug

```text
/fix Login sometimes times out; explain the cause without changing files
/fix:branch Fix the login timeout and add regression coverage
/fix:worktree Fix the login timeout without touching my current checkout
/fix:pr Fix the timeout reported in issue #42
```

- **Diagnosis only:** `/fix` selects `ask` and loads `fix-diagnosis`. It inspects the current checkout
  read-only, distinguishes evidence from hypotheses, and stops at a fix plan. Tests, builds, setup,
   and servers that could write files are excluded. Ask's shell access is narrowly permission-controlled.
- **Local repair:** `/fix:branch` and `/fix:worktree` select `edit` and authorize `git-isolation`,
  `fix-diagnosis`, and `surgical-patch`. They report the cause before repairing, then proceed without routine approval
  when the cause and intended behavior are clear. They do not stage, commit, push, or create PRs.
- **PR delivery:** `/fix:pr` also explicitly loads `implement`, uses a worktree by default, and
  authorizes its scoped commit/push/PR workflow. Explicit branch-only, base, and delivery limits win.
  It never merges or deploys by default, and required local checks must be verified before publishing.
- **Base and existing work:** repair starts from freshly fetched, verified remote `main`, falling
  back to the verified remote default branch if necessary; an explicit base overrides this. Branch
  switching stops on a dirty checkout. Worktree repair preserves the original checkout and never
  copies its dirty files. A bug depending on uncommitted changes requires clarification.
- **Proof and boundaries:** repairs use the narrowest responsible layer. Where a suitable test seam
  exists, prove the regression fails before the fix and passes afterward. Report missing proof and
  failing/unrun checks honestly. Uncertain causes, ambiguous behavior, new dependencies, migrations,
  or broader scope require a decision. Retain branches/worktrees; cleanup is a separate request.

These regression practices draw on Matt Pocock's installed `diagnosing-bugs` and `tdd` skills without
loading those workflows automatically. No repair command authorizes destructive Git operations.

### Commit locally

Both `/commit` and `/commit:auto`, plus autonomous delivery, use the shared `commit` skill.
Commit style has one owner: concise Conventional Commit headers, useful bodies by default,
lowercase prose, and identifier casing preserved inside backticks. The commands own the approval
policy: `/commit` requires approval of the exact files and messages; `/commit:auto` authorizes
scoped local commits without routine confirmation. Both stop for unclear scope, secrets, or
unrelated staged changes and honor tool permissions. Neither pushes or creates PRs; pushing is
left to you.

```text
/commit api only
/commit:auto Commit the reviewed documentation changes only
```

### Take a task through to a PR

Use `/implement` when you want the whole delivery workflow. You can supply a task, an existing plan, an issue number, or an issue URL.

```text
/implement Fix the timeout described in issue #42
/implement:branch Add tests for the settings page
```

> [!IMPORTANT]
> These commands authorize scoped commits, a push, and PR creation or updates, subject to tool permissions. An ordinary request like “implement this change” does **not** authorize publishing.

You can narrow that permission in the request:

```text
/implement Add tests for the settings page; no commits, no push, no PR
```

<details>
<summary>Delivery rules and safety checks</summary>

- **Isolation:** `/implement` uses a worktree by default and preserves the original checkout, even if it's dirty. `/implement:branch` creates no worktrees and stops if branch switching would be unsafe.
- **Base:** uses published `main`, or the verified remote default branch if `main` doesn't exist. You can request a different base.
- **Overrides:** `no commits` also means no staging, push, or PR. `no push` also means no PR. `no PR` still allows commits and a push.
- **History:** published commits are append-only. The workflow doesn't routinely amend, rebase, or force-push.
- **Limits:** missing essential facts or unsafe state stop execution. Merging, deployment, destructive actions, and cleanup aren't part of normal delivery.
- **Issues:** stay open by default. Closing an issue requires an explicit request and a separate confirmation through `question`.
- **Finish:** task branches and worktrees are retained. When a PR is available, the response ends with its verified URL and reports any failed or pending checks honestly.

The approved-plan `/build` workflow also checks dirty-checkout state, scope, and validation. It doesn't automatically create branches or worktrees, stage changes, or publish anything.

All workflow commands run in the current session. If the task or required approval is missing,
they ask before changing the repository. `/commit:auto` skips routine commit approval, not safety
checks. Command files reload automatically; global and upward-discovered `AGENTS.md` updates are
detected before the next model request. Already-loaded nested instruction files do not automatically
refresh; use a fresh session for those changes, or to validate changed agent permissions or skill instructions;
this redesign does not restart the service automatically.

Skills describe how to work; they don't grant tool permissions or bypass approvals.

</details>

## Configuration

The main files are split by responsibility:

| File or folder | What's inside |
| --- | --- |
| `opencode.jsonc` (local, ignored) | Your models, agents, permissions, MCP integrations, and the `zsh` shell |
| [`opencode.sample.jsonc`](opencode.sample.jsonc) | Template to copy to `opencode.jsonc` |
| [`cli.json`](cli.json) | Terminal appearance and interaction settings |
| [`AGENTS.md`](AGENTS.md) | Shared rules for development, documentation, and verification |
| [`agents/`](agents/) | Primary roles plus the restricted `explore` subagent |
| [`commands/`](commands/) | Workflow command prompts and their selected agents |
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

`opencode.json`, `opencode.jsonc`, and `service.json` are ignored by Git. Keep credentials and local service state out of commits.

</details>

## Skills

`AGENTS.md` defines a narrow method-skill allowlist for ordinary requests. Commands name their
own bounded dependency lists, and skills cannot expand those lists. `opencode` and
`writing-for-agents` are reusable domain references; heavyweight external `tdd`,
`diagnosing-bugs`, and `code-review` workflows stay opt-in until their gates are adapted.
Reading or discussing a skill never grants execution or delivery authority.

<details>
<summary>Browse the repository's skills</summary>

| Skill | Purpose |
| --- | --- |
| `plan` | Write a reviewable plan and hand off to `/build` |
| `build` | Execute an explicitly approved plan |
| `implement` | Deliver a task through validation and a PR |
| `commit` | Inspect, group, and create safe commits under the caller's approval policy |
| `fix-diagnosis` | Find the root cause and write a fix plan without edits |
| `git-isolation` | Shared published-base selection and branch/worktree preparation |
| `migration` | Make reversible, compatibility-safe transitions |
| `safe-refactor` | Change structure while preserving behavior |
| `surgical-patch` | Fix a bug at the responsible layer |
| `verify-and-stop` | Check acceptance criteria without expanding scope |
| `tanstack-cli` | Work with TanStack scaffolding, add-ons, and templates |

Command-only skills use `metadata.opencode/autoinvoke: false` to reduce discovery noise while
remaining loadable by authorized exact ID. `investigate-first` was folded into `fix-diagnosis`;
`lean-build` was retired after retaining its end-to-end scope principle in the global rules.
Isolation references live under `git-isolation`; `tanstack-cli` routes to task-specific references.

For standalone commits, use `/commit` for explicit confirmation or `/commit:auto` for local-only
commits without routine confirmation. Loading the `commit` skill alone does not authorize
committing. For GitHub issue analysis, ask `ask`; there's no local `/github-issue-analysis` command.

Built-in or externally installed skills may also be available in your session. They aren't maintained in this repository.

</details>

## Validation and inspection

The shared helper runs only through an authorized shell tool, never a command-template shell block:

```sh
sh /path/to/skills/git-isolation/scripts/preflight.sh
```

Set the working directory to the checkout. It reports bounded repository/branch/HEAD, status,
diff statistics, and worktrees without remote URLs or file contents. Truncation is explicit;
it does not prove ownership or replace full task-diff review. It uses Git, POSIX `sh`, and `awk`.

Run the repository checks without installing dependencies:

```sh
ruby tests/workflow_test.rb
python3 tests/preflight_test.py
git diff --check
```

The workflow checks validate frontmatter, references, permission rules, and written scenario gates;
they do not prove model behavior or live OpenCode enforcement. Helper fixtures exercise clean,
dirty, detached, unborn, multiple-worktree, truncation, and error cases without mutating Git;
a real checkout smoke test checks unchanged status and index bytes.

## License

MIT
