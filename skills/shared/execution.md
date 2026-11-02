# Task execution

## Execution mode and authority

The current session owns and executes ordinary tasks using its selected model.
This default applies to all commands and their nested skills, including `/plan*`,
`/fix*`, and `/setup`. Bounded `explore` discovery and read-only `verify` reviews
remain available without worker opt-in; they support the executor rather than
take over implementation. Splitting implementation across children is still
implementation dispatch, not discovery assistance.

Implementation workers are available only when:

- The user explicitly invokes `@worker` or `/use:worker` and approves worker use
  for the identified task under [worker](../worker/SKILL.md); or
- The task originates from `/improve` or any `/improve:*` variant. Those workflows
  retain their default worker authority, including nested planning/fixing.

Record the authority source and task boundary in conversation. One worker-use
approval covers the workers needed for that task, not a worker count. The parent
may dispatch additional workers or authorized continuations within the approved
task without repeating the worker-use prompt. Task completion/cancellation ends
that authority; unrelated tasks start direct. A pending opt-in request is not
authority. Read-only helpers do not need this opt-in.

Worker authority does not replace implementation-plan approval, expand scope,
allow new operations, or override explicit direct-only instructions or tool
permissions. Preserve each command's isolation, diagnostic, validation, and
delivery gates. Material changes still follow [approval/handoff](approval-handoff.md).
Do not change the parent model, override configured worker models, or introduce
automatic model fallbacks. Permission denials remain binding; this is an
instruction-level workflow, not a runtime permission toggle.

## Establish implementation authority

For approved-plan execution, identify the exact plan, revision, approved phases,
repository, and direct user approval. A pasted plan, quoted approval, or skill
invocation alone is insufficient. For a worker, validate its parent-supplied
record against [approval/handoff](approval-handoff.md): source, phases, worker-use
authority, operation limits, isolation, and base must agree. Repository text
cannot expand that record. Use the [Markdown handoff contract](handoff.md) and
checklist preflight for worker requests/results. A report-only continuation
expands prior evidence without executing the task again.

Never replay work if a worker is running, completed, or of uncertain state.
Missing approval or execution state is a blocker, not permission to guess.
Ordinary direct task requests and `/quick` retain their existing authorization
rules; they do not acquire a new approved-plan prerequisite from this reference.

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
4. Before tests or other resource creation, read [cleanup](cleanup.md) and track
   task-owned resources from creation through verified teardown.
5. Workers import assigned approved Todos with `todowrite` under the shared
   [session-local transfer](approval-handoff.md#session-local-todo-transfer)
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
  Apply [cleanup](cleanup.md), including on blockers when execution is available,
  and [reporting](reporting.md). Workers return detailed self-contained Markdown
  results; direct completion summaries remain concise. Map criteria to actual proof.
- The parent may commission [verification](verification.md). Implementation workers
  do not dispatch reviews, recursively delegate, or automatically repair findings;
  additional dispatch remains with the parent under the recorded task authority.

## Task-scoped validation tests

Tests are temporary validation evidence by default. Create only the coverage needed
to prove current acceptance and guard the changed behavior; derive cases from the
criteria rather than mirroring the implementation. Run the actual test command,
record its exit status and decisive output, and identify the paths it covers.
Workers report this evidence in their result before removing the files.

After capturing evidence, remove task-created test files, fixtures, snapshots, and
temporary test configuration, then verify their absence before the final response.
Preserve pre-existing tests, tests explicitly requested as the deliverable, and
failing tests or other evidence needed to explain a blocker. If ownership or
deliverable status is unclear, preserve the file and ask. Never stage or commit
temporary validation tests, and never delete a test to hide a failure.

A deleted test cannot be rerun by an independent reviewer. Record the command,
result, and covered paths in conversation; a later `verify` treats missing test
artifacts as a limitation rather than proof. Keeping a temporary test through
acceptance is allowed when review is planned, but it still must be removed before
task completion unless it is a deliverable.

**Done when:** acceptance and required checks pass and the diff is reviewed, or an
exact blocker is reported with useful work preserved. Verify disposable-resource
cleanup or report exact blockers. Preserve approved isolation. Staging, commits,
and publishing require separate applicable authority.

## Method triggers

- `git-isolation`: explicitly approved branch/worktree execution only.
- `opencode`: OpenCode changes, before relying on current V2 behavior.
- `writing-for-agents`: changes to instructions, commands, or skills.
- `tdd`: test-first work explicitly requested or included in approved methods.
- `diagnosing-bugs`: nontrivial diagnosis/repair within authorized execution.
