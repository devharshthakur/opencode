# Shared planning procedure

Use for `/plan*` and `/setup`. Stay in `dev` with the selected agent and model. The user may also ask for the optional `planner` subagent: send it a bounded brief, then ask the user its open questions yourself.
If invoked in `chat`, ask the user to select `dev`; do not switch for them.
Read narrowly. Use [bounded exploration](exploration.md) only when delegation
would avoid substantial reading in the parent.

Load `opencode` before relying on OpenCode V2 behavior; include reload behavior
and fresh-session validation for OpenCode changes. Load `writing-for-agents`
when designing changes to agent instructions, commands, or skills.

## Before approval

Inspect with native tools and bounded shell commands. Inspect unfamiliar
commands before running them. No repository writes, installs, checkout-writing
builds/tests, Git mutations (including fetch and isolation preparation), external
mutations, or implementation dispatch. Tool permissions and denials still apply.

When needed for discovery, reversible task-owned local services or containers
are allowed: load [cleanup](cleanup/SKILL.md) first; use disposable storage outside
the checkout, read-only repository mounts, local-only listeners, and no persistent
storage. Ask before privileged containers, host-wide impact, persistent storage, or
unclear side effects. Reconcile existing resources before restarting anything.
`/ask` and `explore` keep stricter limits.

## Clarification rounds

Goal: no ambiguity about what the user wants before a plan is drafted. Discover
facts first (code, docs, config, Git state); never ask what can be found. Then
ask about everything that remains open and could change scope, behavior, design,
acceptance, edge cases, risk, preservation, or authority: purpose, constraints,
preferences, naming, compatibility, and "done" criteria included. Do not assume
a default for an open choice the user owns.

Batch independent questions per round. Follow the [question style](../../AGENTS.md#question-style)
(native `question` tool, with the Markdown fallback). Answers can raise new
questions: run further rounds until none remain, asking a prerequisite first
only if its answer changes which questions apply. Treat prior answers and
command-fixed limits as settled. Record explicit delegation ("you decide") and
the selected result. Stop for unanswered material choices; do not draft an
approval-ready plan until they are resolved.

## Human-readable approval plan

Use this order. Start revision numbering at 1. Omit Risks only when there are
no material risks. Give each step an observable outcome and a stable ID; show
prerequisites where needed. Keep evidence and implementation detail in conversation,
not in a tracking file. Write a plan or checkpoint file only when explicitly
requested and authorized. Use `todowrite` for multi-step progress, not approval.

```markdown
## Plan: <stable title>
Revision: r<N>

**Goal and scope:** <outcome, boundaries, exclusions>
**Decisions:** <confirmed choices and material tradeoffs>
**Steps:**
- [ ] T1 <observable outcome>

**Validation:** <acceptance checks and known limits>
**Execution:** <checkout, local base, mode, preservation, operation limits>
**Risks:** <material risks and rollback if relevant>

<approval-handoff closing statement>
```

Before presenting the final draft, apply [cleanup](cleanup/SKILL.md), verify
planning-owned resources or disclose blockers, and follow
[approval-handoff](approval-handoff/SKILL.md) (plain-text approval, never the
`question` tool). Stop and wait. After approval, follow [execution](execution/SKILL.md):
direct in the current session by default. Load [agent-handoff](agent-handoff/SKILL.md)
for bounded discovery or authorized worker work. Preserve the exact approved
revision and scope. Local approval does not authorize staging, commits, or publishing.
