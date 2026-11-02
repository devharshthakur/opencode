---
name: fix
description: Diagnose issues on a temporary branch, plan Todo repairs, and orchestrate approved fixes
metadata:
  opencode/autoinvoke: false
---

# Fix

Preserve the current model. Request a missing issue description; clarify essential
ambiguity. Use this workflow in `dev`. If invoked in `chat`, ask the user to select
`dev` without silently switching the model or broadening chat's permissions.

## Diagnostic exception

Invoking `/fix*` authorizes only the existing `diag-branch.sh` diagnostic protocol
as a narrow exception to global preservation/hook rules and shared cleanup methods.
This is not implementation approval or a general Git-mutation grant.

- Before `enter`, record the exact checkout, original branch/HEAD, and original
  staged, unstaged, and untracked state with enough evidence to verify restoration
  without exposing secrets. After entry, record the snapshot SHA and helper metadata;
  retain this checkpoint through interruption.
- Only the unmodified helper may perform its temporary branch creation, staging,
  snapshot commits with hook/signing suppression, resets, Git clean, branch return,
  and diagnostic-branch deletion. These operations serve snapshot/restoration only;
  delivery commits, publishing, and manual reset/clean alternatives remain outside
  this exception. Normal implementation and delivery retain hooks and checks.
- Keep diagnosis exclusive to this recorded checkout. Before `leave`, verify the
  original parent ref, snapshot ancestry, and current branch against the checkpoint.
  Inspect full status/diffs and untracked paths: every change to be discarded must
  be attributable to diagnosis. Unexpected edits, uncertain ownership, or inconsistent
  state stop restoration; preserve the state and ask how to proceed.
- Do not mutate ignored files, submodules, or nested repositories through this
  protocol; the snapshot is not proof they can be restored. After `leave`, verify
  original branch/HEAD, index, staged/unstaged/untracked contents, and diagnostic-branch
  absence against the checkpoint.
- On failure or interruption, reconcile ownership and state before continuing;
  never replay uncertain operations or broaden cleanup. Permission denials remain
  binding. This is an instruction-based exception, not a crash-safe restore service.

## Diagnose on temporary branch

1. Read relevant instructions, configuration, code, and tests. An `explore` call
   may investigate a bounded discovery question; read
   [exploration](../plan/references/exploration.md) when delegating substantial discovery.
2. Satisfy the [diagnostic exception](#diagnostic-exception), then read and run
   `sh <skill-base>/../git-isolation/scripts/preflight.sh` in the current checkout.
   Then read and run
   `sh <skill-base>/scripts/diag-branch.sh enter <slug>` to switch to a temporary
   diagnostic branch `fix/diag-<slug>` that carries and snapshots all uncommitted
   staged, unstaged, and untracked changes deterministically via Git.
3. Load `diagnosing-bugs` using the skill tool and run its diagnosis loop (Phases 1–4) on `fix/diag-<slug>`:
   build a tight red-capable reproduction command, reproduce and minimize the failure
   (including uncommitted changes when they contribute to the bug), test ranked
   falsifiable hypotheses, and use tagged `[DEBUG-...]` instrumentation to confirm
   the exact root cause and regression-test seam.
4. Once the failure and root cause are confirmed, run
   `sh <skill-base>/scripts/diag-branch.sh leave <slug>` and re-run `preflight.sh`
   to verify that the parent branch is active, `fix/diag-<slug>` is deleted, all
   diagnostic mutations are wiped, and the original staged, unstaged, and untracked
   changes are restored intact before presenting the plan for approval.

## Required plan and Todo checklist

Use `## Plan: <stable title>` and a revision starting at 1. Follow the
[human-readable plan](../plan/SKILL.md#human-readable-approval-plan) presentation
policy: explain the repair and consequential choices concisely; reserve source
excerpts, exact commands, and edit instructions for the detailed worker handoff.
Include:

- **Goal/Scope:** confirmed symptom, root cause in plain language, exclusions,
  assumptions, and open questions. Surface decisive technical evidence when needed
  for a user decision; keep full provenance/reproduction detail in the handoff.
- **Approach:** repair design, regression-test seam (or documented absence of a seam),
  alternatives, and relevant interfaces.
- **Changes:** user-understandable behavior and affected areas, not an edit inventory.
  The handoff retains inspected paths and ordered edits, with evidence marked as
  current rather than immutable; workers should not reconstruct the discussion.
- **Todo Checklist & Dispatch Mode:** break the fix into small, checkable Markdown
  Todo items (`- [ ] T1: ...`, `- [ ] T2: ...`) with stable IDs, prerequisites, and
  observable acceptance. Use `direct` by default: the current session executes the
  checklist in order. Bounded discovery/read-only review helpers remain allowed.
  Only when [worker execution is authorized](../shared/execution.md), select:
  - `single-worker` (small cohesive fixes, 1–2 files / one tight red-to-green loop):
    one `implement` worker executes the full Todo checklist in order.
  - `per-todo-worker` (large multi-step/multi-component fixes): one upfront approval
    authorizes `dev` to dispatch a fresh `implement` worker for one Todo (`Ti`) at a
    time, validate its returned test proof and `git diff`, mark `- [x] Ti` in the
    Markdown Todo checklist, and then dispatch `Ti+1`. Stop immediately if any Todo
    fails validation or diverges.
- **Validation:** how the failure will be reproduced and proved fixed, regression
  coverage, and baseline limitations. Put exact reproduction/check commands and
  expected red-to-green results in the detailed handoff.
- **Execution:** `current`, `branch`, or `worktree` (`fix/<task-slug>` when isolated),
  intended local base (`HEAD` by default; no fetch), preservation decision, and
  authorized operations/skills. No staging, commits, or publishing.
- **Risks/Tradeoffs** and **Rollback** when relevant. For OpenCode changes, specify
  feature-specific reload behavior and fresh-session validation.

## Approval and handoff

Read and follow [approval/handoff](../shared/approval-handoff.md) for final-plan
approval and execution handoff, using the selected isolation and actual revision.
Execute directly by default; plan approval alone does not authorize dispatch.
Explicit approved worker opt-in or inherited `/improve*` task authority enables
`single-worker` or `per-todo-worker` without per-worker approval. In `per-todo-worker` mode
with `branch` or `worktree` isolation, `T1` prepares `fix/<task-slug>` and `T2..Tn`
reuse that verified isolated checkout. Direct execution prepares the same approved
isolation itself; no additional direct-execution command is needed.

**Done when:** the temporary diagnostic branch is cleaned up, original uncommitted
work is restored on the parent branch, and a complete revision with its Markdown
Todo checklist is awaiting approval (or an exact blocker is reported).

## Dependencies

- `diagnosing-bugs`: root-cause reproduction and verification on `fix/diag-<slug>` and during approved execution.
- `opencode`: OpenCode tasks, before relying on current V2 behavior.
- `writing-for-agents`: when designing changes to agent instructions, commands, or skills.
- [execution](../shared/execution.md): after explicit approval, directly by default;
  retain explicit worker opt-in or inherited `/improve*` authority where applicable.
