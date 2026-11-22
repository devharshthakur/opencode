# Workers

The current session owns work by default. Workers are subagents for bounded
discovery, implementation, UI work, and independent review. They are not session
modes.

## Worker roles

| Worker | Purpose | Access |
| :--- | :--- | :--- |
| `explore` | Bounded code discovery with `path:line` evidence | Read-only; no shell, edits, or secret-bearing config |
| `implement` | Execute an approved implementation handoff | Scoped edits and checks; no delegation |
| `ui` | Build UI using existing project conventions | Read, edit, shell, web, skills, image generation; sensitive files denied |
| `verify` | Independently review actual changes | Read-only; no shell, edits, tests, or delegation |

Workers run on their configured models. Model and agent selection stay independent
from the session's selected model. See [Agents](../reference/agents.md) for the
current pins and permissions.

## When worker use is allowed

Read-only helpers do not need a separate opt-in:

- Bounded `explore` discovery.
- Read-only `verify` review.

Full implementation delegation requires one of:

1. An explicit user `/use:worker` or `@worker` invocation for the named task (which
   directly authorizes worker use without a second confirmation prompt).
2. A task that originates from `/improve` or an `/improve:*` variant.

A command or skill cannot invoke `worker` automatically to grant itself worker
authority, and implementation-plan approval still applies if no plan is approved yet.

> [!IMPORTANT]
> Worker approval covers the workers needed for the named task, not new scope or new
> operations. It ends when the task completes or is cancelled.

## Handoff lifecycle

1. The parent settles the plan and records the approved revision and phases.
2. The parent preflights an implementation brief: identity, scope, boundaries,
   acceptance, checks, and stop conditions.
3. The worker executes one phase at a time and returns a self-contained Markdown
   result with acceptance evidence and actual checks.
4. The parent reviews the evidence and keeps the acceptance decision.

Worker reports are evidence, not automatic acceptance. Missing proof stays visible.
Implementation workers do not dispatch reviews or repair their own findings without
parent authorization.

## Operating limits

Workers inherit the task's scope, preservation decisions, operation limits, and
isolation mode. They must also honor:

- Tool permission denials.
- Destructive-operation confirmations.
- Separate gates for staging, commits, pushes, pull requests, and deployment.
- The prohibition on recursive delegation for `implement`.

If ownership or state is unclear, the worker stops and returns the exact blocker.
Uncertain work is never replayed.

## Reading a worker result

| Section | What to check |
| :--- | :--- |
| Identity and status | Request ID, task ID, role, plan revision, and completion state |
| Acceptance evidence | Each criterion mapped to observed proof |
| Actual validation | Commands, results, and baseline distinctions |
| Preservation and scope | Checkout, dirty files, and complete diff review |
| Cleanup | Removed or retained resources, with verification |
| Continuation | Attributable session, remaining steps, and next safe action |

See the [handoff contract](https://github.com/devharshthakur/opencode/blob/main/skills/shared/agent-handoff/SKILL.md)
and the [worker opt-in skill](https://github.com/devharshthakur/opencode/blob/main/skills/worker/SKILL.md)
for the authoritative rules.
