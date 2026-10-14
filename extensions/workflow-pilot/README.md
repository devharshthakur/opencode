# workflow-pilot (experimental)

A small, runtime-independent **deterministic approval/handoff core** plus its
offline tests. It is a reference implementation and pilot, not an active feature.

- It does **not** load as a plugin, register configuration, start services,
  spawn processes, or call any OpenCode API.
- It is **not** wired into `/plan`, `/build`, or worker dispatch. Existing
  behavior is unchanged.
- It uses only Node built-in modules (`node:crypto`, `node:path`).

Files:

- `core.mjs` — the state machine, digest, validation, recovery, and handoff generator.
- `contract.json` — closed, versioned **descriptive metadata** contract aligned with
  the validation. It is not executable JSON Schema; `core.mjs` validates.
- `../../tests/workflow_pilot_test.mjs` — Node built-in tests.

Run the tests:

```sh
OPENCODE_TMP_DIR=/private/var/folders/js/rq5gtxp12dv_yhbxkxqp4rsc0000gn/T/opencode \
  node --test tests/workflow_pilot_test.mjs
```

## Test filesystem scope

Tests honor `OPENCODE_TMP_DIR` and fall back to `tmpdir()/opencode` when it is
unset. Each test creates one `mkdtemp` directory under that base and removes only
that task-owned directory; the base and any pre-existing data are left alone.

## What it models

A frozen proposal (plan text, revision, repository, original checkout, origin
session, phase IDs, operation limits) is tracked through:

```text
awaiting-approval -> approved -> dispatching -> running -> completed | blocked | cancelled
```

Key behaviors:

- **Canonical revision digest.** A SHA-256 digest is computed over the full,
  normalized proposal with object keys sorted recursively. It binds an approval
  receipt to one exact proposal revision.
- **Fixed local-build policy.** Workflow `build`, isolation `current`, base
  `local`, delivery `local`, commit confirmation `required`.
- **Full-record validation on every operation.** Every function that takes a
  record validates the whole record first, not only `deserialize()`. It checks
  required and unknown fields at the record, approval, dispatch, result,
  judgment, and history levels; the digest; approval binding and identity;
  dispatch structure and id; the affirmative judgment; the history transition
  chain; and final-state consistency. Malformed or inconsistent state fails
  closed.
- **Stale/revised approval invalidation.** `revise()` advances the revision and
  returns a fresh `awaiting-approval` record with no approval. A receipt whose
  digest does not match the current proposal is rejected (`stale-approval`).
- **Explicit partial-phase approval.** `approved_phases` must be a non-empty
  unique subset of the proposal's phases.
- **Idempotent dispatch reservation requiring approval.** `reserveDispatch()`
  requires an approved record with a current, valid approval. Repeating a
  reservation with the same `idempotency_key` is a no-op; a different key while
  dispatching is `duplicate-dispatch`.
- **Worker-ID recording with conflict detection.** `running` and `completed`
  require an attributable `worker_id`. Re-attributing the same worker id is
  idempotent; a different worker id is `conflicting-worker-id`.
- **Restored-state validation.** `deserialize()` re-checks the whole record and
  recomputes the digest before trusting it.
- **Cancellation** and explicit `block`.
- **Fail-closed crash recovery.** `recover()` on an in-flight record with no
  worker id blocks it (`block-and-reconcile`, `replay: false`); it never replays.
- **Deterministic JSON handoff.** `handoffFromRecord()` returns the structured
  envelope; `renderHandoff()` renders it as stable JSON (`JSON.stringify`), so
  free text cannot alter structure. Callers read authority from parsed fields,
  never by string matching.

## Revision states

`revise()` is rejected during active dispatch (`dispatching`, `running`) and for
any record whose dispatch reservation has no attributable worker id (an uncertain
`blocked` record). It is allowed from `awaiting-approval`, `approved`,
`completed`, `cancelled`, or `blocked` with an attributable worker id. The
original record is never mutated. A revised approval is not permission to replay
uncertain work.

