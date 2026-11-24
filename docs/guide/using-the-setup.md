# Using the Setup

Once you have installed the config from [Getting Started](./getting-started.md), here
is how to use it in your day-to-day work.

## Quick cheat sheet: what should I use?

| What you want to do | Agent | Command |
| :--- | :--- | :--- |
| Brainstorm or search the web without touching files | `chat` | Just type your question |
| Understand how part of your codebase works | `dev` | `/ask How does auth middleware validate tokens?` |
| Make a tiny, obvious edit | `dev` | `/quick Fix the typo in the login button label` |
| Build a feature or refactor safely | `dev` | `/plan Add pagination to the users API` |
| Build a feature on a separate branch or worktree | `dev` | `/plan:branch ...` or `/plan:worktree ...` |
| Debug a bug without messing up your working tree | `dev` | `/fix Checkout fails when cart has a discount code` |
| Find bugs, security issues, or cleanup opportunities | `dev` | `/improve:quick` or `/improve:security` |
| Delegate a multi-step build to subagents | `dev` | `/use:worker` (or `@worker`) |
| Create clean local commits | `dev` | `/commit` |
| Push and open a GitHub pull request | `dev` | `/pr` or `/pr draft` |

## Walkthrough: your first real task

Here is what a typical feature or fix looks like from start to finish.

### 1. Start OpenCode in your project

Open your terminal in any Git repository and launch OpenCode:

- Check that you are in the **`dev`** agent (press <kbd>Shift</kbd> + <kbd>Tab</kbd>
  if you are in `chat`).
- Run `/models` and choose a model you have access to.

### 2. Ask before you change (optional)

If you are unfamiliar with a part of the codebase, start with a read-only question:

```text
/ask Where are API errors formatted before being sent to the client?
```

`dev` (sometimes with help from the read-only `explore` subagent) will inspect the
code and answer with exact file paths and line numbers, without editing anything.

### 3. Plan the change

When you are ready to build, run `/plan` with a clear description of what you want:

```text
/plan Add request ID logging to our API error responses and update the relevant tests.
```

What happens next:

1. The agent reads the relevant files and checks how your project is structured.
2. If anything is ambiguous (for example, header naming or log format), it asks a
   short batch of questions so you can decide up front.
3. It presents a structured plan labeled `Revision: r1` showing the scope, steps,
   validation checks, and any risks.

No files have changed yet. If you want something adjusted, just reply with your
feedback—the agent will update the plan to `Revision: r2`.

### 4. Approve and let it build

When the plan looks right, reply in plain text:

```text
approve r1
```

Or run `/approve` when exactly one plan is pending. Reply `approve r1 brief` (or
`/approve brief`) instead to approve and receive a compact execution brief:
compact the session, switch to a cheaper model, and tell it to execute the brief.

Now the agent works through the steps one by one, runs the checks listed in the plan,
reviews the diff for unintended changes, and reports what passed. Your changes stay
local and uncommitted so you can inspect them freely.

> [!TIP]
> Want to keep your current branch clean while trying something larger? Use
> `/plan:branch <task>` to work on a new local branch, or `/plan:worktree <task>` to
> work in a separate worktree directory.

### 5. Ship when you are ready

Once you are happy with the local changes, choose how you want to deliver them:

- Run **`/commit`** to review proposed commit messages and file groupings before
  anything is staged or committed. Reply `approve c1` (or run `/approve`) to create the
  series; any change to the grouping or messages gets a new ID, such as `c2`.
- Run **`/pr`** (or **`/pr draft`**) when you are ready to commit task changes, push
  the branch, and open or update a GitHub pull request.

## Everyday patterns

### Debugging with `/fix`

When something is broken and you do not yet know why, use `/fix` instead of `/plan`:

```text
/fix Users get logged out after refreshing the settings page.
```

`/fix` investigates first—using a separate disposable copy of your code if it needs
to run experiments or add temporary logs—so your working tree stays clean. Once it
proves the root cause, it gives you a normal repair plan to approve.

### Auditing a codebase with `/improve`

Want a second pair of eyes on a repo or folder? Run a focused audit:

```text
/improve:quick
```

or target a specific area like `/improve:bugs`, `/improve:security`, or
`/improve:docs`. Audits never edit files automatically. Pick the findings you care
about, and the agent will turn them into an approval plan.

### Using implementation workers

Most tasks work great directly in your `dev` session. If you want `dev` to delegate
approved implementation or UI steps to the `implement` or `ui` subagents:

1. Check the pinned models in `agents/implement.md` and `agents/ui.md` to make sure
   you have access to them.
2. Run `/use:worker` (or mention `@worker`)—that command directly authorizes worker
   execution for the task with no extra worker confirmation prompt.

See [Workers](./workers.md) to learn how handoffs and worker reports work.

## Practical tips

- **Start a fresh session for unrelated tasks.** Keeping one task per session keeps
  context focused and avoids carrying over old assumptions.
- **Give concrete scope.** Mentioning the folder, feature, or constraint ("don't
  change the public API") saves back-and-forth during planning.
- **Treat plans as checkpoints, not bureaucracy.** For a 2-line fix, use `/quick`.
  For anything multi-file or risky, `/plan` catches misunderstandings before code is
  written.
- **Watch your model choice on private code.** Remember that the Muse Contributor
  model is not zero-data-retention; switch models with `/models` before working on
  sensitive repositories.

## Where to go next

- Review [About the Setup](./about-setup.md) for how agents, commands, skills, and
  plugins fit together.
- Review [Commands and Workflows](./commands-and-workflows.md) for approval
  boundaries and safety rules.
- Explore the detailed reference docs:
  [Agents](../reference/agents.md), [Commands](../reference/commands.md),
  [Skills](../reference/skills.md), and [Architecture](../reference/architecture.md).
