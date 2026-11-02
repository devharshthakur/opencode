# Verification handoff

## Identity
Request: <unique ID>
Task: <stable ID>
Role: verify
Working directory: <absolute path>

## Review scope and boundaries
<Literal paths/exclusions; independent read-only review. No shell, tests,
edits, repair, delegation, or approval of scope.>

## Independent baseline and changes
<Parent-owned baseline/snapshot IDs, artifact and manifest paths/digests,
actual freshness result and observed time, coverage limitations.>

## Acceptance and required checks
- A1: <approved criterion>
- V1: <approved check and expected result; reference only, not execution authority>

## Context and risks
<Relevant evidence and implementer claims clearly separated from independent proof.>

## Coverage and stopping condition
<Required risk areas, review limits, and exact gaps to report if blocked.>

## Requested return
Use [verification result](verify-result.md). Assess actual before/after artifacts,
not just implementer claims. Review completion is not implementation acceptance.
