---
name: Resource cleanup
description: "Use before creating disposable resources or task-created tests, and when stopping, verifying, or reporting cleanup during planning, execution, failure, or a blocker."
---

# Task-owned resource lifecycle

Read before creating disposable resources during planning or implementation,
including direct tasks, `/quick`, and worker execution. This protocol
governs cleanup, not permission to create resources or expand task scope.

## Record

Before creation, keep a compact conversation checkpoint: purpose, ownership
evidence, exact path/container ID/process identity, ports, and intended teardown.
Capture returned IDs immediately; no ledger file. Use dedicated temp directories
in the approved temp root. Track test artifacts and attributable child processes.
Keep enough evidence across interruption or compaction to reconcile rather than
recreate.

Task-created tests, fixtures, snapshots, and temporary test config are disposable:
record exact paths, capture the command and result, then delete after acceptance
evidence is recorded. Preserve pre-existing tests, requested test deliverables, and
failing evidence needed to report a blocker.

Pre-existing resources, including user-started services and containers, stay
untouched. Age, naming, a busy port, or an untracked file alone does not prove
ownership; if unclear, preserve and report the uncertainty.

## Clean up and verify

After validation, before the final response or worker handoff, account for every
recorded resource. During planning, do this before presenting the approval-ready
plan. Apply the same gate on failure, cancellation, or a blocker whenever execution
remains available; report incomplete cleanup rather than claiming a clean finish.

1. Re-check ownership and identity before acting. For processes, use captured
   start-time/command/parent or equivalent evidence, not a PID or port alone;
   protect against PID reuse. Reconcile already-stopped/deleted resources without
   replaying uncertain operations.
2. Gracefully stop task-started dev servers, test processes, and attributable
   descendants with a bounded wait. Verify their termination and release of owned
   listeners. Never kill a replacement or unrelated process occupying the port.
3. Gracefully stop task-created containers by exact ID, verify stopped state, and
   remove only disposable task-created containers and explicitly tracked ephemeral
   resources. Use a stop mechanism that does not automatically escalate to forced
   termination after its timeout; otherwise ask before using it.
4. Delete exact disposable task-owned temporary paths and test artifacts, checking
   resolved paths and symlinks to avoid deleting outside the owned boundary. Verify
   absence. Never sweep a shared temp directory or delete by a broad filename glob.

The [`fix` workflow](../../fix/SKILL.md) retains its disposable diagnostic
environment and useful test evidence through repair-plan review. Before approval,
stop unused task-owned services and disclose the retained environment and intended
lifetime; dispose of it after completion or cancellation once ownership and
evidence status are reconciled. This does not authorize deleting implementation
worktrees or bypassing the methods above.

Preserve deliverables, source changes, caches, persistent volumes/data, backups,
branches, and worktrees unless separately authorized; starting a resource does not
authorize deleting its data. No broad Docker prune, Git clean, port-based killing,
or forced escalation to make cleanup look successful. If graceful shutdown fails,
ownership is uncertain, or permissions deny cleanup, retain the resource, report
its exact identifier and blocker, and ask before any forceful action. Never route
around a denial.

## Report

Briefly report stopped/removed/verified resources, or that none were created, plus
retained resources, cleanup failures, missing verification, and a safe next step,
without secrets. Mention pre-existing resources only when relevant. Parents assess
worker cleanup evidence before accepting completion. Crashes and forced termination
are beyond instructions; on resumption, reconcile recorded ownership first.
