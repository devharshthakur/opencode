# PR template references

Optimize for a comfortable human read, not filling every heading. Follow applicable
repository guidance; omit empty sections, rename/reorder headings, or combine
templates for mixed changes. Keep material migration/compatibility facts visible.
No Mermaid unless requested, and no Merge Danger section. End with a review or
validation checklist when useful. Replace placeholders with observed facts.

## Fix

```markdown
## Issue
What the user experienced, when it occurs, and its impact.

## Root Cause
The confirmed cause and a useful code reference. Use “Cause” when more appropriate;
label uncertainty honestly rather than claim an unconfirmed root cause.

## The Fix
What changed and why it addresses the cause. Include a small snippet only if useful.

## Validation Checklist
- [x] Observed reproduction: command and failure before, result after.
- [x] Relevant regression check: command and actual result.
- [ ] Specific remaining reviewer check or pending CI, if applicable.
```

Use `## Review Checklist` instead when reviewer actions are more useful. These
example checked boxes must become unchecked/unrun text if no actual proof exists.

## Performance

```markdown
## Problem
The slow path and its user impact.

## Changes
The measured bottleneck and how this change addresses it.

## Measurements
| Scenario / conditions | Before | After |
| --- | --- | --- |
| Actual benchmark and environment | Observed baseline | Observed result |

## Review Checklist
- [x] Correctness checks: actual commands/results.
- [ ] Relevant remaining performance or rollout checks.
```

Omit the table if measurements are unavailable; disclose the limitation rather
than invent numbers. State methodology/variance when important.

## Feature

```markdown
## Summary
The capability added and why it matters.

## Changes / Usage
- Important behavior or interface changes.
- A short copyable usage/config example, if helpful.

## Validation
Actual checks/results and any limitations or pending CI.

## Review Checklist
- [ ] Specific user-facing scenario worth reviewing.
```

## Refactor / Style

```markdown
## Motivation
Why the restructure or cleanup is needed.

## Changes
A short structural comparison or bullets; no artificial diagram requirement.

## Behavior Preservation
The invariants preserved, actual checks/results, and any intentional differences.

## Review Checklist
- [ ] Specific compatibility or behavior boundary worth reviewing.
```

## Chore / Docs / Test / Build / CI / Revert

```markdown
## Summary
- What changed and why.

## Validation
- Actual check/result, or why execution was not applicable.
```

For `revert`, identify the reverted change and effects. For `test`, state the gap
covered. Add a review checklist only when it adds a concrete reviewer action.

## Optional GFM elements

Use code fences with a language, inline code for identifiers, descriptive links,
and compact tables when they improve scanning. Long evidence can be collapsed:

```html
<details>
<summary>Validation output</summary>

Actual redacted output, formatted appropriately.

</details>
```

Use GitHub alerts sparingly for important requirements, for example:

```markdown
> [!IMPORTANT]
> State a verified migration step required by this change.
```
