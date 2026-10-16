# Approval and handoff

This is an instruction-driven workflow, not a runtime confirmation hook or an
exactly-once execution guarantee. Tool permissions do not approve task scope.

## Record and approval

Keep a compact conversation record: title/revision, repository, exact plan/phases,
acceptance/checks, evidence, preservation decision, isolation/base intent, limits,
authorized skills, execution mode, and worker ID/state if dispatched. No tracking
file unless requested. States: `planning`, `awaiting-approval`, `approved`,
`running`, `completed`, `blocked`, `cancelled`.

Resolve essential ambiguity before asking. Use `question` when available:

- `/plan` and `/fix`: "Approve and implement this plan locally, without isolation, commits, or publishing?"
- `/plan:branch` and `/fix:branch`: "Approve and implement this plan on a feature branch, without commits or publishing?"
- `/plan:worktree` and `/fix:worktree`: "Approve and implement this plan in a separate worktree, without commits or publishing?"

Name title/revision, phases/Todos, local base intent (`HEAD` by default), and preservation
decisions beside the question. Base SHA may await worker verification; never run
shell or fetch during `/plan*` planning (`/fix*` may run only its temporary
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
   repeating the worker's entire investigation. Report actual checks and blockers.

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

## Optional delivery after completion

After validating the final worker result, the parent reads
[optional PR delivery](pr-offer.md). Only the parent makes the completion offer;
workers and intermediate Todos never do. A later PR authorization starts the
separate direct `pr` workflow, not a replay or expansion of the local build handoff.
