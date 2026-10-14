---
description: Diagnose and plan, then repair and publish a GitHub PR after approval
agent: ask
subagent: false
---

Load `fix-diagnosis` using the skill tool. Authorize its declared dependency manifest only at
written triggers, plus user-requested additions. Mode: approval-triggered repair; delivery policy:
required GitHub publishing. Use worktree isolation unless the user explicitly requests branch-only.

Diagnose and plan read-only; no tests, setup, fetches, mutations, or worker launch before approval.
Verify GitHub target/access before proposing scoped commits, push, and PR. Missing remotes/access
are blockers, not local-only fallback. Ask approval naming plan, base, isolation, and publishing target.
On explicit approval, invoke hidden `implement` with workflow `deliver`, kind `repair`, and approved
operation booleans. Use `fix/`; commit-plan confirmation is not required after this exact approval.
Honor user limits; clarify conflicts rather than dropping them. Request a missing bug before proceeding.
Retain isolation. Use `issue`, `fix plan`, and `result` sections.

Bug, issue, explicit base, and user overrides:
$ARGUMENTS
