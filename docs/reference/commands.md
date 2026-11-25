# Commands

Commands select a workflow and its authorization rules. Arguments narrow scope;
they do not broaden authority.

## Ask, plan, and build

| Command | Purpose | Writes |
| :--- | :--- | :--- |
| `/ask <question>` | Answer a project question with read-only discovery | No |
| `/quick <task>` | Execute directly without a planning gate | Local implementation only |
| `/plan <task>` | Plan in the current checkout, then implement after approval | After approval |
| `/setup <sources...>` | Plan a customized setup from docs, URLs, attachments, or skills | After approval |
| `/create:skill <idea>` | Design a local skill, then create it after design confirmation | After confirmation |

`/plan*`, `/fix`, `/commit*`, and `/pr` pre-fill a read-only Git snapshot (`git status`, recent log or diff stat) through fixed `!` blocks that never include your arguments. `/plan`, `/setup`, and `/ask` ask clarifying questions until the task is unambiguous.

`/plan` uses local `HEAD` as the base and keeps delivery local and uncommitted.
Planning does not edit files, install dependencies, or mutate Git.

## Isolation variants

| Command | Isolation |
| :--- | :--- |
| `/plan:branch` | Local feature branch only; no worktrees |
| `/plan:worktree` | Separate local worktree; original checkout preserved |

Both keep the current model and require the same revisioned plan approval.

## Fix and improve

| Command | Focus |
| :--- | :--- |
| `/fix <issue>` | Diagnose in disposable storage and propose an evidence-backed repair |
| `/fix:quick <issue>` | Repair a small, well-defined issue directly |
| `/improve [scope]` | Standard audit across all areas |
| `/improve:quick` | Quick hotspot audit; no prompt required |
| `/improve:deep` | Broader package-scoped audit; no prompt required |
| `/improve:bugs` | Correctness and failure paths |
| `/improve:security` | Security and access control |
| `/improve:perf` | Performance and resource costs |
| `/improve:tests` | Test coverage and verification infrastructure |
| `/improve:debt` | Architecture and technical debt |
| `/improve:deps` | Dependencies and migrations |
| `/improve:dx` | Developer experience and tooling |
| `/improve:docs` | Documentation with concrete maintenance cost |
| `/improve:next` | Grounded product-direction options |

Run `/improve*` in `dev`. Audits are read-only and leave files unchanged. Selecting
findings is not implementation approval. The selected work still needs a plan and
approval. `/improve*` tasks retain task-scoped worker authority through nested
workflows.

`/fix` performs read-only discovery first, then investigative mutations only in
separately owned disposable storage. It never mutates the original checkout during
diagnosis. Repair execution defaults to the current checkout and local `HEAD`, and
starts only after approval.

`/fix:quick` authorizes a scoped local repair without a separate plan. It verifies
the issue and consults current documentation when relevant. If substantial
investigation or a larger change is needed, it stops and suggests `/fix`. It does
not use `/fix`'s disposable-diagnosis workflow or authorize commits or publishing.

## Delivery

| Command | Purpose | Gate |
| :--- | :--- | :--- |
| `/commit [scope]` | Propose coherent local commits | `approve c<N>` or `/approve` before staging or committing |
| `/commit:auto [scope]` | Create coherent local commits | Invocation authorizes scoped local commits |
| `/pr [:<base>] [draft]` | Commit task changes, push, and create or update a PR | Invocation authorizes the task-scoped PR flow |

`/commit` shows commit messages and per-commit file counts before it acts.
`/commit:auto` still stops for secrets, unclear ownership, or staged changes outside
a narrower scope. `/pr` defaults to `main`, rejects invalid arguments, and never
force-pushes, merges, deploys, or closes issues.

## Approvals

| Command | Purpose |
| :--- | :--- |
| `/approve [id] [brief]` | Send your approval reply for the single pending plan or commit gate |

Plan and `/commit` gates end with `Gate: <kind> <id>`: `r<N>` for plans, `c<N>` for
commit series. Reply `approve <id>` or run `/approve`. Bare `/approve` works only when
exactly one gate is pending and it is in the last assistant message with no changes
requested since. A stale, unknown, or mismatched ID authorizes nothing. The agent
states `Approved: <kind> <id>` and re-verifies scope before acting; changed scope
re-presents the gate with the next ID. `brief` applies to plan gates only. The PR offer
and `/commit:auto` do not use gates. Approval is instruction-driven, not a runtime
hook.

## Workers

| Command | Purpose |
| :--- | :--- |
| `/use:worker [task]` | Directly authorize task-scoped worker execution for the task |

`@worker` is the equivalent mention form. Explicitly invoking either command
authorizes worker execution for that task without a separate worker-use confirmation
prompt. That authorization covers additional workers for that task, not new scope,
and preserves implementation-plan, isolation, and delivery gates.

## Command-to-skill mapping

Most commands attach a skill through a trailing marker. The workflow file is
authoritative; these are the primary dependencies:

| Commands | Skill |
| :--- | :--- |
| `/ask`, `/quick`, `/fix:quick` | None |
| `/plan*` | `plan` |
| `/setup` | `setup` |
| `/fix` | `fix` |
| `/improve*` | `codebase-improve` |
| `/commit*` | `commit` |
| `/pr` | `pr` |
| `/use:worker` | `worker` |
| `/create:skill` | `create-skill` |

See the command files in
[`commands/`](https://github.com/devharshthakur/opencode/tree/main/commands) for exact
scope, constraints, and argument handling.
