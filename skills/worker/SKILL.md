---
name: worker
description: Authorize task-scoped worker execution directly via explicit invocation
metadata:
  opencode/autoinvoke: false
---

# Worker opt-in

Use only when the user explicitly invokes `/use:worker` or `@worker`. That
invocation directly authorizes task-scoped worker execution under the
[`execution` skill](../shared/execution/SKILL.md#execution-mode-and-authority),
which defines the authority rules; do not ask for a separate confirmation. No
command or workflow may invoke this skill to grant itself authority. Keep the
current session and model.

1. Identify the task, outcome, checkout, existing plan/revision, approval, and
   execution ownership; ask for a task if none is identifiable. Reconcile
   running, completed, or uncertain worker state before dispatching. Record the
   authority source.
2. Follow the originating command's planning and approval gates. If no sufficient
   approved plan exists, load `plan`, prepare one without implementing, state that
   worker authority is already active, and request only `approve r<N>` through the gate prompt. Prepare the
   detailed worker brief for the [`agent-handoff` skill](../shared/agent-handoff/SKILL.md);
   the user sees only the concise plan.
3. Once the exact plan is approved and ownership is reconciled, dispatch the
   configured `implement` worker (or `ui` for UI work) with the approved handoff.
   Dispatch sequentially, reconcile ownership before each, and add workers or
   continuations as the task needs without another prompt.

Plan approval, scope-change, isolation, delivery, and permission gates stay
binding. Worker authority ends at task completion or cancellation; unrelated tasks
run directly. No persistent configuration or model changes.
