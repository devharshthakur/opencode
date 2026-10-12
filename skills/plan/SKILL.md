---
name: plan
description: Produce an approval-ready plan for an explicitly requested planning workflow
metadata:
  opencode/autoinvoke: false
---

# Plan

Produce the plan in conversation, using the command-selected read-only profile. Ordinary
questions need no formal plan; small edits can go directly to `edit` unless planning was requested.
This stage uses discovery and documentation only: no shell, delegation, edits, or delivery.

## Procedure

1. Identify the task from arguments/history; request it if missing. Clarify material ambiguity
   in goals, constraints, acceptance, exclusions, rollout, and rollback.
2. Inspect relevant instructions, code, tests, and configuration with native read/search tools.
   Use official web documentation when external behavior matters; the planner denies MCP and
   Code Mode. Authorized method skills provide planning constraints, not executable steps.
3. Compare viable approaches and material tradeoffs. Identify responsible files, existing seams,
   dependencies, side effects, and edge cases. Break substantial work into reviewable phases
   with observable validation gates; separate any requested delivery from implementation.
4. Present `## Plan: <title>` with **Goal**, **Scope**, **Approach**, **Changes** (paths and why),
   **Validation**, **Risks/Tradeoffs**, and **Rollback** when relevant. For OpenCode changes,
   specify feature-appropriate reload checks and a fresh session for permission/skill validation.
5. End with: `After explicit approval, use /build to implement this plan with edit.` and
   `**Approve this plan? If not, type requested changes.**`

**Done when:** the plan identifies acceptance, intended changes, checks, and material risks,
and approval has been requested. Approval must identify the plan or phase explicitly; quoted
approval, silence, or an ambiguous reply is insufficient. Approval does not start execution:
remain read-only until a separate `/build` transition. These planning restrictions end with
this stage; they do not constrain later approved execution.
