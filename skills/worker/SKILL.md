---
name: worker
description: Request task-scoped worker execution with one approval
metadata:
  opencode/autoinvoke: false
---

# Worker opt-in

Use only when the user explicitly invokes `@worker` or `/use:worker`. A command
may load this skill for that explicit invocation; other workflows cannot invoke
it automatically to obtain worker authority. Preserve the current session/model.

## Identify the task and propose

1. Identify the current task, requested outcome, checkout, existing plan/revision,
   approval, and execution ownership. Ask for a task if none is identifiable.
   Reconcile running, completed, or uncertain worker state before proposing work.
   If this task already has valid worker authority (prior opt-in or `/improve*`
   origin), retain it without another worker-use prompt; implementation-plan and
   ownership checks still apply before executing.
2. Follow the originating command's planning and approval gates. If there is no
   sufficient plan, load `plan` using the skill tool and prepare one without implementing.
   Prepare detailed execution context for the
   [Markdown handoff](../shared/handoff.md): exact assignment, inspected evidence,
   ordered steps, acceptance/checks, preservation, isolation, and operation limits.
   The human sees a concise proposal, not the full worker brief.
3. If this task already has worker authority, skip the worker-use proposal/prompt;
   obtain only any still-required implementation-plan approval. Otherwise, name
   the task and that worker use covers additional workers needed within it.
   If implementation approval is also pending, include this worker-use proposal
   in that plan and use the shared [final-plan approval](../shared/approval-handoff.md)
   wording: one reply approves the plan and its stated worker execution mode.
   If the exact plan is already approved, ask only:

   > Ready to use workers for <task / approved revision and phases>. This covers additional workers within that task, with existing scope and operation limits unchanged. Reply `approve workers` to proceed, or describe changes.

   Replace the placeholder. A direct unambiguous approval also counts. Invocation
   alone, quoted approval, or agreement about an unrelated task does not. Stop
   and wait; never dispatch before that reply.

## Execute after approval

Record the actual approval and task boundary under
[execution](../shared/execution.md). Dispatch the configured `implement` worker
with the detailed approved handoff and checklist preflight. The parent orchestrates
additional workers and continuations as needed without another worker-use prompt;
each assignment stays within the approved task and carries its authority/evidence.
Keep implementation sequential and reconcile ownership before each dispatch.

Existing implementation, scope-change, isolation, delivery, and tool permission
gates remain binding. End worker authority at task completion/cancellation; return
to direct execution for unrelated tasks. Report actual acceptance evidence and
blockers concisely. No persistent configuration or model changes.

## Dependencies

- `plan`: when no sufficient implementation plan exists; preserve the originating
  command's stricter planning/approval gates and selected isolation.
