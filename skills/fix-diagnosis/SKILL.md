---
name: fix-diagnosis
description: bug, stack trace, screenshot, repro, error log. Use for read-only root-cause diagnosis and detailed fix plans before @edit or @build.
---

# Fix Diagnosis

Use for bug reports, stack traces, screenshots, failing commands, or broken behavior.

## Workflow

1. Parse symptom, repro, logs, screenshots, and broken expectation.
2. Ask for missing info only when diagnosis would otherwise be guesswork.
3. Inspect only relevant code and tests.
4. Trace symptom → failing path → incorrect state/data/control flow → root cause.
5. Compare competing hypotheses when more than one cause fits.
6. Present a concrete fix plan.

## Output format

```md
## Bug: <one-line summary>

**Symptom**: <what user sees>

**Root Cause**: <deepest cause and evidence>

## Fix Plan

- `<file/function>` — <exact change and why>
- `<file>` — <test or validation update>

**Validation**: <commands or manual checks>

**Risks/Edge Cases**: <notable concerns>
```

Keep plan detailed enough for manual implementation or a narrow `@edit`/`@build` handoff.
