# Shared planning procedure

Use for `/plan*` and `/setup`. Stay in `dev` with the selected agent and model.
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
are allowed. Load [cleanup](cleanup/SKILL.md) before creating resources. Use
disposable storage outside the checkout, read-only repository mounts, local-only
listeners, and no persistent storage by default. Ask before privileged containers,
host-wide impact, persistent storage, or unclear side effects. Reconcile existing
resources before restarting anything. `/ask` and `explore` retain stricter limits.

## Decision sweep

Discover facts first. Batch independent unresolved choices that affect scope,
behavior, acceptance, risk, or authority. Treat prior answers and command-fixed
limits as settled; do not ask about discoverable facts. Ask a prerequisite first
only if its answer changes which questions apply. Record explicit delegation and
the selected result. Stop for unanswered material choices; do not draft an
approval-ready plan until those choices are resolved.

Prefer native `question` for compact batches: aim for at most four questions
and two to four concise options each. These are readability defaults, not tool
limits. Put the recommended option first and say why. If the batch needs long
descriptions, examples, or comparisons, or the form is unavailable, ask the whole
round in Markdown instead. Use stable IDs (`Q1`, `Q2`) and labeled choices
(`A`, `B`); invite a reply such as `Q1 B, Q2 A` or a custom answer, then end the
turn and wait. Do not duplicate a round across formats. A dismissal or partial
reply leaves unanswered choices open; clarify only those. A choice confirmation
is not implementation approval.

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
[approval-handoff](approval-handoff/SKILL.md). Keep approval in plain text.
Stop and wait. After approval, follow [execution](execution/SKILL.md): direct
in the current session by default. Load [agent-handoff](agent-handoff/SKILL.md)
when handing off bounded discovery or authorized worker work; use only the
applicable role material. Preserve the exact approved revision and scope.
Local implementation approval does not authorize staging, commits, or publishing.
