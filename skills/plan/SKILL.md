---
name: plan
description: Plan direct execution, with a detailed handoff when workers are authorized
metadata:
  opencode/autoinvoke: false
---

# Plan

Preserve the current model. Request a missing task; clarify essential ambiguity.
Use this workflow in `dev`. If invoked in `chat`, ask the user to select `dev`
without silently switching the model or broadening chat's permissions.

## Discover and design

1. Read relevant instructions, configuration, code, and tests. Use native reads,
   search, documentation, and bounded shell discovery under the rules below.
   An `explore` call stays read-only; parent `dev` performs shell operations.
   Keep implementation in the current session by default under
   [execution](../shared/execution.md); bounded helpers do not transfer task ownership.
   No implementation may run before approval. Read
   [exploration](references/exploration.md) when delegating substantial discovery.
   Reuse sufficient worker evidence rather than reopening citations routinely.
2. Compare viable approaches. Challenge material assumptions with evidence and
   recommend an alternative when better; do not turn every task into an interview.
3. Produce the plan in conversation. Save a plan/checkpoint file only when
   explicitly requested, after its write is authorized. No tracker is required
   on disk; use session-local `todowrite` for multi-step progress. Planning todos
   track discovery, not permission to execute. Transfer assigned execution todos
   only after approval under the shared handoff protocol.

## Planning shell boundary

Shell inspection and reversible, task-scoped local containers/services are allowed
when directly needed for discovery, without separate confirmation for each start.
Read [cleanup](../shared/cleanup.md) before resource creation and keep its ownership
checkpoint. Incidental runtime files belong only in disposable task-owned storage
outside the checkout; keep repository files unchanged. Use read-only repository
mounts if needed, local-only listeners, and no persistent storage by default.

Before implementation approval: no source/config edits, installs, checkout-writing
builds/tests, Git mutations (including fetch or isolation preparation), or external
mutations. Inspect unfamiliar commands/scripts before running them; a test or
inspection label is not proof of no writes. Ask first for privileged containers,
host-wide changes, persistent storage, or unclear side effects. Tool permission
prompts and denials remain binding. Starting a service never grants implementation
authority. `/ask` and `explore` retain their own read-only restrictions.

Clean up and verify planning-owned resources before presenting the approval-ready
plan or reporting a blocker; disclose any incomplete cleanup. Reconcile interrupted
resources rather than replaying startup. This is instruction-based, not a sandbox.

## Human-readable approval plan

Write the user-facing plan for a human deciding whether to approve or change it,
not for a worker executing edits. Use `## Plan: <stable title>` and a revision
starting at 1. Adapt headings, grouping, and length to the task. Include:

- **Goal and boundaries:** what changes, why it matters, what stays unchanged,
  and meaningful exclusions.
- **Approach and phases:** plain-language outcomes in execution order, with stable
  phase/Todo IDs. Explain consequential choices and dependencies, not each code edit.
- **Success and validation:** observable acceptance criteria and how they will be
  checked; disclose known validation limits. Summarize checks in human terms.
- **Decisions and risks:** tradeoffs, assumptions needing agreement, open questions,
  and rollback when relevant. Resolve essential ambiguity before approval.
- **Execution boundaries:** checkout/isolation, local base intent, preservation of
  existing work, and operation limits. No staging, commits, or publishing.

Default to the shortest plan that lets the user understand the whole proposal and
suggest changes. Omit code snippets, line-by-line edits, exhaustive file lists,
raw evidence, and command inventories unless they affect the user's decision or
the user requests them. Keep material risks and scope visible; brevity must not
hide a consequential choice. Add technical depth on request, not automatically.

## Execution detail and optional agent handoff

Keep sufficient execution detail in conversation for direct execution. Only when
worker dispatch is authorized under [execution](../shared/execution.md), prepare the detailed
[Markdown handoff](../shared/handoff.md) from the approved human plan and relevant
evidence. Preserve its revision, assigned phases, outcomes, fixed decisions,
acceptance, and limits; label execution detail separately from the approved plan.
The user-facing plan and subagent handoff serve different audiences; do not show
the execution brief merely to obtain approval.

Include current/desired behavior, inspected paths/symbols, ordered implementation
steps, invariants, dependencies, exact validation commands/expected results,
baseline limitations, skill triggers, and worker discretion where relevant.
Mark source evidence as current, not immutable. The worker should not have to
reconstruct the conversation or repeat sufficient research. Reuse decisive evidence
with provenance rather than copying the transcript. Local implementation detail
may elaborate approved work; new scope or material decisions require renewed
approval. For OpenCode changes, include feature-specific reload behavior and
fresh-session validation in the execution brief; surface user-relevant effects in
the human plan.

For isolated plans, use local `HEAD` unless the user selects another local base.
The executor verifies its SHA after approval; no fetch. Resolve reliance on dirty
original-checkout work before approval; never assume it follows isolation.

## Approval and handoff

Read and follow [approval/handoff](../shared/approval-handoff.md) for final-plan
approval and execution handoff, using the selected isolation and actual revision.

**Done when:** essential ambiguity is resolved and a complete revision is awaiting
approval, or an exact blocker is reported; the cleanup gate is accounted for with
verification or explicit blockers. Skill loading never approves execution.

## Dependencies

- `opencode`: OpenCode tasks, before relying on current V2 behavior.
- `writing-for-agents`: when designing changes to agent instructions, commands, or skills.
- [execution](../shared/execution.md): after explicit approval, directly by default;
  preserve task-scoped worker authority from explicit opt-in or `/improve*` origin.
