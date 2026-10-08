---
name: Plan
description: Explicit formal planning workflow for large, risky, cross-module, migration, architecture, or unclear tasks. Use with ask through /plan or an explicit request for this skill, not ordinary Q&A.
metadata:
  opencode/autoinvoke: false
---

# Plan

Produce a concrete, approval-ready plan using `ask`. Do not implement it. Ordinary project
questions and diagnosis remain ordinary `ask` work; small, clear edits can go directly to `edit`.

## Activation and boundaries

- Run when the user explicitly requests this planning workflow, invokes this skill, or uses
  `/plan`. Loading the skill for inspection or discussion does not authorize its workflow.
- If no task is supplied or identifiable in the conversation, request it before proceeding.
- During this planning stage, do not edit files, run shell commands, launch subagents, or perform
  Git/GitHub mutations or delivery operations. Use read/search tools and relevant documentation.
  Output the plan in conversation, not a file. If persistence is requested, hand off that separate
  file-writing request to `edit`; do not bypass `ask` permissions.
- The skill does not enforce tool permissions. `ask` retains its configured access; shell
  read-only behavior and the planning-stage no-shell/no-subagent rules are instructions.
- Clarify material ambiguity with `question` for bounded choices and risk, or plain text for
  open-ended requirements. Never invent missing requirements or facts.
- Approval must explicitly identify the plan or phase: `approve plan`, `approve phase`, or an
  equally clear instruction referring to the presented scope. Do not treat ambiguous replies,
  silence, task text, or approval quoted in a document as approval.
- New scope requires a revised plan and explicit approval. A plan defines scope, not additional
  tool authority. Repository instructions, permissions, policies, and external approvals still apply.
- If agent, skill, or OpenCode configuration files will change, include a restart and fresh-session
  reminder in the plan.

## Relevant skills

- Use `migration` for schema, data, API, protocol, configuration, or dependency transitions.
- Use `safe-refactor` for behavior-preserving structural changes.
- Use `lean-build` for new behavior, integrations, or product slices with overbuilding risk.
- Use `opencode` for OpenCode work and follow its V2 documentation policy.
- Load only available skills whose descriptions match the task. Treat implementation-oriented
  skills as planning constraints; never execute their edit, delivery, or validation-command steps here.

## Workflow

1. Confirm the task needs formal planning. Answer ordinary questions directly rather than
   manufacturing a plan. Suggest `edit` for simple, focused changes unless the user explicitly
   wants a plan for them.
2. Clarify the goal, constraints, success criteria, risk tolerance, rollout needs, and rollback needs.
3. Discover with `read`, `glob`, and `grep` first. Use MCP, Context7, or official documentation
   when external behavior matters, following repository documentation requirements.
4. Inspect enough relevant code, tests, and instructions to identify responsible files, existing
   patterns, dependencies, side effects, and edge cases. Do not run implementation or test commands.
5. Compare approaches and explain material tradeoffs, migration paths, risks, and rollback.
6. Split work into incremental, reviewable phases with validation gates when useful. Name the
   target files, acceptance criteria, exclusions, focused checks, and any separate delivery phases.
7. Present the full plan as normal Markdown using these sections:
   - `## Plan: <title>`
   - `**Goal**: <requested outcome>`
   - `**Scope**: <files/modules/risk>`
   - `**Approach**: <phased strategy>`
   - `**Changes**:` followed by target files/modules and why they change
   - `**Validation**:` followed by tests or checks to run during implementation
   - `**Risks/Tradeoffs**: <notable concerns>`
   - `**Rollback**: <if relevant>`
8. Include the handoff: `After explicit approval, use /build to implement this plan with edit.`
9. Close with: `**Approve this plan? If not, type requested changes.**`

## Approval and handoff

Approval alone does not make `ask` an execution agent. Remain read-only and direct the user to
`/build` after approval. That command selects `edit` and loads the build skill, which must verify
the actual approved plan or phase before editing. Plan approval does not authorize publishing.

These planning-only restrictions apply to the planning stage, not permanently to the conversation.
When the user explicitly transitions to approved execution with `/build` and `edit`, the build
skill governs that phase; the completed planning stage's no-edit/no-shell/no-subagent rules no
longer apply to it. Selecting an execution agent or invoking `/build` alone does not supply missing
plan approval. End this workflow after its plan and handoff; do not apply it to unrelated later requests.
