---
name: fix
description: Investigate bugs in disposable environments and propose evidence-backed repairs before approval
metadata:
  opencode/autoinvoke: false
---

# Fix

Use in `dev`, preserving the selected session model and agent. If invoked in
`chat`, ask the user to select `dev`; do not switch silently. Request a missing
issue description. This workflow is project-agnostic.

Use the [fixed output templates](references/output.md) for the approval plan,
blocked diagnosis or repair, and repair result. Use them after resuming as well.

## Authority and boundaries

Invoking `/fix` authorizes read-only discovery and task-scoped diagnostic
mutations in a separately owned disposable environment under this protocol.
It does not approve a repair, mutate the original checkout, or authorize Git
mutations there. No snapshot commits, stash, reset, clean, or branch switching
for diagnosis. Tool permissions and denials remain binding.
An enclosing read-only workflow remains read-only; request an explicit workflow
transition when diagnostic mutations exceed its authority.

Load `cleanup` before creating the environment or other diagnostic resources.
Record their ownership, exact paths/identities, purpose, and intended teardown.
Use the environment's approved temporary root, outside the original checkout.
Default to disposable local data/storage, local-only listeners, and no external
writes. Ask before using existing databases, credentials, live integrations,
privileged setup, persistent data, or unclear side effects. A source copy is
not a security sandbox: constrain commands, processes, network, and data too.

## 1. Understand and prepare

1. Read relevant project instructions, setup commands, code, and existing tests.
   Record the symptom, expected behavior, environment, original root, branch/HEAD
   (including detached/unborn state), index, and working changes. Use
   `git-isolation/scripts/preflight.sh` as read-only inspection where applicable,
   resolving it from the global skills tree; inspect relevant contents separately.
   Bounded `explore` assistance is read-only; load
   [exploration](../plan/references/exploration.md) before substantial delegation.
2. Investigate read-only first. Before commands that may write files, tests,
   instrumentation, caches, or setup artifacts, prepare the disposable environment
   using [diagnostic environment](references/environment.md). That reference also
   covers non-Git projects and explicitly needed history. Reproduce current source
   contents, including relevant staged, unstaged, and untracked files, not just HEAD.
   Record omissions and resolve anything material before claiming reproduction.
3. Load environment-specific guidance before setup when applicable. For browser
   applications or projects using web services/data, read
   [web diagnostics](references/web.md). Other project types use their documented
   setup within the same generic boundaries; do not assume web tooling.

## 2. Establish causal evidence

Load `diagnosing-bugs` and perform Phases 1–4 within these boundaries.
Prefer existing tests, read-only inspection, and debuggers. Create focused
temporary tests/harnesses or tagged instrumentation only when useful and permitted.
Do not require test-first development or instrumentation for every bug.

Capture the reproduction procedure, actual outcomes, baseline, causal evidence,
competing explanations, and a verification seam in conversation. Distinguish
observed facts, hypotheses, and unavailable proof. Temporary test evidence must
include commands/results before removal; do not copy secrets into reports.

If reproduction or causal discrimination is blocked, report the exact uncertainty
and the next bounded experiment/access needed. Do not present an unconfirmed cause
as fact or a speculative repair as ready for implementation. Ask for additional
authority only where needed; otherwise stop with useful evidence preserved.

## 3. Discuss and propose the repair

Resolve consequential choices before presenting a plan. Use the
[human-readable plan](../plan/SKILL.md#human-readable-approval-plan) format with
`## Plan: <stable title>`, revision starting at 1, and a Markdown Todo checklist
with stable IDs, prerequisites, and observable acceptance.

Explain the confirmed symptom/cause, proposed behavior, exclusions, alternatives,
validation, and material risks. Major refactors are allowed in the proposal when
causally justified; do not bundle unrelated cleanup. Keep exact commands, paths,
and evidence in conversation for direct execution; prepare a detailed handoff
only when implementation workers are authorized.

Record repair execution location separately from diagnosis:

- Default: current checkout, current local HEAD, local uncommitted delivery.
- An explicit branch/worktree request is resolved in the plan before approval;
  use `git-isolation` only after approval of that implementation isolation.
- Resolve reliance on dirty original work before approval; copying it for diagnosis
  does not authorize transplanting it into an implementation checkout.
- No staging, commits, fetch, publishing, or implementation dispatch is implied.
  Direct execution is the default under `execution`; optional worker orchestration
  belongs to that policy, not a file-count heuristic.

Load and follow `approval-handoff` for the final plan and execution transition.
Plan approval authorizes only the named repair phases and operation limits.

## 4. Retain, resume, and dispose

Keep the diagnostic environment through plan review; disclose its exact path,
state, omissions, and intended lifetime. Stop unused task-owned services and
account for all resources before requesting approval. Retaining this explicitly
owned diagnostic environment is permitted by `cleanup`; it is not an unreported
cleanup failure. Retain temporary tests needed for review with it.

After interruption, verify environment identity/state, original checkout,
approval, and any running executor before continuing. Never repeat creation,
diagnosis, or implementation merely because a checkpoint is missing. Missing or
conflicting ownership is a blocker.

After approved repair execution, verify the original symptom and focused checks
in the implementation environment, not just the diagnostic copy. Report any
environment mismatch. Diagnostic mutations are not delivery changes: implement
the approved repair deliberately; do not copy the diagnostic tree wholesale.
Diagnostic tests remain disposable unless explicitly approved as deliverables.

After completion or explicit cancellation, remove attributable diagnostic
resources using the environment reference and `cleanup`, then verify absence.
On a blocker, retain necessary evidence and report exact resources and next action.
Never delete an implementation branch/worktree, user data, or intended deliverable
as diagnostic cleanup. Forgotten environments are not automatically disposable:
reconcile ownership first.

**Planning done when:** a causally supported repair revision awaits approval, or
an exact investigation blocker is reported; original work remains unchanged and
all diagnostic resources are accounted for. Execution completion additionally
requires acceptance, required checks, reviewed diff, and verified disposal or
explicitly reported cleanup blockers.

## Conditional dependencies

- `cleanup`: before diagnostic resources and at lifecycle/cleanup gates.
- `diagnosing-bugs`: diagnostic method and verification of approved repair.
- `opencode`: OpenCode tasks, before relying on current V2 behavior.
- `writing-for-agents`: designing agent instructions, commands, or skills.
- `approval-handoff`: final repair-plan approval and execution transition.
- `execution`: approved repair execution, directly by default.
- `git-isolation`: explicitly approved branch/worktree repair execution only.
- Browser/debugging methods: only at the triggers in `references/web.md`.
