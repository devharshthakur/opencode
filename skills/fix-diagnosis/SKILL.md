---
name: fix-diagnosis
description: bug, stack trace, screenshot, repro, error log. Use for read-only root-cause diagnosis and detailed fix plans before edit or the approved-plan /build workflow.
---

# Fix Diagnosis

Use for bug reports, stack traces, screenshots, failing commands, or broken behavior. This skill is
read-only and grants no authority; the invoking command defines scope and whether implementation is
authorized.

## Workflow

1. Parse the symptom, repro, logs, screenshots, and broken expectation. Separate observed facts from
   inferred cause.
2. Ask for missing information only when diagnosis would otherwise be guesswork.
3. Inspect only relevant code, tests, and configuration.
4. Trace the symptom through the failing path to the state, data, or control flow that explains it.
5. Rank competing hypotheses by supporting evidence and cheap falsification value, and test the
   cheapest discriminating check first. Do not overclaim: report a confirmed root cause only when the
   evidence uniquely supports it; otherwise name the leading hypotheses, their evidence, and the
   smallest next diagnostic step.
6. Present a concrete fix plan for the leading cause.

## Output format

```md
## Bug: <one-line summary>

**Symptom**: <what the user sees>

**Root Cause**: <deepest confirmed cause and evidence>

## Leading Hypotheses

- <hypothesis> — <evidence, cheap falsification, next check>

## Fix Plan

- `<file/function>` — <exact change and why>
- `<file>` — <test or validation update>

**Validation**: <commands or manual checks>

**Risks/Edge Cases**: <notable concerns>
```

Use `Root Cause` when confirmed; otherwise use `Leading Hypotheses` and state the uncertainty. Keep
the plan detailed enough for manual implementation or a narrow handoff to `edit`; use `/build` with
`edit` for explicitly approved fix-plan execution.
