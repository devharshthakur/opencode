---
description: Read-only GitHub issue fetch, codebase analysis, and implementation guide
agent: ask
---

# GitHub Issue Analysis

Read-only GitHub issue work.

Input: `$ARGUMENTS`

If no issue number, `#123`, or GitHub issue URL was provided, ask for one and stop.

## Workflow

1. Accept issue number, `#123`, or GitHub issue URL.
2. Fetch issue details with GitHub tools.
3. Inspect only relevant local code, tests, routes, schemas, or configs.
4. Extract problem, expected behavior, assumptions, maintainer comments, and likely scope.
5. Produce an implementation guide the user can follow manually or hand off to another agent.

## Output format

```md
## Issue #<number>: <title>

**Understanding**:

- <1-3 concise bullets>

**Root Cause / Need**: <diagnosis or required capability>

**How to implement**:

- `<path>` — <what changes; why>
- `<path>` — <tests or follow-up changes>

**Validation**:

- <targeted check>
```

Stay read-only. Route small implementation to `@edit`, complex work to `@plan`, and approved execution to `@build`.
