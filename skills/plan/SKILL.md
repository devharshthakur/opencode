---
name: plan
description: Create a detailed implementation plan and an explicit approval-bound handoff
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
   No implementation worker may run before approval. Read
   [exploration](references/exploration.md) when delegating substantial discovery.
2. Compare viable approaches. Challenge material assumptions with evidence and
   recommend an alternative when better; do not turn every task into an interview.
3. Produce the plan in conversation. Save a plan/checkpoint file only when
   explicitly requested, after its write is authorized. No tracker is required.

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

## Required plan

Use `## Plan: <stable title>` and a revision starting at 1. Include:

- **Goal/Scope:** current and desired behavior, exclusions, assumptions, open questions.
- **Approach:** decisions, alternatives, relevant interfaces and existing patterns.
- **Changes:** inspected paths and ordered edits; mark paths/evidence as current,
  not immutable. Small-model workers should not have to reconstruct the discussion.
- **Phases:** stable IDs, real prerequisites, concrete steps, observable acceptance.
  Prefer complete vertical slices where useful; avoid a task graph for trivial work.
  Wide compatibility changes may need expand/migrate/contract rather than fake green slices.
- **Validation:** exact repository checks, expected outcomes, required regression proof,
  known baseline limitations; distinguish planned checks from observed results.
- **Execution:** current/branch/worktree, intended local base, preservation decision,
  authorized operations and skill dependencies. No staging, commits, or publishing.
- **Risks/Tradeoffs** and **Rollback** when relevant. For OpenCode changes, specify
  feature-specific reload behavior and fresh-session validation.

For isolated plans, use local `HEAD` unless the user selects another local base.
The worker verifies its SHA after approval; no fetch. Resolve reliance on dirty
original-checkout work before approval; never assume it follows isolation.

## Approval and handoff

Read [approval/handoff](../shared/approval-handoff.md) before requesting approval.
Use its exact question for the selected isolation. Revisions require renewed
approval; partial approval authorizes only named phases. Dispatch exactly one
`implement` worker on direct approval, unless the user explicitly selects direct
execution. `/build` is the manual current-checkout alternative, not approval itself.

**Done when:** essential ambiguity is resolved and a complete revision is awaiting
approval, or an exact blocker is reported; the cleanup gate is accounted for with
verification or explicit blockers. Skill loading never approves execution.

## Dependencies

- `opencode`: OpenCode tasks, before relying on current V2 behavior.
- `writing-for-agents`: when designing changes to agent instructions, commands, or skills.
- `build`: execution only, after explicit approval, in the worker or explicitly selected direct mode.
