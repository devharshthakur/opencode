---
description: Creating issue
model: opencode-go/deepseek-v4-flash
---

# Create GitHub Issue

Create a GitHub issue for the current repository based on user input.

## Input

`$ARGUMENTS`

## Rules

- **Write for humans.** Be conceptual, clear, and well-structured. The issue is for human maintainers to read, not AI agents. Don't dive into code implementation details unless the user explicitly asks for it.
- **Check for templates.** Look for `.github/ISSUE_TEMPLATE/` in the repo. If a template matches the need, use it after getting user approval.
- **Title:** Use conventional commit style (e.g., `feat: add user authentication`).
- **Concise vs detailed:** Keep it concise if the issue is small/straightforward. Be detailed with proper explanation if the issue is complex.
- **Labels:** Attach appropriate labels from the repo's existing label set.
- **Follow repo rules.** Check for `README.md`, `CONTRIBUTING.md`, and other repo docs. Respect the issue format the maintainers specify.
- **Validations only if required.** Don't add unnecessary checklists.
- **Description:** Clean, easy to read. Proper sections, clear language.

## Pre-flight checks

Before drafting, run these checks in order:

1. **Repo check** — Verify current directory is a git repo with a remote. Check that issues are enabled on the remote (e.g., `gh api repos/:owner/:repo` and check `has_issues`).
2. **Auth check** — Verify `gh` is authenticated and the user has permission to create issues in this repo (`gh auth status`).
3. **Duplicate check** — Search both open and closed issues for similar titles/descriptions before creating. Use `gh issue list --state all --search "<keywords>" --limit 20` and review results. If a close match exists:
   - Show the existing issue to the user with its state, title, and link
   - Ask via `question` tool: add to existing issue instead, or proceed with a new one
   - If proceeding with new, note the existing issue in the new issue body as a reference
4. **Existing PR check** — Search for any open PRs that might already address the topic. Use `gh pr list --search "<keywords>" --limit 5`. If found, warn the user.
5. **Repo docs check** — Look for `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `.github/` directory. Read relevant docs to understand the project's issue conventions.

## Workflow

1. Ask if user has any specific details to add beyond what they've already said.
2. Run **pre-flight checks** above.
3. Check repo for issue templates in `.github/ISSUE_TEMPLATE/`. Show the user relevant templates if found; get approval before using one.
4. Draft the issue body using `question` tool for key decisions (title, labels, template choice). Fall back to plain text if `question` format doesn't fit.
5. Confirm the full draft with the user.
6. Create the issue using `gh issue create`.
