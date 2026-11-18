---
name: tdd
description: Apply test-driven development when test-first work or a red-green-refactor method is requested or approved.
---

# Test-driven development

Use test-first work only within the active task's approved scope and permissions.
Load `cleanup` before creating tests, fixtures, or other disposable resources.
Follow `execution` for task-scoped evidence and test retention; explicitly
requested test deliverables and pre-existing tests are preserved.

## Choose behavior and seam

Identify the observable behavior, representative interface, independent expected
result, and smallest useful test seam. Prefer a public boundary that exercises
the real behavior without coupling to private implementation. Explain any
important seam tradeoff in the plan or report. Ask the user if the seam changes
the agreed scope or requires a material unresolved decision.

## Red, green, improve

1. Add one focused test for one behavior. Run it and confirm that it fails for
   the intended reason, not from a broken setup or unrelated error. Record the
   command and decisive result.
2. Make the smallest authorized change that satisfies the behavior. Run the
   same test and confirm it passes.
3. Improve the design within scope while preserving behavior; rerun the focused
   test. Repeat in small vertical slices, then run relevant broader checks.

Use deterministic inputs and independent expected values. Avoid tests that
reproduce the implementation, mock away the behavior under test, or assert only
incidental internal calls. If a faithful red state or test seam is unavailable,
stop and report the limitation; do not claim a red-green cycle succeeded.

## Finish

Record actual commands, results, covered behavior, and limitations. Apply the
active task's test-retention and cleanup policy after capturing evidence, then
verify cleanup. Preserve existing tests, requested test deliverables, and failing
evidence needed to explain a blocker.
