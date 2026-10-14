---
description: Diagnose and plan, then repair on a feature branch after approval
agent: ask
subagent: false
---

Load `fix-diagnosis` using the skill tool. Authorize its declared dependency manifest only at
written triggers, plus user-requested additions. Mode: approval-triggered repair; isolation: branch;
delivery policy: auto. Request a missing bug before proceeding.

Diagnose and plan read-only; no tests, setup, fetches, mutations, or worker launch before approval.
No remote means local repair without commits by default. A verified GitHub target permits a proposal
for scoped commits, push, and PR; other/ambiguous targets or missing access require a decision.
Ask approval naming exact plan, base, isolation, and delivery operations. On explicit approval,
invoke hidden `implement` with workflow `deliver`, kind `repair`, and approved operation booleans.
Use `fix/`; create no worktrees, including verification worktrees. Retain task branch and results.
Honor user delivery limits. Use `issue`, `fix plan`, and `result` sections.

Bug, explicit base, and user constraints:
$ARGUMENTS
