---
description: Review code changes, diffs, or full codebase with compressed review output
agent: ask
model: deepseek/deepseek-v4-pro
subtask: false
---

# Review

Review code changes, diffs, PRs, paths, or codebase areas. Produce concise actionable findings.

## Skills

**Mandatory (load on start):**

- `caveman` — ultra-compressed communication
- `caveman-review` — one-line review format (location, problem, fix)

**On-demand:**
Pull any other skill relevant to the review scope (e.g., `codebase-audit-pre-push`, `bug-hunter`, `performance-optimizer`) using the `skill` tool.

## Scope

If scope is missing, ask what to review:

- Full codebase audit — review every file systematically; use `codebase-audit-pre-push`.
- Git diff — review staged/unstaged changes with `git diff`.
- Pull request — accept PR URL/number; use `gh` if available.
- Specific paths — review given files/directories.
- Specific concern — security, performance, correctness, architecture, etc.

## Workflow

Follow in order.

### 1. Gather context

- For small scope, inspect directly.
- For large scope, use focused parallel `explore` subagents. No blanket agents.
- Useful threads: diff/PR context, recent git history, primary files, callers/dependencies, concern-specific patterns.
- Merge results. Do another targeted round only if needed.

### 2. Review

Review the code against these dimensions (adjust depth based on scope):

- Correctness: logic errors, off-by-one, wrong comparisons, null/undefined guards, async issues, unhandled promises, race conditions, stale closures.
- Security: hardcoded secrets, injection (SQL/command/XSS/path traversal), missing auth/authz, data exposure in errors/responses.
- Quality: dead code, unused imports, commented blocks, magic numbers, vague names, long functions, deep nesting, stale TODO/FIXME, debug artifacts.
- Architecture: duplicate logic, god files/functions, tight coupling, missing abstractions.
- Performance: N+1 queries, unbounded loops, hot-path expensive work, missing caching/pagination.

### 3. Format findings

Use one line per finding:

`<file>:L<line>: <severity> <problem>. <fix>.`

Severity prefixes (use when mixed):

- `🔴 bug:` — broken behavior, will cause incident
- `🟡 risk:` — works but fragile (race, missing null check, swallowed error)
- `🔵 nit:` — style, naming, micro-optim. Can ignore
- `❓ q:` — genuine question, not a suggestion

Group findings by file. Start with one-line scope summary.

### 4. Present

Use this structure; no markdown code fences:

- `## Review: <scope summary>`
- `<short summary of review depth>`
- `<file1>:`
- `L<line>: <finding>`
- `<file2>:`
- `L<line>: <finding>`

### 5. Follow-up

After presenting, ask one concise follow-up:

- Fix issues? Suggest `fix` or `execute`.
- Deeper review on an area? Pull relevant skill and re-analyze.
- Findings approved? Close out.

## Rules

- Read-only: never edit files. Delegate fixes to `fix` or `execute`.
- Do not run linters or formatters. Focus on semantic issues.
- Follow `caveman-review`: one line per finding, exact line numbers, concrete fixes.
- If uncertain about scope/depth, ask user.
- Keep output compressed. No filler, no large pasted diffs.
