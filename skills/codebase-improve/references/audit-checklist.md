# Audit checklist

Use the relevant category sections, not a mandatory whole-repository checklist.
Shared [exploration](../../plan/references/exploration.md) owns evidence packets
and verification routing. Each audit brief names its sections and distinct scope.

## Categories

- **bugs:** reachability of error paths, state transitions, boundary inputs,
  concurrency/idempotency, cleanup and cancellation. Inspect relevant callers and
  guards before claiming impact; an unreachable helper edge is not a user defect.
- **security:** authorization and ownership at actual sinks, validation, interpreter
  boundaries, sensitive logging, resource abuse, and deployment assumptions.
  Never reproduce credentials or misuse payloads. Distinguish observed exposure
  from missing explicit configuration and unverified platform/SDK defaults.
- **perf:** repeated queries/work, payload growth, concurrency/latency, resource
  bounds and hot paths. Separate measured regressions from scale hypotheses;
  query plans and benchmarks are proof only when actually obtained safely.
- **tests:** critical unprotected behavior, meaningful seams, weak assertions,
  nondeterminism, and runnable verification. Respect documented testing policies;
  proposing a new baseline is a maintainer decision, not automatic permission.
- **debt:** coupled changes, drifted contracts, layering, duplication, dead code,
  and unclear interfaces. Cite callers/usage coverage; absence in one search does
  not establish global non-use. Prefer concrete maintenance cost over aesthetics.
- **deps:** reachable advisories, compatibility/deprecation, runtime versus tooling
  exposure, manifest/lockfile/schema drift. Verify affected versions and defaults
  from current official sources; an audit severity is not proof of exploitability.
- **dx:** setup steps, safe local verification, build/lint/typecheck feedback,
  configuration, diagnostics and CI. Inspect scripts before proposing/running them;
  "check" commands may write caches or contact mutable services.
- **docs:** wrong guidance, missing public contracts, and undocumented decisions
  that have concrete cost. A supported version range differing from a local image
  version is not by itself a contradiction.
- **next:** stated-but-undelivered intent, unfinished flows, surface asymmetries,
  or adjacent capabilities unusually cheap for this codebase. Separate product
  judgment from defects; frame uncertain ideas as design spikes with tradeoffs.

## Finding format

Use a stable category ID, such as `BUG-01` or `PERF-01`, then:

- **Finding:** specific change or investigation; mark proposals distinctly.
- **Evidence:** exact paths/symbols and bounded line ranges, decisive short excerpts
  when needed, relevant guards/callers, counterevidence, and revision when known.
- **Impact:** who is affected and the supported consequence, including reachability.
- **Effort / Risk:** S (hours), M (about a day), L (multi-day); what the fix can break.
- **Verification / Confidence:** checks actually performed and results; source facts
  versus SDK/runtime assumptions; unresolved questions. HIGH means sufficient
  evidence for the claim, not simply that someone read a file. MED/LOW claims with
  unresolved premises get investigation plans rather than promised fixes.
- **Fix sketch / Dependencies:** 1–3 sentences sufficient to judge the proposal,
  real prerequisites, and decisions requiring maintainer input.

End the packet with sufficiency or the smallest missing evidence as defined in
the shared protocol. Return no file dumps or speculative padding. Verification
must explicitly account for by-design behavior, wrong attribution, duplicate
findings, unsupported external defaults, and contradictory evidence. A rejected
claim need not become a finding just to document the rejection.
