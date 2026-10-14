---
name: fix-diagnosis
description: bug, stack trace, screenshot, repro, error log. Use for read-only root-cause diagnosis and detailed fix plans before edit or the approved-plan /build workflow.
metadata:
  opencode/autoinvoke: false
---

# Fix Diagnosis

Use for bug reports, stack traces, screenshots, failing commands, or broken behavior. This skill
is read-only and grants no authority; loading or discussing it never authorizes a dispatch. The
invoking command selects the mode and defines scope.

## Mode comes from the command

- `/fix` is diagnosis-only even after an explicit "yes": it stops without an execution approval
  question. This is the diagnosis-only `/fix` path; suggest `/fix:branch` or `/fix:worktree` for repair.
- `/fix:branch`, `/fix:worktree`, and `/fix:pr` are approval-triggered repair modes: diagnose and
  plan read-only, then on explicit approval dispatch hidden `implement` with workflow `deliver`,
  kind `repair`.
- When a `deliver` worker loads this skill only to refresh evidence, it returns findings to that
  existing workflow. "Do not request another execution approval or dispatch another worker." A
  materially changed cause or scope returns to the parent for a revised plan and approval.

## Diagnosis (read-only)

1. Parse the symptom, repro, logs, screenshots, and broken expectation. Separate observed facts
   from inferred cause.
2. Ask for missing information only when diagnosis would otherwise be guesswork; request
   user-captured evidence when an executable reproduction is needed.
3. Inspect only relevant code, tests, and configuration with native read/search. Read-only Git
   inspection is allowed only when the invoking command permits it. Before approval: no tests,
   setup, instrumentation, fetches, Git mutations, or external-state changes.
4. Trace the symptom through the failing path to the state, data, or control flow that explains
   it. Rank competing hypotheses by supporting evidence and cheap falsification value. Report a
   confirmed root cause only when the evidence uniquely supports it; otherwise name the leading
   hypotheses, their evidence, and the smallest next diagnostic step.

## Output

Read [the shared reporting reference](../shared/reporting.md) and report exactly the `issue`,
`fix plan`, and `result` sections. State "Diagnosis only; no changes made." for diagnosis-only mode.

For an eligible repair mode, read [the shared approval and handoff reference](../shared/approval-handoff.md)
before requesting approval. The fix plan states the symptom, mechanism certainty, path-level
changes, proof, risks, and the proposed isolation (base kind and base), delivery operations, and
limits. With no remote, use a valid local `HEAD` and default to an uncommitted repair. A verified
GitHub target permits a proposal for scoped commits, push, and PR; ambiguous or non-GitHub
targets, or missing access, require a decision. A required PR does not silently fall back to
local-only.

## Dependencies

- `deliver`: execution worker only, after an explicit repair command authorizes execution.
- `opencode`: OpenCode bug diagnosis only, for current V2 behavior.
