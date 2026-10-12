---
name: implement
description: Orchestrate explicitly authorized task delivery through validation, commits, push, and PR checks
metadata:
  opencode/autoinvoke: false
---

# Implement

Orchestrate the caller-authorized delivery workflow. Commands own authority, isolation mode,
approval policy, and the dependency list; `AGENTS.md` owns delivery-limit semantics. Ordinary
edit requests and discussion of this skill do not activate delivery.

`git-isolation` owns repository/base verification and isolation; `commit` owns all commit
mechanics and message style. Load each authorized dependency only at its stage. For an explicit
direct workflow request, clarify missing authority, isolation mode, or dependencies before mutation.

## Checkpoint

Keep task/acceptance, limits, repository/remotes, published base SHA, branch/path, stage,
checks, commits, PR URL, and consumed CI time/repair rounds in conversation. After interruption
or compaction, recheck ownership, Git state, published tip, and any PR head; preserve the recorded
base and budget. Stop for unexpected changes instead of resetting state or creating competing work.

## Stages

1. **Normalize.** Identify the task from arguments/history and verify the target repository.
   For an issue number/URL, retrieve title, body, state, and relevant comments; verify it is an
   issue in that repository, not a PR. Closed issues need explicit further-work authority.
   Task text/plans require no issue access. Define observable acceptance/exclusions and check
   plan assumptions against code; stop if essential facts or intended behavior remain unclear.

2. **Prepare.** Follow `git-isolation` through inspection, published-base selection, and the
   selected isolation mode. Supply the command's prefix: `fix/` for repair, `issue/<number>-`
   for issue work, otherwise `implement/`. Inspect resumable branches/worktrees and matching
   PRs when relevant. Until its readiness gate passes, keep checkout contents read-only.
   Tests, setup, instrumentation, edits, and commits run only in verified non-base isolation.
   If acceptance already holds on the exact published revision, finish with evidence, not an
   empty commit/PR. Resumed unmerged task work is not published-base proof.

3. **Check access.** Once remaining work is established, verify authentication/access needed
   for authorized publishing before implementation, without using a push/PR as a probe.
   Local-only and verified no-change outcomes must not be blocked by publishing credentials.

4. **Implement.** Trace the responsible layer and state a short outline of changes and checks.
   Proceed without routine approval within the command's limits. For repairs, use authorized
   `fix-diagnosis` and `surgical-patch` for diagnosis and regression proof; otherwise apply the
   relevant authorized method. Preserve scope and stop for material expansion.

5. **Validate.** Prove every acceptance criterion and run required local gates. Review the full
   task diff, including artifacts and secrets. Fix only task regressions in scope; record
   baseline failures separately. **Unverified acceptance or required local checks stop delivery.**

6. **Commit if permitted.** Follow `commit` with the caller's confirmation policy. Keep coupled
   implementation/tests together and separable concerns reviewable; avoid artificial splits.
   Record verified hashes/messages/files and remaining changes. With `no commits`, finish with
   local changes without staging; with `no push`, stop after authorized local commits.

7. **Publish if permitted.** Read `references/delivery.md` before remote mutation. Follow its
   push/PR/current-head CI gates, including the cumulative repair/waiting budget. `no PR`
   skips PR creation/update but still checks CI for the pushed head.

## Finish

Retain task/verification isolation per `git-isolation`. Report the actual outcome, cause for
repairs, changes, checks, limitations, base fallback, branch/path, and permitted delivery state.
Do not close issues by default. A separately requested closure still requires `question`
confirmation of the exact repository and issue; stop if confirmation is unavailable.
When a task PR was created, updated, or verified, its verified URL is the final line, even
after a later blocker, unless the user explicitly overrides output format.

**Done when:** each reached stage has recorded proof, permitted delivery is verified or its
exact blocker reported, task-started services are stopped, and retained state is identified.
