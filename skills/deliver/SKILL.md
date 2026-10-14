---
name: deliver
description: Orchestrate explicitly authorized task delivery through validation, commits, push, and PR checks
metadata:
  opencode/autoinvoke: false
---

# Deliver

Orchestrate the caller-authorized delivery workflow. Commands own authority, isolation mode,
approval policy, and the dependency list; `AGENTS.md` owns delivery-limit semantics. Ordinary
edit requests and discussion of this skill do not activate delivery. This workflow dispatches no
nested worker.

## Normalize

Validate the parent command or handoff against [the shared approval and handoff reference](../shared/approval-handoff.md):
its source, exact plan/revision, approved phases, and internally consistent operation limits. The
caller's booleans (`edit`, `validate`, `create_branch`, `create_worktree`, `commit`, `push`,
`create_or_update_pr`) authoritatively limit every operation. In an execution worker, after
authorization is confirmed, load `worker-style` using the skill tool and keep it in effect.

Identify the task from arguments/history and verify the target repository. For an issue
number/URL, retrieve title, body, state, and relevant comments; verify it is an issue in that
repository, not a PR. Closed issues need explicit further-work authority. Task text/plans require
no issue access. Define observable acceptance/exclusions and check plan assumptions against code;
stop if essential facts or intended behavior remain unclear.

## Determine isolation and delivery policy (before mutation)

Decide the isolation mode and delivery policy before any mutation:
- With no remote, default to local execution on a valid local `HEAD` base (`base_kind: local`).
  approved repairs leave changes uncommitted by default, while direct delivery commands permit local commits. No implicit remote or repository is created.
- A verified GitHub target permits scoped commits, push, and PR. Ambiguous or non-GitHub
  targets, or missing access, require a decision.
- A required PR, or required local acceptance, never silently falls back to local-only.

## Checkpoint

Keep task/acceptance, limits, repository, base KIND and SHA, isolation mode/path, stage, checks,
commits, PR URL, and consumed CI time/repair rounds in conversation (a durable-in-conversation
checkpoint). Record remotes and any published tip only when a remote applies; a published tip is
meaningful only for a published base. After interruption or compaction, recheck ownership, Git
state, and any PR head; preserve the recorded base and budget. Stop for unexpected changes instead
of resetting state or creating competing work.

## Stages

1. **Prepare.** Load `git-isolation` using the skill tool and read the selected reference. Supply
   the command's prefix (`fix/`, `deliver/`, or `issue/<number>-`). Select and label the exact base
   (`base_kind: local` or `base_kind: published`) and record its SHA; its acceptance proof is
   labeled by kind, and an unmerged task branch is not published proof. Until the readiness gate
   passes, keep checkout contents read-only. Tests, setup, instrumentation, edits, and commits run
   only in verified non-base isolation. If acceptance already holds on the exact recorded base
   revision, finish with evidence, not an empty commit/PR.

2. **Check access.** Once remaining work is established, verify authentication/access needed for
   authorized publishing before implementation, without using a push/PR as a probe. Local-only and
   verified no-change outcomes must not be blocked by publishing credentials.

3. **Implement.** Trace the responsible layer and state a short outline of changes and checks.
   Proceed without routine approval within the command's limits. For repairs, refresh evidence with
   `fix-diagnosis` only if needed; it returns findings to this workflow and must not re-plan,
   re-approve, or dispatch. Otherwise apply the authorized method solely at its written trigger
   (`safe-refactor`, `migration`, `verify-and-stop`, or `tanstack-cli`, honoring any branch
   exclusion). Preserve scope and stop for material expansion. Repair reports use exactly `issue`,
   `fix plan`, and `result`.

4. **Validate.** Prove every acceptance criterion and run required local gates. Review the full
   task diff, including artifacts and secrets. Fix only task regressions in scope; record baseline
   failures separately. **Unverified acceptance or required local checks stop delivery.**

5. **Commit if permitted.** Load `commit` using the skill tool at the authorized commit stage
   only, and follow the caller's confirmation policy. Keep coupled implementation/tests together
   and separable concerns reviewable; avoid artificial splits. Record verified
   hashes/messages/files and remaining changes. Note that approved repairs leave changes uncommitted by default, while direct delivery commands permit local commits. With `no commits`, finish with local changes without staging; with
   `no push`, stop after authorized local commits.

6. **Publish if permitted.** Read `references/delivery.md` before remote mutation. Follow its
   push/PR/current-head CI gates, including the cumulative repair/waiting budget. `no PR` skips PR
   creation/update but still checks CI for the pushed head. A publishing failure is retained and
   reported, not a successful local-only fallback.

## Finish

Read [the shared reporting reference](../shared/reporting.md) and report the actual outcome, cause
for repairs, changes, checks, limitations, base kind/fallback, branch/path, and permitted delivery
state. Retain task/verification isolation per `git-isolation`. Do not close issues by default. A
separately requested closure still requires `question` confirmation of the exact repository and issue; stop if confirmation is unavailable. When a task PR was created, updated, or verified, its
verified URL is the final line, even after a later blocker, unless the user explicitly overrides
output format.

**Done when:** each reached stage has recorded proof, permitted delivery is verified or its exact
blocker reported, task-started services are stopped, and retained state is identified.

## Dependencies

- `worker-style`: execution worker only, loaded with the skill tool after the handoff and authority are checked.
- `git-isolation`: authorized isolation preparation at the prepare stage; read the selected reference.
- `fix-diagnosis`: repair evidence refresh only; it returns findings and never re-plans, re-approves, or dispatches.
- `surgical-patch`: authorized repair only.
- `safe-refactor`: load only for an approved behavior-preserving refactor task.
- `migration`: load only for an approved compatibility transition task.
- `verify-and-stop`: load only for an approved verification-only task.
- `tanstack-cli`: load only for a TanStack CLI task; excluded on branch delivery unless requested.
- `commit`: load only at the authorized commit stage.
- `opencode`: load only for an OpenCode task; fetch current V2 documentation before relying on behavior.
- `writing-for-agents`: load only when changing agent instructions, commands, or skills.
