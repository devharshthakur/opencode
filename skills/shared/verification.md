# Independent verification

Use configured `verify` selectively for high-risk/cross-cutting changes,
conflicting evidence, or a parent/user request. Use `explore` for ordinary source
discovery and named gaps. The parent keeps acceptance and dispatch decisions.

## Prepare independently collected evidence

Follow the [JSON contract](handoff.md). Before implementation, the parent records
resource ownership under [cleanup](cleanup.md) and captures a scoped working-state
baseline; after implementation, capture changes from that baseline, **not just
HEAD**. The shell-denied verifier reads these actual before/after artifacts and
relevant current source; the implementer's summary is only a claim to check.
If review is selected only afterward and no attributable baseline exists, report
that gap. A targeted current-source `explore` assessment may still be useful, but
must not masquerade as a complete before/after review or invent a snapshot.

Parent-run utility (not a plugin; no source writes or automatic cleanup):

```sh
node extensions/handoff/review-evidence.mjs baseline "$TASK_TMP/baseline-input.json"
node extensions/handoff/review-evidence.mjs changes "$TASK_TMP/changes-input.json"
node extensions/handoff/review-evidence.mjs freshness "$TASK_TMP/freshness-input.json"
```

Each input may instead be stdin (`-`). Use absolute utility paths in other projects.
Inputs are JSON, with exact fields:

- `baseline`: `repository`, `scope: {paths, excludes}`, `temp_root`.
- `changes`: `baseline_path`, `baseline_sha256`, `temp_root`.
- `freshness`: `manifest_path`, `manifest_sha256`.

`temp_root` must exist outside the repository and not be its ancestor. Each capture
creates one private `handoff-evidence-*` directory, returning its exact ownership
path, manifest path/digest, IDs, changed/unexpected paths, and limitations. Record
that path immediately, including partial directories returned on failure. Preserve
baseline and snapshot until review, freshness, and parent reconciliation finish;
then remove those exact task-owned directories and verify removal. The utility
never sweeps temporary roots. Retain failure evidence in conversation, not secrets.

The manifest holds working-state fingerprints plus before/after artifact paths
(before relative to `baseline_root`; after relative to the snapshot directory).
There is no raw diff in parent output. Parent token cost is the compact manifest
summary; the worker reads actual artifacts. Bind the manifest digest in the verify
request, together with the returned `snapshot_id`, `freshness`, and `observed_at`
in `review.freshness_proof`. The parent runs freshness immediately before dispatch and again before
acceptance, supplying the actual result to the verifier when needed. Verifiers
cannot compute hashes through shell; mark freshness unverified without attributable
parent proof. Reading stale/tampered evidence never proves acceptance.

## Collection boundaries

Content artifacts are limited to assigned paths. To flag unexpected changes, the
local helper fingerprints nonignored, nonexcluded, nonprotected repository files;
this is local I/O, not additional parent-model source reading. It uses fixed Git
argument arrays, no shell, optional locks, external diffs, textconv, or hooks.
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

The helper must run only under the parent's authorized inspection scope. Capture
does create disposable evidence files; it does not grant edit/test/execution scope.
Unexpected changes, drift, incomplete coverage, or unclear attribution return to
the parent. Exported capture/freshness functions and the CLI have the same limits.
Freshness exits 0 for matched, 1 for drifted/unverified, 2 for collection errors.

## Review and return

1. Confirm task, scope, baseline/snapshot identities, parent freshness proof, and
   permissions. Review the actual artifact contents and relevant current source.
2. Compare changes against each acceptance criterion and invariant. Seek concrete
   counterexamples; distinguish source observations from runtime assumptions.
   Do not merely paraphrase or ratify the implementer's receipt.
   Carry relevant approved check definitions in optional `review.validation_plan`
   when criteria reference their IDs. This is reference material, not execution
   authority. Claimed implementation checks are not checks the verifier performed;
   without trustworthy runtime/log evidence, report that proof as unverified.
3. Return the JSON verify receipt: findings with severity/location/evidence/impact,
   every criterion supported/contradicted/unverified, actual checks, freshness,
   limitations, todos, blockers, and cleanup. Request no default narrative report.
   Put failed implementation criteria in findings/assessments, not review blockers.
   `blockers` describe inability to finish the review; completed reviews use `[]`.
   Report each root cause once, with exact excerpts/lines; do not duplicate findings
   for the same mismatch or invent metadata/checksums to strengthen a citation.
4. The parent assesses findings, coverage, freshness, and cleanup before acceptance.
   It may return in-scope corrections to the attributable implementer under current
   approval; material changes require a revised plan/approval. A new review request
   binds the corrected snapshot; a report-only request never repairs or re-reviews.

`verify` does not edit, run shell/tests/installations, delegate, or approve scope.
Independent session context is not an independent model guarantee. Pending live
permission/model-obedience proof must remain explicit; no automatic service restart.
