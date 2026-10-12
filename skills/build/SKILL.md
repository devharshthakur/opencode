---
name: build
description: Execute the explicitly approved plan or phases, validate, and stop before delivery
metadata:
  opencode/autoinvoke: false
---

# Build

Execute only the identified approved plan/fix plan or phases with `edit`. This workflow has
no isolation or delivery subsystem; those operations require separate authority.

## Approval gate

Identify the exact plan, approved phases, and explicit approval in conversation/user context.
Approval must clearly refer to that scope (`approve plan`, `go ahead`, `build it`, or equivalent).
A pasted plan, quoted approval, silence, or `/build` invocation alone is insufficient. If any
part is missing or ambiguous, request it before mutations or write-producing commands.
If the selected agent is read-only, direct the user to `/build`; never bypass its permissions.

## Execution

1. Read relevant instructions/code and inspect Git state. With shell permission, run
   `sh <this-skill-base>/../git-isolation/scripts/preflight.sh` in the checkout, then inspect
   relevant diff contents and untracked files. This runs inspection, not the isolation workflow.
2. For a dirty checkout, agree through `question` how to preserve existing work before editing.
   Plan approval does not include unrelated changes; reuse an already agreed handling decision.
3. Implement one approved phase at a time. Keep a concise checkpoint of scope, approval,
   changed paths, current phase, and check results. After interruption, recheck Git state and
   approval context rather than assuming ownership or restarting completed work.
4. Validate each meaningful phase using acceptance and repository-required checks. Fix only
   task-related failures within approved scope; distinguish baseline failures with evidence.
5. If assumptions fail or behavior, risk, scope, or authority materially changes, stop and
   request a revised plan and approval. Do not silently switch to autonomous delivery.
6. Review the complete task diff and report changes, checks, staged status, and blockers.
   For changed agent permissions or skill instructions, recommend a fresh session to validate
   the new behavior; use documented feature-specific reload guidance rather than blanket restarts.

**Done when:** approved acceptance and required checks pass and the diff is reviewed, or an
exact blocker is reported with useful work preserved. No automatic isolation, staging, commits,
publishing, or unrelated cleanup. Authority ends with this execution phase.
