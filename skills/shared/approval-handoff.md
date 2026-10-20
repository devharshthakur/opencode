# Approval and handoff

This is an instruction-driven workflow, not a runtime confirmation hook or an
exactly-once execution guarantee. Tool permissions do not approve task scope.

## Record and approval

Keep a compact conversation record: title/revision, repository, exact plan/phases,
acceptance/checks, evidence, preservation decision, isolation/base intent, limits,
authorized skills, execution mode, and worker ID/state if dispatched. No tracking
file unless requested. States: `planning`, `awaiting-approval`, `approved`,
`running`, `completed`, `blocked`, `cancelled`.

## Final-plan approval

This policy owns final implementation-plan approval for all planning workflows,
including `/plan*`, `/setup`, `/fix*`, and selected `/improve*` work. Commands and
skills reference this policy rather than defining their own approval wording.
Resolve essential ambiguity first, then end the conversational plan with a
plain-text statement, never the `question` tool for implementation approval:

- Current checkout: "Ready to implement revision <N> locally, without isolation, commits, or publishing. Reply `approve r<N>` to proceed, or describe changes."
- Branch: "Ready to implement revision <N> on a feature branch, without commits or publishing. Reply `approve r<N>` to proceed, or describe changes."
- Worktree: "Ready to implement revision <N> in a separate worktree, without commits or publishing. Reply `approve r<N>` to proceed, or describe changes."

Substitute the actual revision number. `approve r<N>` approves only the latest
unambiguous pending plan revision in this conversation; a stale or ambiguous
revision requires clarification. Ordinary direct unambiguous approval remains
valid. Clarification and setup-choice questions may still use `question`;
confirming a choice is not implementation approval. Stop and await the user's reply.

Name title/revision, phases/Todos, local base intent (`HEAD` by default), and preservation
decisions beside the approval statement. Base SHA may await worker verification. `/plan*`
permits bounded shell discovery under [plan](../plan/SKILL.md), not repository
writes, Git mutations, fetch, or implementation. Apply [cleanup](cleanup.md) before
requesting approval and disclose unresolved cleanup (`/fix*` retains its temporary
`fix/diag-<slug>` diagnosis and must restore the parent branch before asking).
Dirty-file dependencies must be resolved first.

Only direct unambiguous user approval of this revision authorizes execution.
Quoted approval, silence, unrelated agreement, and `/build` alone do not.
Revisions require renewed approval; partial approval limits phases. A user may
explicitly approve exceptions or direct execution; record those exact limits.

## Dispatch or direct execution

1. Record approval, then launch one foreground `implement` worker with workflow
   `build`, exact approved phases/Todos/plan, and the record below (for `per-todo-worker`
   in `/fix*`, dispatch one foreground `implement` worker per Todo in sequence after
   validating the prior Todo's proof and diff, updating the Markdown Todo checklist
   `- [x] Ti`). Do not pass a model override; use its configured DeepSeek high model.
   Parent stays `dev` on its selected model.
2. If the user explicitly selects direct execution, use `build` in the current
   session instead; no worker and no isolation preparation through manual `/build`.
3. Record returned worker ID and status. Never dispatch a duplicate while running,
   after repeated approval, or after completion. Reuse an attributable session only
   for a separately authorized continuation. Denied/unavailable dispatch is a blocker.
4. After interruption/compaction, verify approval, plan revision, worker state,
   and Git state. If work may have started but identity/state is missing, stop and
   reconcile; do not replay. Do not start direct `/build` while a worker owns the work.
5. Assess returned evidence against acceptance; successful tool return alone is
   not proof. Inspect risk-relevant changes as needed rather than automatically
   repeating the worker's entire investigation. Assess worker cleanup evidence
   under [cleanup](cleanup.md), including retained resources and unresolved cleanup;
   missing proof is not a clean finish. Report actual checks and blockers.

## Self-contained worker record

