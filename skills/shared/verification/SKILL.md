---
name: Independent verification
description: "Use when planning or performing selective read-only review of high-risk, conflicting, or explicitly requested changes, including parent-owned before/after evidence and freshness."
---

# Independent verification

Use configured `verify` selectively for high-risk/cross-cutting changes,
conflicting evidence, or a parent/user request. Use `explore` for ordinary source
discovery and named gaps. The parent keeps acceptance and dispatch decisions.

## Prepare independently collected evidence

Follow the [`agent-handoff` skill](../agent-handoff/SKILL.md). Before implementation, the parent records
resource ownership under the [`cleanup` skill](../cleanup/SKILL.md) and captures a scoped working-state
baseline; after implementation, capture changes from that baseline, **not just
HEAD**. The shell-denied verifier reads these actual before/after artifacts and
relevant current source; the implementer's summary is only a claim to check.
If review is selected only afterward and no attributable baseline exists, report
that gap. A targeted current-source `explore` assessment may still be useful, but
must not masquerade as a complete before/after review or invent a snapshot.

Task-scoped tests may already be deleted under the [`execution` skill's test policy](../execution/SKILL.md#task-scoped-validation-tests). Without test artifacts the
verifier cannot rerun them; recorded command output remains a claim, so report
runtime/test proof as unverified unless an attributable run is evidenced.

The parent collects the evidence itself; there is no project utility. Before
implementation, copy the scoped working state into one private `handoff-evidence-*`
directory under a `temp_root` that exists outside the repository and is not its
ancestor; after implementation, capture the same scope again and compare. Record
immediately, including partial results from a failed capture: repository, capture
ID, scope paths and exclusions, `temp_root`, exact directory, manifest path and
digest, observed time, changed/unexpected paths, and limitations. Preserve baseline
and snapshot until review, freshness, and parent reconciliation finish; then remove
those exact task-owned directories and verify removal. Capture never sweeps
temporary roots. Retain failure evidence in conversation, not secrets.

The manifest holds working-state fingerprints plus before/after artifact paths
(before relative to the baseline directory; after relative to the snapshot
directory). There is no raw diff in parent output. Parent token cost is the compact
manifest summary; the worker reads actual artifacts. Bind the manifest digest in the
verify request, together with the capture ID, `freshness`, and `observed_at`
under the Markdown request's independent baseline/changes section. The parent reruns
freshness immediately before dispatch and again before
acceptance, supplying the actual result to the verifier when needed. Verifiers
cannot compute hashes through shell; mark freshness unverified without attributable
parent proof. Reading stale/tampered evidence never proves acceptance.

## Collection boundaries

Content artifacts are limited to assigned paths. To flag unexpected changes, the
parent fingerprints nonignored, nonexcluded, nonprotected repository files by
read-only inspection; this is local I/O, not additional parent-model source reading.
Capture runs with optional locks disabled and no hooks, external diffs, or textconv.
HEAD/index changes are flagged for reconciliation. New/deleted files and file
modes are included; pre-existing dirty work is the baseline, not claimed as edits.

Known secret-bearing paths, ignored files, symlinks, non-UTF-8/binary scoped files,
and oversized/unreadable files are not copied. Limits: 1 MB/file, 32 MB scanned,
10,000 listed files, bounded Git output/time. Skipped files and truncation are
explicit limitations, never a complete-review claim. Exclusions/ignored files are
outside coverage. This is not a secret scanner, filesystem sandbox, or ownership
oracle; repository status/fingerprints cannot identify another actor's intent.
Use scope/exclusions and existing read permissions; never use snapshots to route
around a denied read. Sensitive config needs parent-owned field-limited sanitized
proof or an explicit unverified criterion, not copying credentials to a neutral name.

Capture must run only under the parent's authorized inspection scope. Capture does
create disposable evidence files; it does not grant edit/test/execution scope.
Unexpected changes, drift, incomplete coverage, or unclear attribution return to
the parent. Report freshness as matched, drifted, or unverified; collection errors
are limitations, never a pass.

## Review and return

1. Confirm task, scope, baseline/snapshot identities, parent freshness proof, and
   permissions. Review the actual artifact contents and relevant current source.
2. Compare changes against each acceptance criterion and invariant. Seek concrete
   counterexamples; distinguish source observations from runtime assumptions.
   Do not merely paraphrase or ratify the implementer's receipt.
   Carry relevant approved check definitions in the acceptance/required-checks
   section when criteria reference their IDs. This is reference material, not execution
   authority. Claimed implementation checks are not checks the verifier performed;
   without trustworthy runtime/log evidence, report that proof as unverified.
3. Return the Markdown verification result under the
   [`agent-handoff` skill's evidence and reporting requirements](../agent-handoff/SKILL.md#evidence-and-parent-reports).
   Verification-specific content: findings with severity/location/evidence/impact,
   every criterion supported/contradicted/unverified, actual checks, freshness,
   limitations, todos, blockers, and cleanup. Put failed implementation criteria in
   findings/assessments, not review blockers; blockers describe inability to finish
   the review, and completed reviews report none. Report each root cause once and do
   not duplicate findings for the same mismatch.
4. The parent assesses findings, coverage, freshness, and cleanup before acceptance.
   It may return in-scope corrections to the attributable implementer under current
   approval; material changes require a revised plan/approval. A new review request
   binds the corrected snapshot; a report-only request never repairs or re-reviews.

`verify` does not edit, run shell/tests/installations, delegate, or approve scope.
Independent session context is not an independent model guarantee. Pending live
permission/model-obedience proof must remain explicit; no automatic service restart.
