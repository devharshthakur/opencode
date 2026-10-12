---
description: Diagnose and repair through scoped commits, push, and a verified PR
agent: edit
subagent: false
---

Load `implement` with the skill tool for autonomous repair/delivery. Authorized dependencies: `git-isolation`,
`fix-diagnosis`, `surgical-patch`, `commit`, and relevant `opencode`, plus user-named additions.
Use worktree isolation by default, or branch-only for an explicit no-worktree request,
prefix `fix/`; stop for conflicting instructions. Within verified isolation, use diagnosis
and surgical repair before the delivery stages; do not switch to `/plan` or require `/build`.
Invocation authorizes isolation, local repair/validation, scoped staging/commits without
routine commit-plan approval, normal push, and PR creation/update. Honor user base overrides
and delivery limits from `AGENTS.md`. Follow the skills' gates and reporting/retention rules.
Request a missing bug before mutation; stop for unresolved cause/behavior or scope expansion.

Bug, issue, explicit base, and user overrides:
$ARGUMENTS
