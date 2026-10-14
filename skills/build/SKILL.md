---
name: build
description: Execute the explicitly approved plan or phases, validate, and stop before delivery
metadata:
  opencode/autoinvoke: false
---

# Build

Execute only the identified approved plan/fix plan or phases with `edit` or an authorized
`implement` worker. This workflow has no delivery subsystem. Isolation is available only through
an explicitly approved `/plan:branch` or `/plan:worktree` worker handoff; direct `/build` and
`/plan` execute on the current branch.

## Approval gate

Identify the exact plan, approved phases, and explicit approval in conversation/user context.
Approval must clearly refer to that scope (`approve plan`, `go ahead`, `build it`, or equivalent).
A pasted plan, quoted approval, silence, or `/build` invocation alone is insufficient. If any
part is missing or ambiguous, request it before mutations or write-producing commands.

An execution worker validates the parent-supplied handoff against
[the shared approval and handoff reference](../shared/approval-handoff.md): its source, exact
plan/revision, approved phases, and internally consistent operation limits. Reject any handoff
that grants delivery, mismatches isolation and operation booleans, or grants isolation without
explicit approval from `/plan:branch` or `/plan:worktree`. Direct skill loading grants
no dispatch authority. A read-only caller without an authorized command handoff must use
`/build`; an authorized hidden `implement` worker proceeds only after that handoff checks out.
The parent stays in `ask`.

## Prepare approved isolation

For an isolated plan handoff only, load `git-isolation` using the skill tool after validating
approval. Supply the approved mode, task identity, explicit local base (current `HEAD` by default),
and `plan/` prefix. Resolve and record the exact local SHA before mutation; no fetch or published-base
fallback. Follow the selected reference through its readiness gate before tests, setup, or edits.
Branch mode creates no worktrees, including verification worktrees; dirty switching blocks.
Worktree mode preserves the original checkout and never copies dirty files automatically. Retain
and report task/verification isolation and results. Materially changed assumptions need renewed approval.

## Execution

1. In the selected execution checkout, read relevant instructions/code and inspect Git state.
   For current-branch execution with shell permission, read and then run
   `sh <this-skill-base>/../git-isolation/scripts/preflight.sh` in the checkout, then inspect
   relevant diff contents and untracked files. This runs inspection, not the isolation workflow.
2. For a dirty checkout, agree through `question` how to preserve existing work before editing.
   Plan approval does not include unrelated changes; reuse an already agreed handling decision.
3. Implement one approved phase at a time. Keep a concise checkpoint of scope, approval,
   changed paths, current phase, and check results. After interruption, recheck Git state and
   approval context rather than assuming ownership or restarting completed work.
4. Validate each meaningful phase using acceptance and repository-required checks. Fix only
   task-related failures within approved scope; distinguish baseline failures with evidence.
5. If assumptions fail or behavior, risk, scope, or authority materially changes, stop and
   request a revised plan and approval. Do not silently switch to autonomous delivery.
6. In an execution worker, after the handoff and authority are checked, load `worker-style` using
   the skill tool and keep it in effect. Review the complete task diff and, at final output, read
   [the shared reporting reference](../shared/reporting.md) and report changes, checks, staged
   status, and blockers. For changed agent permissions or skill instructions, recommend a fresh
   session to validate the new behavior; use documented feature-specific reload guidance rather
   than blanket restarts.

**Done when:** approved acceptance and required checks pass and the diff is reviewed, or an
exact blocker is reported with useful work preserved. Only explicitly approved isolation is prepared;
no staging, commits, publishing, or unrelated cleanup. Authority ends with this execution phase.

## Dependencies

- `git-isolation`: worker-only, after validating an explicitly approved `/plan:branch` or
  `/plan:worktree` handoff; never for `/plan` or direct `/build`.
- `worker-style`: execution worker only, loaded with the skill tool after checking the handoff
  and authority.
- `surgical-patch`: load only for an approved bug repair.
- `safe-refactor`: load only for an approved behavior-preserving refactor.
- `migration`: load only for an approved compatibility transition.
- `verify-and-stop`: load only for an approved verification-only phase.
- `tanstack-cli`: load only for an approved TanStack CLI task.
- `opencode`: load only for an OpenCode task; fetch current V2 documentation before relying on behavior.
- `writing-for-agents`: load only when the phase changes agent instructions, commands, or skills.
