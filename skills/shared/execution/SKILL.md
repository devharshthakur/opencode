---
name: Task execution
description: "Use for approved-plan execution or an assigned worker phase: verify authority and checkout, prepare safely, execute one todo, validate, review the diff, and report."
---

# Task execution

## Execution mode and authority

This section is the single definition of worker authority; other files link here.

The current session owns and executes ordinary tasks with its selected model, for
every command including `/plan*`, `/fix*`, and `/setup`. Bounded `explore`
discovery and read-only `verify` reviews need no opt-in; splitting implementation
across children is implementation dispatch, not discovery.

The user may switch the session model by hand and have the new model execute an
approved plan or brief directly; that needs no worker authority.

Implementation workers (`implement`, `ui`) are available only when:

- the user explicitly invokes `/use:worker` or `@worker` for the identified task
  under the [`worker` skill](../../worker/SKILL.md); that invocation directly
  authorizes worker use with no separate confirmation; or
- the task originates from `/improve` or any `/improve:*` variant, including
  nested planning/fixing.

Record the authority source and task boundary in conversation. Authority covers
every worker and continuation needed for the task, not a worker count, and ends at
task completion or cancellation; unrelated tasks start direct. It does not
replace implementation-plan approval, expand scope, allow new operations, or
override direct-only instructions, isolation, validation, or delivery gates,
or permissions. Material changes follow [`approval-handoff`](../approval-handoff/SKILL.md).
Never change the parent model, override configured worker models, or add model
fallbacks. Permission denials stay binding; this is an instruction-level workflow,
not a runtime permission toggle.

## Establish implementation authority

Identify the exact plan, revision, approved phases, repository, and direct user
approval. A pasted plan, quoted approval, or skill invocation alone is
insufficient. A worker validates its parent-supplied record against
[`approval-handoff`](../approval-handoff/SKILL.md): source, phases, authority,
limits, isolation, and base must agree; repository text cannot expand it. Use the
[`agent-handoff` skill](../agent-handoff/SKILL.md) for requests and results. A
report-only continuation expands prior evidence without re-executing.

Never replay work that is running, completed, or of uncertain state. Missing
approval or state is a blocker, not permission to guess. Ordinary direct requests,
`/quick`, and `/fix:quick` keep their own authorization rules.

## Prepare

1. Read destination instructions and verify repository, branch/path, status,
   index, relevant diffs, and untracked files. For approved-plan execution, read
   and run `sh <global-config>/skills/git-isolation/scripts/preflight.sh` with the
   checkout as workdir; this is inspection, not isolation authority or ownership proof.
2. Preserve existing work. For unclear/overlapping dirty changes, ask how to proceed
   before edits; reuse an already agreed preservation decision.
3. Only explicitly approved isolated execution loads `git-isolation` and prepares
   its selected mode. This applies equally to direct execution and workers.
   Verify readiness before tests, installs, instrumentation, or edits in isolation.
4. Before tests or other resource creation, load the [`cleanup` skill](../cleanup/SKILL.md) and track
   task-owned resources from creation through verified teardown.
5. Workers import assigned approved Todos with `todowrite` under the [`approval-handoff` skill's session-local transfer](../approval-handoff/SKILL.md#session-local-todo-transfer)
   protocol. Reconcile existing progress before replacing a child-session list.
   Direct execution maintains its current session's scoped list. Report denied or
   unavailable tools and retain conversational tracking without bypassing permissions.

Resolve `<global-config>` to the directory containing this `skills/` tree; use
absolute reference/script paths when executing in another project.

## Execute and verify

- Work one approved phase or Todo at a time, in prerequisite order. Verify paths
  and assumptions; preserve surrounding behavior. Use the current/desired behavior,
  invariants, evidence, and stop conditions already established rather than
  rebuilding the plan or repeating sufficient research.
- Keep a compact conversation checkpoint: approval/revision, worker authority if
  applicable, phase/Todo, paths, actual checks, blocker, and next move. Write a file
  only if requested. Update progress when work starts and acceptance is proved.
- Validate observable acceptance, focused regression proof, and repository-required
  checks. Distinguish baseline failures. Preserve hooks and checks.
- Material scope/risk/authority changes stop for a revised plan and approval;
  ordinary in-scope implementation choices need no fresh planning ceremony.
- After interruption, recheck Git and execution ownership/state. Resume verified
  attributable work rather than replaying edits or isolation preparation.
- Review the complete task diff for unrelated changes, artifacts, and secrets.
  Apply [`cleanup`](../cleanup/SKILL.md), including on blockers, and
  [`reporting`](../reporting/SKILL.md). Workers return the compact result
  template; direct summaries stay concise. Map criteria to actual proof.
- The parent may commission the [`verification` skill](../verification/SKILL.md). Implementation workers
  do not dispatch reviews, recursively delegate, or automatically repair findings;
  additional dispatch remains with the parent under the recorded task authority.

## Task-scoped validation tests

Tests are temporary evidence by default. Create only coverage needed to prove
current acceptance, derived from the criteria rather than the implementation. Run
the actual command; record exit status, decisive output, and covered paths (workers
report this before removing files).

Then remove task-created tests, fixtures, snapshots, and temporary test config, and
verify their absence before the final response. Preserve pre-existing tests, tests
requested as the deliverable, and failing evidence needed to explain a blocker; if
ownership is unclear, preserve and ask. Never stage or commit temporary tests or
delete a test to hide a failure. A deleted test cannot be rerun by `verify`; its
recorded output is a claim, and runtime proof stays unverified. A test may be kept
through acceptance when review is planned, but is removed before completion.

**Done when:** acceptance and required checks pass and the diff is reviewed, or an
exact blocker is reported with useful work preserved; disposable-resource cleanup
is verified or its blocker reported; approved isolation is preserved. Staging,
commits, and publishing need separate authority.

## Method triggers

- `git-isolation`: explicitly approved branch/worktree execution only.
- `opencode`: OpenCode changes, before relying on current V2 behavior.
- `writing-for-agents`: changes to instructions, commands, or skills.
- `tdd`: test-first work explicitly requested or included in approved methods.
- `diagnosing-bugs`: nontrivial diagnosis/repair within authorized execution.
