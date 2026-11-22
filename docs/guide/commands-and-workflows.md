# Commands and Workflows

Slash commands are the main way you drive this setup. Instead of writing long prompts
explaining how to investigate, plan, test, or commit, you pick a command that matches
the job and follow its built-in checkpoints.

## How commands work

Each slash command lives in `commands/`. When you invoke one—such as `/plan` or
`/fix`—the `command-skills.ts` plugin automatically attaches the matching skill from
`skills/` so the agent follows a consistent procedure.

Commands **select a workflow**; they do not skip safety gates. Your arguments narrow
what the agent works on, not what it is allowed to do.

## Main command groups

### 1. Ask and quick edits

| Command | When to use it | Edits files? |
| :--- | :--- | :--- |
| `/ask <question>` | Explore how something works in the codebase | No (read-only) |
| `/quick <task>` | Make a small, obvious change without a planning round | Yes (local edits only) |

Use `/ask` when you just want answers backed by file references. Use `/quick` for
small, low-risk changes where a full plan would be overkill—it skips the plan gate
but still respects Git, commit, and safety limits.

### 2. Planning and isolation

| Command | Where changes happen | Best for |
| :--- | :--- | :--- |
| `/plan <task>` | Current checkout | Most features and refactors |
| `/plan:branch <task>` | New local feature branch | Keeping work off your current branch |
| `/plan:worktree <task>` | Separate local Git worktree | Leaving your current checkout untouched |
| `/setup <sources...>` | Current checkout | Adapting a library/tool setup from docs or URLs |
| `/create:skill <idea>` | Current checkout | Designing and adding a project-local skill |

During planning, the agent inspects the codebase, asks clarifying questions (through the
`question` tool, or Markdown when options are long) until nothing is ambiguous, and
presents a numbered plan (for example, `Revision: r1`). **No files are edited, no
packages are installed, and Git is not mutated until you reply `approve r1`** (or
give another direct approval).

All `/plan*` variants start from local `HEAD` by default and leave your changes
uncommitted when done.

### 3. Debugging and codebase audits

| Command | What it does |
| :--- | :--- |
| `/fix <issue>` | Investigates a bug safely, proves the cause, and proposes a repair plan |
| `/improve [scope]` | Runs a read-only audit across the codebase and prioritizes findings |
| `/improve:<focus>` | Runs a targeted audit (`quick`, `deep`, `bugs`, `security`, `perf`, `tests`, `debt`, `deps`, `dx`, `docs`, `next`) |

#### How `/fix` protects your working tree

`/fix` starts with read-only inspection. If it needs to run experiments, add logging,
or reproduce a failing test, it copies the relevant code into a **separate disposable
directory** outside your checkout. Your original files and Git history stay untouched
while diagnosing:

- Diagnostic tests are temporary evidence, not permanent additions unless requested.
- It defaults to local disposable data with no external writes.
- A source copy is not a security sandbox—still be careful with untrusted code.
- The disposable environment stays available while you review the fix, then unused
  services are stopped and temporary files are cleaned up after completion or
  cancellation.
- Once the cause is confirmed, `/fix` presents a normal approval plan for the repair
  (defaulting to the current checkout unless you ask for a branch or worktree).

#### How `/improve*` works

`/improve*` commands are read-only audits that never edit files on their own. After
the audit, you choose which findings you want to act on, and the agent creates a plan
for approval. Unlike regular `/plan` runs, `/improve*` workflows carry task-scoped
worker authority so subagents can assist once the plan is approved.

### 4. Commits and pull requests

Delivery is intentionally separate from implementation. Approving a plan never
authorizes commits or pushes.

| Command | What it does | Approval gate |
| :--- | :--- | :--- |
| `/commit [scope]` | Proposes clean, grouped commit messages and file counts | Waits for commit approval before staging or committing |
| `/commit:auto [scope]` | Creates scoped local commits directly | Running the command authorizes local commits (still stops for secrets or unclear scope) |
| `/pr [:<base>] [draft]` | Commits task changes, pushes, and opens or updates a GitHub PR | Running the command authorizes the task-scoped PR flow |

Nothing is force-pushed, amended, merged, or deployed automatically.

### 5. Opting into implementation workers

| Command | What it does |
| :--- | :--- |
| `/use:worker [task]` (or `@worker`) | Directly authorizes delegating implementation to `implement` / `ui` workers for the task |

Running `/use:worker` or `@worker` grants task-scoped worker authority immediately—no
second confirmation prompt is required. That authorization covers all workers needed
for that single task, does not expand scope, and does not carry over to the next
task. Implementation-plan approval (`approve r<N>`) still applies if no plan is
approved yet. See [Workers](./workers.md) for details.

## Approval boundaries

Every major step has its own explicit boundary. Approving one step never unlocks the
next:

| Approval | What it allows | What it does **not** allow |
| :--- | :--- | :--- |
| **Plan** (`approve r<N>`) | Local edits and checks in the approved checkout | Workers (unless `/use:worker`, `@worker`, or `/improve*` was invoked), commits, pushes, PRs, deployment |
| **Worker use** (`/use:worker` or `@worker`) | Delegating approved task steps to workers | New scope, unapproved plans, or extra operations |
| **Commit** | Staging and creating local commits | Pushing or opening a PR |
| **PR** | Task-scoped commits, push, and PR creation/update | Merging or deploying |

A Todo list tracks progress—it is **not** an approval. Permission denials and
destructive-operation confirmations always still apply.

## Safety limits and reload behavior

> [!NOTE]
> Planning and `/ask` read-only rules are **instruction contracts**, not runtime tool
> locks. Because `dev` has allow-all permissions, review your configured permissions
> and provider data policy before working on sensitive code.

- **Data retention:** The configured Muse Contributor model is not
  zero-data-retention—prompts and completions may be used for training. Switch models
  before sharing sensitive source code.
- **Reloading edits:** Changes to command files reload automatically without
  restarting OpenCode. If you edit `/fix` or another skill/command, test it in a
  **fresh session** so older attached skill text does not affect the run.

See the
[shared approval policy](https://github.com/devharshthakur/opencode/blob/main/skills/shared/approval-handoff/SKILL.md)
and [Commands Reference](../reference/commands.md) for complete details.

## Next steps

- Put this into practice with [Using the Setup](./using-the-setup.md).
- Read [Workers](./workers.md) to understand subagent handoffs and results.
- Browse the full list of slash commands in [Commands](../reference/commands.md).
