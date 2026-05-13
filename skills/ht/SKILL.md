---
name: ht
description: Personal development workflow for issue-first planning, manual implementation guidance, implementation review, and agent-run delivery. Use when working on GitHub issues, turning prompts into implementation work, deciding whether to create an issue, or coordinating agent implementation.
---

# HT Development Workflow

Personal workflow for agents acting on HT's behalf. Default: understand first, teach implementation, then ask before mutating repo/GitHub.

## Core defaults

- Prefer issue-first workflow for moderate or larger work.
- Default mode: read-only analysis and planning.
- Never edit, branch, stage, commit, push, create PR, merge, or close issue without explicit approval for that phase.
- Explain implementation so HT can do it manually before offering agent implementation.
- Stay scoped. No opportunistic cleanup or broad refactors.
- Use `ht-git` for branch, commit, PR, merge, and close mechanics.
- Use `pnpm` for Node and `uv` for Python unless repo says otherwise.

## Case 1: Issue number/URL provided

### 1. Fetch and understand

- Accept `123`, `#123`, or GitHub issue URL.
- Run `gh issue view <issue> --json number,title,body,state,labels,assignees,comments,url`.
- If closed, ask whether to continue.
- Extract: problem/request, expected behavior, acceptance criteria, linked files/logs/screenshots/PRs/branches/comments, likely work type.

### 2. Analyze codebase read-only

- Use `read`, `glob`, `grep` first.
- Bash is info-only: `git log`, `git diff`, `gh issue view`, safe status/listing commands.
- Use focused `explore` subagents only when issue spans many modules.
- Inspect current behavior, callers/dependencies, tests/fixtures, config/routes/schema/migrations where relevant.
- Do not edit or run mutating git commands.

### 3. Teach manual implementation first

Output:

## Issue #<number>: <title>

**Understanding**:

- <1-3 bullets>

**Root Cause / Need**: <diagnosis or required capability>

**How to implement**:

- `<path>` — <what changes>; <why>
- `<path>` — <what to add/remove/update>; <why>

**Code sketch**:
<small snippets only for key edits; avoid huge diffs>

**Validation**:

- <targeted checks/tests>

Ask: `Want exact code changes, want to implement yourself and have me review, or want me to implement?`

### 4A. User implements manually

If HT implements and asks for review:

- Inspect `git diff`, `git diff --cached`, and relevant files.
- Compare implementation against issue acceptance criteria and prior plan.
- Check tests/validation if useful.
- Report:
  - correct parts
  - missing/incorrect parts
  - exact fixes needed
  - whether ready for commit/PR
- Do not commit/push unless explicitly asked.

### 4B. Agent implements

Start only after explicit implement approval.

- Load `ht-git`.
- Follow its issue branch workflow using branch `issue/<number>`.
- Implement only approved suggested changes.
- Make one logical change at a time.
- If analysis proves wrong, stop and ask before changing direction.
- Add/update tests when acceptance criteria or behavior change requires it.
- Run targeted validation.
- Prefer multiple commits for multi-part implementation; one commit for small coherent work.
- After implementation/commits, ask: `Create PR?`
- After PR, ask: `Merge PR and close issue?`

## Case 2: Prompt/problem without issue

Classify scope before implementation:

- Small/simple/focused: plan or implement directly after approval.
- Moderate/issue-worthy: ask preference to create issue first. Recommended: issue-first.
- Large/unclear/high-risk: ask to create/refine issue first; do not proceed from vague prompt.

Issue-worthy signals:

- touches multiple files/modules
- changes behavior/API/schema/auth/data flow
- needs tests, migration, or rollout notes
- requires acceptance criteria or future tracking
- likely needs PR review

If creating issue first:

- Draft title, body, acceptance criteria, validation plan, labels.
- Ask approval before `gh issue create`.
- After creation, continue via Case 1.

## Safety

- Never force push.
- Never bypass hooks/checks unless HT explicitly asks and risk is restated.
- Never merge with failing/pending checks unless HT explicitly approves override.
- Never use `Closes #<issue>` in PR body unless HT asks; prefer `Refs #<issue>` and close separately after merge.
- Never close issue before merge unless HT explicitly asks.
- Warn before destructive/irreversible actions.
