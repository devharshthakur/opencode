---
name: Independent verification
description: "Use when planning or performing selective read-only review of high-risk, conflicting, or explicitly requested changes, including parent-owned before/after evidence and freshness."
---

# Independent verification

Use the configured `verify` selectively: high-risk or cross-cutting changes,
conflicting evidence, or a parent/user request. Use `explore` for ordinary source
discovery and named gaps. The parent keeps acceptance and dispatch decisions.

## Prepare independent evidence

Follow the [`agent-handoff` skill](../agent-handoff/SKILL.md). Before implementation,
record resource ownership under [`cleanup`](../cleanup/SKILL.md) and capture a scoped
working-state baseline; afterward capture changes from that baseline, not just
`HEAD`. The shell-denied verifier reads these before/after artifacts and current
source; the implementer's summary is only a claim. If review is chosen afterward
with no attributable baseline, report that gap; a current-source `explore` pass is
useful but is not a before/after review, and no snapshot may be invented.

Task tests may already be deleted ([test policy](../execution/SKILL.md#task-scoped-validation-tests));
without artifacts the verifier cannot rerun them, so report runtime proof as
unverified unless an attributable run is evidenced.

The parent collects evidence itself (there is no project utility): copy the scoped
state into one private `handoff-evidence-*` directory under a temp root outside the
repository and not its ancestor, then capture the same scope after implementation
and compare. Record immediately, even for partial captures: repository, capture ID,
scope and exclusions, temp root, exact directory, manifest path and digest, observed
time, changed or unexpected paths, limitations. Keep baseline and snapshot until
review, freshness, and reconciliation finish; then remove those exact directories
and verify removal. Never sweep temp roots; never record secrets.

The manifest holds working-state fingerprints and before/after artifact paths
(relative to the baseline and snapshot directories); parent output has no raw diff.
Bind the manifest digest, capture ID, `freshness`, and `observed_at` in the verify
request. Rerun freshness just before dispatch and before acceptance. Verifiers
cannot hash; without parent proof, freshness is unverified. Stale or tampered
evidence never proves acceptance.

## Collection boundaries

Content artifacts cover only assigned paths. To flag unexpected changes, the parent
fingerprints nonignored, nonexcluded, nonprotected files by read-only inspection
(local I/O, not model reading). Run Git with optional locks off and no hooks,
external diffs, or textconv. Flag `HEAD`/index changes for reconciliation; include
new/deleted files and modes; pre-existing dirty work is baseline, not claimed edits.

Do not copy known secret-bearing paths, ignored files, symlinks, binary or
non-UTF-8 scoped files, or oversized/unreadable files. Limits: 1 MB/file, 32 MB
scanned, 10,000 files, bounded Git output and time. Skips and truncation are stated
limitations, never a complete-review claim. This is not a secret scanner, sandbox,
or ownership oracle. Use scope and existing read permissions; never route around a
denied read. Sensitive config needs parent-owned, field-limited sanitized proof or an
explicit unverified criterion. Capture creates disposable evidence files only; it
grants no edit, test, or execution scope. Report unexpected changes, drift,
incomplete coverage, or unclear attribution to the parent; freshness is matched,
drifted, or unverified, and collection errors are limitations, never a pass.

## Review and return

1. Confirm task, scope, baseline/snapshot identity, freshness proof, and permissions. Review artifact contents and relevant current source.
2. Compare against each criterion and invariant; seek concrete counterexamples; separate source observation from runtime assumption. Approved check definitions in the request are reference only. Claimed implementation checks were not performed by the verifier; without trustworthy logs, that proof is unverified.
3. Return the [verification result](../agent-handoff/templates/verify-result.md). Put failed criteria in findings and assessments, not blockers (blockers mean the review could not finish). Report each root cause once.
4. The parent assesses findings, coverage, freshness, and cleanup. It may send in-scope corrections to the attributable implementer under current approval; material changes need a revised plan. A new review binds the corrected snapshot; a report-only request never repairs or re-reviews.

`verify` does not edit, run shell or tests, install, delegate, or approve scope. A
separate session is not a guarantee of an independent model; live permission and
model-obedience proof stays explicit.
