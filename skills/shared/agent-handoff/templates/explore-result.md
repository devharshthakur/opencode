# Exploration result

## Identity and status
Request: <request ID>
Task: <task ID>
Role: explore
Status: <completed | partial | blocked>

## Conclusions and supporting evidence
<Each conclusion maps to the question/decision and supporting evidence IDs.>
<New evidence: ID, path/symbol, bounded lines, exact decisive excerpt,
revision if known, claim and limitations.>

## Hypotheses and counterevidence
<Separate assumptions, external-library uncertainties, and conflicting evidence.>

## Recommendations
<Evidence-backed options for the parent; no new authority.>

## Coverage and actual checks
<Areas examined, actual read/search/doc checks and results, omitted areas.>

## Sufficiency and gaps
<Sufficient for which decision, or exact missing evidence and smallest next lookup.>

## Targeted parent reads
<Question plus exact bounded source range for each read, or none needed.>

## Todos, blockers, and cleanup
<Final scoped Todo IDs/statuses/evidence; blockers; resources/cleanup or none.>

## Filled pattern

Fictional and adaptable: replace every value, keep or rename headings, and never
cite this pattern as observed evidence.

```markdown
# Exploration result

## Identity and status
Request: request-23
Task: retry-delay
Role: explore
Status: completed

## Conclusions and supporting evidence
- Q1 — Retries use a fixed 2 s delay with no jitter. E1, src/net/retry.ts:31-38:
  `await sleep(2000);`; no jitter helper is imported in this file.
- Q2 — In-scope callers pass the delay through unchanged. E2,
  src/net/client.ts:54-61 sets no tighter deadline.

## Hypotheses and counterevidence
- H1 — A deployment override may exist outside scope. No config path was found by
  the bounded search; unresolved.

## Recommendations
- Prefer jitter inside the existing retry helper; keep the 2 s base delay.

## Coverage and actual checks
- Read src/net/retry.ts in full; searched src/net for `sleep(` and `jitter`.
- Omitted generated/ and vendor/ by scope; no tests run (read-only).

## Sufficiency and gaps
- Sufficient for deciding where to add jitter (Q1).
- Missing for H1: whether production config overrides the delay; smallest lookup is
  the deployment config path the parent names.

## Targeted parent reads
- None needed for Q1/Q2; see H1 for the unresolved config lookup.

## Todos, blockers, and cleanup
- No Todos assigned. No blockers. No resources created.
```