## Honest trust and boundary limits

- The digest **detects change and binds approval** to the exact proposal. It does
  **not** authenticate a human, prove who approved, or stop a determined writer.
- Approval receipts are **simulated trusted-adapter inputs** in tests. This code
  performs no real authorization.
- **Semantic completion requires an affirmative acceptance judgment plus
  evidence from a future trusted adapter.** A worker returning successfully is
  not proof; `complete()` rejects negative, unknown, or malformed judgments and
  does not establish semantic truth.
- Guarantees are **in-process object-state guarantees only**. There is no
  documented multi-process atomicity, durable storage guarantee, exactly-once
  dispatch, permission enforcement, or sandbox claim. `contract.json`
  `boundaries` records this explicitly.
- `renderHandoff()` produces an **inactive, offline envelope**. A live handoff
  still needs future adapter fields and verified runtime facts (host
  confirmation, real session and worker identity, permissions). It is not
  dispatch-ready authorization.

## Compatibility evidence (checked 2026-10-13)

Installed artifacts are read-only inspected. No services were started or probed,
so **actual runtime support is unverified**. Published docs are not proof of
installed support.

Installed:

- OpenCode CLI: `opencode v2.0.28` (`opencode --version`).
- Plugin package: `@opencode-ai/plugin` version `1.19.0`
  (`node_modules/@opencode-ai/plugin/package.json`).
- **Package API gaps** in `@opencode-ai/plugin@1.19.0` (not a runtime claim):
  the installed V2 plugin context is narrow.
  `node_modules/@opencode-ai/plugin/dist/v2/promise/context.d.ts:11-21` exposes
  only `options`, `agent`, `aisdk`, `catalog`, `command`, `integration`, `plugin`,
  `reference`, `skill`.
  `node_modules/@opencode-ai/plugin/dist/v2/promise/index.d.ts:1-12` confirms the
  same public surface.
  `node_modules/@opencode-ai/plugin/dist/v2/effect/command.d.ts:3-8` shows a
  command draft with `list/get/update/remove` (no `add`/`execute`).

Published V2 docs (fetched 2026-10-13) describe a wider context than these
1.19.0 typings expose:

- `https://opencode.ai/v2/docs/build/plugins` documents `ctx.storage`, `ctx.session`,
  `ctx.permission`, `ctx.tool`, `ctx.generate`, `ctx.event`, `ctx.location`,
  `ctx.app`, and command editors with `add`/`execute`.
- `https://opencode.ai/v2/docs/build/plugins/rpc` documents `ctx.rpc` and
  `@opencode/plugin/rpc`.

Unresolved runtime integration capabilities (the version number and one
dependency's typings show the **package** lacks these interfaces; they do **not**
show the live v2.0.28 runtime lacks them anywhere — runtime support is
unverified because no service was started or probed):

- Trustworthy host confirmation tied to a frozen revision.
- Native hidden-implement dispatch without a permission bypass.
- Durable storage and concurrency guarantees.
- Usage/token counters.
- Package/import-name drift (`@opencode-ai/plugin@1.19.0` vs `@opencode/plugin`,
  and doc import paths such as `@opencode/plugin/rpc`).

These are documented blockers for a later, separately-approved live integration,
not reasons to skip the offline core.

## Later integration constraints (require a new plan and approval)

Any opt-in integration must:

- Keep existing `/plan` and yes/approval behavior until separately authorized.
- Tie host confirmation to the frozen revision digest.
- Obey native permissions and the configured worker model; add no permission
  bypass and no model override.
- Keep trusted approval out of model-writable proposal data.
- Measure a whole session family (input, output, reasoning, cache, retries,
  latency, quality) before claiming any savings; this pilot reports no
  token-savings percentage.
- Treat the package API gaps above as documented dependencies, not assumptions
  of durable, exactly-once, or runtime-confirmed behavior.
