---
name: github-issue-analysis
description: GitHub issue, gh issue, issue URL, #123. Use for read-only issue fetch, codebase analysis, and implementation guides before @edit, @plan, or @build.
---

# GitHub Issue Analysis

Use for read-only issue work.

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
