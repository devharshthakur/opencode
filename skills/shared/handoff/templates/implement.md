# Implementation handoff

## Identity
Request: <unique ID>
Task: <stable ID>
Role: implement
Working directory: <absolute path>
Approved plan revision: <title/revision>
Assigned phases: <approved phase IDs>
Execution: <new work | continuation>
Worker session/checkpoint: <not started, or verified attributable session/state>

## Outcome
<Current behavior, desired behavior, and motivation.>

## Authority and boundaries
Approval: <actual approval text and the revision/phases it covers>
Scope: <literal paths and exclusions>
Preserve: <existing changes and invariants>
Operation limits: <explicit editing, branch/worktree, stage/commit/push/PR limits>
Execution setup: <workflow build; single-worker or sequential per-todo-worker;
original checkout; isolation/base intent;
verified existing isolation if reused; no worker replay>
Authorized skills: <IDs with their actual written triggers; listing is not invocation>

## Relevant context
<Decisive evidence with IDs/provenance, entry points, dependencies, limitations.>

## Assigned plan
Approved assignment: <exact assigned phases/outcomes from the human plan;
preserve revision, IDs, order, acceptance, and limits>

Supporting execution detail:
- T1 [pending], phase <ID>: <implementation steps within the approved assignment>
- T2 [pending], phase <ID>: <implementation steps within the approved assignment>

Fixed decisions: <required approach/invariants>
Worker discretion: <ordinary choices within approved boundaries>

## Acceptance
- A1: <observable criterion>
- A2: <observable criterion>

## Required validation
- V1: <command/check, expected result, associated criteria>
- V2: <command/check, expected result, associated criteria>

## Clarification and stop conditions
<Task-specific conditions; unresolved requirements go to the parent before acting.>

## Requested return
Use [implementation result](implement-result.md) and the shared contract.
Provide detailed, self-contained evidence for parent assessment, not an activity diary.
Adapt headings/grouping to the task while preserving required information.
Add task-specific sections only when relevant (compatibility, migration, UI,
security, performance); omit these instructional sentences from filled requests.
