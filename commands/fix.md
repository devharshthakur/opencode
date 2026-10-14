---
description: Diagnose a bug and propose a fix without changing files
agent: ask
subagent: false
---

Load `fix-diagnosis` using the skill tool. This command authorizes its declared dependencies only
for diagnosis, plus user-requested additions. Mode: diagnosis-only. Request a missing symptom or
expectation before proceeding.

Inspect read-only using discovery and read-only Git inspection if needed. No tests, setup,
instrumentation, fetches, Git mutations, or external-state changes. Request captured evidence when
an executable reproduction is needed. Report confirmed cause or hypotheses and a concrete fix plan.
Use exactly `issue`, `fix plan`, and `result` sections; state "Diagnosis only; no changes made."
Stop without an execution approval question. Even after "yes", never launch implementation;
suggest `/fix:branch` or `/fix:worktree` for repair. Do not chain into `/build` or delivery.

Bug and user constraints:
$ARGUMENTS
