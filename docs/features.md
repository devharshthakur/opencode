# Agents, commands, and skills

## Agents

`dev` and `chat` are primary agents. Workers run as subagents. Agent and model
selection are independent; commands preserve the current session model.

| Agent | Mode | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `dev` | Primary, default | Project work and command workflows | Allow-all; configured permissions still apply |
| `chat` | Primary | Conversation and external research | No project tools |
| `explore` | Worker | Bounded code discovery | Read-only; no shell, edits, or secret-bearing config |
| `implement` | Worker | Approved implementation brief | No recursive delegation |
| `ui` | Worker | UI implementation | Read/edit, shell, web, skills, image generation; sensitive files denied |
| `verify` | Worker | Independent change review | Read-only; no shell, edits, tests, or delegation |

Models are configured in agent frontmatter and `opencode.sample.jsonc`. Frontmatter
pins override `agents.<id>.model`. Use `/models` to select the session model.

## Commands

### Ask, plan, and build

| Command | Purpose |
| :--- | :--- |
| `/ask <question>` | Read-only project answer |
| `/quick <task>` | Execute directly without a planning gate |
| `/plan <task>` | Plan, then implement after approval |
| `/setup <sources...>` | Plan setup from docs, URLs, attachments, or skills |
| `/create:skill <idea or context>` | Design a local skill before writing it |

### Fix and improve

| Command | Purpose |
| :--- | :--- |
| `/fix <issue>` | Diagnose in disposable storage and propose an evidence-backed repair; implementation isolation may be explicitly requested |
| `/improve [scope]` | Audit, select findings, then plan approved work |
| `/improve:quick` / `/improve:deep` | Hotspot / broader package audit |
| `/improve:bugs` / `/improve:security` / `/improve:perf` | Correctness / security / performance |
| `/improve:tests` / `/improve:debt` / `/improve:deps` | Tests / architecture / dependencies |
| `/improve:dx` / `/improve:docs` / `/improve:next` | Tooling / documentation / product direction |
| `/plan:branch` / `/plan:worktree` | Plan with approved branch/worktree isolation |

Run `/improve*` in `dev`. Audits are read-only; selecting findings is not
implementation approval.

### Ship

| Command | Purpose |
| :--- | :--- |
| `/commit [scope]` | Propose coherent local commits for approval |
| `/commit:auto [scope]` | Create coherent local commits with explicit authorization |
| `/pr [:<base>] [draft]` | Commit task changes, push, and create or update a GitHub PR |

### Workers

`/use:worker [task]` or `@worker` requests worker execution for the current task.
Neither invocation dispatches a worker; worker approval is required. See
[worker flow](workflow.md#workers).

## Skills

| Area | Skills |
| :--- | :--- |
| Workflow | `plan`, `fix`, `worker`, `git-isolation` |
| Delivery | `commit`, `pr`, `shared/pr-offer` |
| Shared policy | `shared/execution`, `shared/approval-handoff`, `shared/agent-handoff`, `shared/verification`, `shared/cleanup`, `shared/reporting` |
| Tools | `create-skill`, `smoke-test`, `tanstack-cli`, `codebase-improve` |

Command files in [`commands/`](../commands/) and skill files in
[`skills/`](../skills/) are the authoritative references.
