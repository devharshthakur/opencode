# Task-owned resource lifecycle

Read before creating disposable resources during planning or implementation,
including direct tasks, `/quick`, `/build`, and worker execution. This protocol
governs cleanup, not permission to create resources or expand task scope.

## Record

Before creation, keep a compact resource checkpoint in conversation: purpose,
ownership evidence, exact path/container ID/process identity, associated ports,
and intended teardown. Capture returned IDs immediately; no mandatory ledger file.
Use dedicated task-temporary directories in the environment's approved temp root.
Track test artifacts and attributable child processes too. Preserve enough evidence
across interruption/compaction to reconcile resources rather than recreate them.

Pre-existing resources, including user-started services and containers, stay
untouched. Age, naming, a busy port, or an untracked file alone does not prove
ownership. If ownership is unclear, preserve the resource and report the uncertainty.

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

Preserve intended deliverables, source changes, caches, persistent volumes/data,
backups, branches, and worktrees unless separately authorized. Starting a resource
does not authorize deletion of its persistent data. No broad Docker prune, Git
clean, port-based killing, or forceful escalation to make cleanup appear successful.
If graceful shutdown fails, ownership is uncertain, or permissions deny cleanup,
retain the resource, report its exact identifier and blocker, and ask before
forceful/destructive action. Respect denials; never route around them.

## Report

Briefly report stopped/removed/verified resources, or that none were created.
Identify any retained resources, cleanup failures, missing verification, and a safe
next step without exposing secrets. Mention pre-existing resources only when
relevant; suggest user shutdown when useful, without stopping them yourself.
Parents assess worker cleanup evidence before accepting completion; a successful
tool return is not proof. Abrupt crashes or forced termination cannot be covered by
instructions alone; on resumption, reconcile recorded ownership before cleanup.
