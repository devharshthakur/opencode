---
name: worker
description: Authorize task-scoped worker execution directly via explicit invocation
metadata:
  opencode/autoinvoke: false
---

# Worker opt-in

Use only when the user explicitly invokes `/use:worker` or `@worker`. That
explicit user invocation directly authorizes task-scoped worker execution—do not
ask for a separate worker-use confirmation (`approve workers`). A command or
other workflow cannot invoke this skill automatically to grant itself worker
authority. Preserve the current session/model.

## Identify the task and prepare

1. Identify the current task, requested outcome, checkout, existing plan/revision,
   approval, and execution ownership. Ask for a task if none is identifiable.
   Reconcile running, completed, or uncertain worker state before dispatching work.
   Record active task-scoped worker authority from the user's explicit
   `/use:worker` or `@worker` invocation (or retain existing `/improve*` / prior
   opt-in authority).
2. Follow the originating command's planning and approval gates. If there is no
   sufficient approved plan yet, load `plan` using the skill tool and prepare one
   without implementing. State in the plan that worker authority is already active
   for this task from the user's explicit `/use:worker` or `@worker` invocation,
   and request only the required implementation-plan approval (`approve r<N>`).
   Prepare detailed execution context for the
   [`agent-handoff` skill](../shared/agent-handoff/SKILL.md): exact assignment,
   inspected evidence, ordered steps, acceptance/checks, preservation, isolation,
   and operation limits. The human sees a concise plan, not the full worker brief.
3. If the exact plan is already approved and ownership/state is reconciled,
   proceed directly to worker dispatch without asking for another worker-use
   confirmation.

## Execute with worker authority

Record the explicit invocation, plan approval, and task boundary under
the [`execution` skill](../shared/execution/SKILL.md). Dispatch the configured `implement` worker
with the detailed approved handoff and checklist preflight. The parent orchestrates
additional workers and continuations as needed without another worker-use prompt;
each assignment stays within the approved task and carries its authority/evidence.
Keep implementation sequential and reconcile ownership before each dispatch.

Existing implementation-plan, scope-change, isolation, delivery, and tool permission
gates remain binding. End worker authority at task completion/cancellation; return
to direct execution for unrelated tasks. Report actual acceptance evidence and
blockers concisely. No persistent configuration or model changes.

## Dependencies

- `plan`: when no sufficient implementation plan exists; preserve the originating
  command's stricter planning/approval gates and selected isolation.
