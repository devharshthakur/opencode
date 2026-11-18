---
name: diagnosing-bugs
description: Diagnose a reported bug or performance regression using a reproducible symptom, falsifiable hypotheses, and targeted evidence.
---

# Diagnosing bugs

Use this method within the active workflow's permissions and approval boundaries.
It grants no authority to modify a checkout, use production data, start services,
or perform Git operations. For `/fix`, follow `fix` and its disposable-environment boundaries;
complete Phases 1–4 before the repair plan. Load `cleanup` before creating
task-owned resources, tests, fixtures, or instrumentation.

Redact secrets and sensitive data in commands, logs, and reports. Prefer existing
tests and safe local data; ask before using protected environments or data.

## Phase 1: Establish a feedback loop

Identify the reported symptom, expected behavior, affected environment, and a
specific observable failure. Choose the narrowest safe way to exercise the real
path: an existing test, a focused command, a local request, a browser interaction,
or an authorized disposable harness. Record the command or procedure, expected
and actual results, and relevant baseline.

Run the loop and establish that it can detect this particular symptom. Tighten it
for speed and repeatability; for intermittent failures, record attempts and the
observed failure rate rather than claiming determinism. If a faithful loop cannot
be run within current authority or access, report what is missing and stop before
claiming a confirmed root cause; request the necessary evidence or permission.

## Phase 2: Reproduce and minimize

Reproduce the user's failure, not merely a nearby error. Reduce inputs and steps
one at a time where practical, rerunning the loop to retain the symptom. Record
the smallest useful reproduction, remaining uncertainty, and the original scenario
for later verification. Do not remove or alter user data to simplify a case.

## Phase 3: Rank hypotheses

List plausible causes, ordered by evidence. For each, state a prediction and a
safe observation that could distinguish it from alternatives. Check existing
code, configuration, history, and relevant documentation as appropriate. Separate
facts from guesses; update the ranking as evidence changes.

## Phase 4: Test and confirm

Test predictions one variable at a time. Prefer read-only inspection and a
debugger; use narrowly scoped, uniquely tagged `[DEBUG-...]` instrumentation only
when permitted. For performance, measure a baseline and compare like-for-like.
Confirm the causal chain with evidence, identify a regression-test seam, and
record competing explanations ruled out. If evidence is inconclusive, report the
blocker instead of presenting a hypothesis as a fact.

For `/fix`, return control to `fix` for evidence retention and repair-plan approval;
do not proceed to implementation under this skill alone.

## Phase 5: Verify the authorized repair

After required approval, use a suitable seam to demonstrate the failure before
the fix and the intended behavior after it. Run the original reproduction as well
as focused checks. If no representative seam or red-before-green proof is
available, explain the limitation rather than claiming regression coverage.
Follow `execution` for task-scoped tests and the user's test deliverables.

## Phase 6: Clean up and report

Remove attributable debug instrumentation and disposable resources under
`cleanup`; preserve existing work and requested deliverables. Report the symptom,
confirmed cause, decisive evidence, checks and outcomes, unresolved uncertainty,
and cleanup status. Never claim a fix or cleanup that was not verified.
