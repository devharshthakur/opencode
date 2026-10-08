# OpenCode Config

Personal [OpenCode](https://opencode.ai) V2 configuration — custom agents, commands, plugins, skills, and project-wide rules for AI-assisted development.

## Setup

1. Copy `opencode.sample.json` → `opencode.json`
2. Fill in your API keys (the sample uses `$VAR` placeholders)
3. Run `pnpm install`

## Agents

Default agent: **edit**. Use `chat` for non-project conversation, `ask` for read-only project analysis and planning, and `edit` for execution. Formal planning and approved-plan building are skills invoked through `/plan` and `/build`, not separate agents.

| Agent   | Model                                | Role                                           | Read-only |
| ------- | ------------------------------------ | ---------------------------------------------- | --------- |
| `chat`  | `opencode-go/deepseek-v4.1-flash`    | General chat with MCP/web, no project access   | ✓         |
| `ask`   | `opencode-go/deepseek-v4.1-flash`    | Project Q&A, diagnosis, issue analysis, and planning | ✓     |
| `edit`  | `opencode-go/deepseek-v4.1-flash`    | Full-access development and Git/GitHub work    |           |

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
| `caveman-explore` | Compact routing guidance for the read-only `explore` subagent |

`plan`, `build`, and `implement` are registered but hidden from automatic model invocation with `opencode/autoinvoke: false`. Their commands explicitly load the exact skill IDs. Loading a skill to inspect or discuss it does not authorize executing its workflow.

## Commands

| Command | Description |
| --- | --- |
| `/plan <task>` | Select `ask`, explicitly load the planning skill, and request approval of the resulting plan |
| `/build [plan/phase context]` | Select `edit`, explicitly load the build skill, and verify existing plan approval before execution |
| `/implement <task>` | Run `edit` with the autonomous implementation skill; separate worktree by default |
| `/implement-branch <task>` | Run `edit` with the same skill on a separate branch in the current checkout; no worktrees |
| `/commit` | Stage approved changes and create approved Conventional Commits |
| `/github-issue-analysis` | Read-only GitHub issue analysis and implementation guide |

Both implementation commands explicitly load the skill, run in the current session, preserve user overrides, and use no embedded shell commands. With no task or identifiable task context, they request a task before repository mutation. For implementation without delivery, use `/implement <task>; no commits, no push, no PR` or the branch-only equivalent.

The planning/build commands also run in the current session, pass user arguments, and use no embedded shell commands. Use `/plan <task>`, explicitly approve the presented plan or phase, then invoke `/build`. Plan approval authorizes only implementation of that scope, not publishing. Ordinary questions and edits do not automatically enter either workflow.

## License

MIT
