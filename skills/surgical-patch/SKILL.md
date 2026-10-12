---
name: surgical-patch
description: Fix bugs and small behavior changes at the narrowest responsible layer. Use when regression proof, preserved surrounding behavior, and task-relevant tests matter.
---

# Surgical patch

Own the repair itself: report the cause, change the narrowest responsible layer, and prove the fix.
This skill defines repair mechanics and gates; it grants no authority beyond what the invoking command
authorizes.

## Before the patch

- Establish and report the responsible mechanism, with supporting evidence, before editing. Do not
  patch on a plausible but unproven explanation.
- Stop and ask when the cause is unclear, the intended behavior is ambiguous, or the fix would need
  wider changes. New dependencies, schema migrations, refactors, and changes outside the responsible
  layer require separate approval.
- Design the proof up front: a red/green regression test at a suitable seam, or the original
  reproduction when no seam exists.

## The patch

- Change only the narrowest layer that owns the incorrect behavior.
- Preserve unrelated behavior and user changes; avoid cleanup, renaming, and abstraction outside the
  fix.

## Proof and stop

- At a suitable seam, add a regression test and observe it fail for the reported bug before the fix,
   then pass after, and rerun the original reproduction. When no seam exists, use the strongest available proof:
  reproduce it before and after, and document the missing-test limitation honestly rather than
  claiming a test ran or passed.
- With the cause clear, proceed without routine approval; otherwise stop.
- Run focused proof plus the nearest affected gate. Stop when the failure is fixed and the regression
  proof passes; remove task-created temporary instrumentation and stop processes/containers started
  for the task.
