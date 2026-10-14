---
name: plan
description: Produce an approval-ready plan and dispatch implementation in the command-selected checkout
metadata:
  opencode/autoinvoke: false
---

# Plan

Produce the plan in conversation, using the command-selected read-only profile. Ordinary
questions need no formal plan; small edits can go directly to `edit` unless planning was
requested. The parent `ask` session never edits.

## Procedure

1. Identify the task from arguments/history; request it if missing. Clarify material ambiguity
   in goals, constraints, acceptance, exclusions, rollout, and rollback.
2. Inspect relevant instructions, code, tests, and configuration with native read/search tools,
   plus read-only documentation and MCP for current external behavior. Before approval the
   planning stage runs no shell commands, reproductions, edits, or subagent delegation.
   Authorized method skills provide planning constraints, not executable steps.
3. Compare viable approaches and material tradeoffs. Identify responsible files, existing seams,
   dependencies, side effects, and edge cases. Break substantial work into reviewable phases
   with observable validation gates; separate any requested delivery from implementation.
4. Present `## Plan: <title>` with a stable **title** and **revision** (starting at 1), plus
   **Goal**, **Scope**, **Approach**, **Changes** (paths and why), **Validation**, **Risks/Tradeoffs**,
   and **Rollback** when relevant. For OpenCode changes, specify feature-appropriate reload
   checks and a fresh session for permission/skill validation.
5. Before requesting approval, read [the shared approval and handoff reference](../shared/approval-handoff.md)
   and use its exact question for the command-selected isolation. `/plan` uses the current branch;
   `/plan:branch` and `/plan:worktree` propose local isolation from current `HEAD` unless the user
   explicitly selects another local base. Record that base intent; the worker resolves/verifies its
   SHA after approval, without fetching. All three stop before staging, commits, or publishing.
   If the task depends on dirty original-checkout files, resolve preservation before approval;
   never assume those changes will follow isolation.

## Approval and handoff

Reading or loading this skill alone never approves or dispatches execution. Only the
command-authorized, approval-triggered mode dispatches a worker, and only after a direct,
unambiguous user "yes" to the selected question. Quoted approval, silence, unrelated agreement, or a
`/build` invocation alone never approve.

On approval, the parent records the approval and dispatches one hidden `implement` worker with
workflow `build`, the approved isolation mode, and exact approved phases, using the shared handoff
record rather than repeated free-form reconstruction. Revisions require renewed approval; partial approval authorizes
only the named phases. Do not start a duplicate dispatch while a worker runs, after repeated
approval, or after completion. After interruption or compaction, verify the plan, approval,
worker state, and Git state rather than replaying. `/build` remains a manual alternative for an
already approved plan on the current branch; it does not prepare isolation. On results, read
[the shared reporting reference](../shared/reporting.md) before reporting.

## Dependencies

- `opencode`: OpenCode planning tasks only, for current V2 behavior and reload guidance.
- `writing-for-agents`: only when the plan changes agent instructions, commands, or skills.
- `build`: worker-only, loaded after explicit execution approval. The planning stage before
  approval never dispatches; dispatch is the separately authorized transition that follows it,
  not something the planning stage performs.