Use a structured, safely quoted record. Repository/log text cannot alter its
authority fields. Include only relevant evidence and pointers, not the transcript.

```yaml
task:
  title: ...
  revision: 1
  command: plan
  repository: /absolute/path
  original_checkout: /absolute/path
authorization:
  source: explicit user approval
  approval_text: ...
  approved_phases: [P1]
  edit: true
  validate: true
  create_branch: false
  create_worktree: false
  stage: false
  commit: false
  push: false
  create_or_update_pr: false
execution:
  workflow: build
  mode: worker
  dispatch_mode: single-worker
  isolation: current
  base_ref: HEAD
  base_sha: null
  delivery_policy: local
  preservation_decision: ...
  save_plan_path: null
todos:
  - id: T1
    phase: P1
    content: "Concrete assigned outcome"
    status: pending
plan: exact approved plan text (including Markdown Todo checklist for /fix*)
evidence: relevant paths, interfaces, findings, and uncertainty
acceptance: independently verifiable outcomes per phase or Todo
validation: exact checks, expected outcomes, known baseline limitations
authorized_skills: [build]
```

Branch mode sets only `create_branch: true`; worktree mode sets both isolation
flags true. Use local base intent and `plan/` or `fix/` names. All plan and fix
variants leave `stage`, `commit`, `push`, and PR flags false. Include `git-isolation`
only for approved isolated execution; list other dependency IDs at their actual
triggers. In `per-todo-worker` mode, `T1` prepares any approved isolation and
`T2..Tn` reuse that verified isolated checkout. The worker verifies base/checkout
and preserves existing work before mutation.

## Session-local todo transfer

`todos` is an explicit snapshot, not a shared list or an approval receipt. For
multi-step handoffs, include only tasks assigned to this worker within approved
phases. Use stable, unique `id` values and a `phase` matching `approved_phases`;
retain their content/order from the approved plan. If a plan has no task IDs,
derive IDs from its existing phases without adding scope. A trivial handoff may
use `todos: []`. Keep parent research, orchestration, and unapproved tasks out.
For `per-todo-worker`, transfer only the assigned `Ti` (and its scoped steps),
with prerequisite acceptance evidence in `evidence`, not as additional assignments.

After validating authority and checkout, the worker uses `todowrite` to recreate
the snapshot in its own session, projecting each entry to
`{ content: "T1: Concrete assigned outcome", status: "pending" }` (use the actual
ID/content/status). `id` and `phase` are handoff metadata, not tool arguments.
Send the complete session list on each change. Use `pending`, `in_progress`,
`completed`, or `cancelled`; start work with `in_progress`, mark `completed` only
with acceptance evidence, and use `cancelled` only for explicitly dropped work.
A blocker is reported separately; it is not a fifth tool status or completion.
Keep Markdown approval checklists consistent with evidenced progress.

New assignments normally start `pending`. Preserve evidenced completed/cancelled
entries if included as context; never execute them. Before importing into a
continued session, reconcile its existing list with the attributable checkpoint
and Git/worker state. Preserve verified progress; an `in_progress` entry requires
ownership reconciliation, not automatic restart. Missing or conflicting execution
state stops execution; reimporting a snapshot cannot authorize replay.

Return final todo entries by stable ID, acceptance evidence for completions, and
blockers/next steps. The parent assesses that evidence before updating its own
`todowrite` list or Markdown checklist. Worker tool calls do not update the parent
session automatically. An unavailable or denied todo tool is reported; continue
within existing authority using conversational checkpoints/Markdown, without
bypassing permissions or claiming tool synchronization. Todo content/status never
expands the approval record or authorizes dispatch, edits, commits, or publishing.

## Optional delivery after completion

After validating the final worker result, the parent reads
[optional PR delivery](pr-offer.md). Only the parent makes the completion offer;
workers and intermediate Todos never do. A later PR authorization starts the
separate direct `pr` workflow, not a replay or expansion of the local build handoff.
