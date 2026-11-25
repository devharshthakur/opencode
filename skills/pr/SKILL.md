---
name: pr
description: Prepare task-scoped commits and create or update a verified GitHub pull request
metadata:
  opencode/autoinvoke: false
---

# GitHub pull request

`/pr` is the only way a PR is created or updated. No other workflow offers, hints
at, or starts one. Use the [output templates](references/templates.md) for all
create, update, custom-target, and draft delivery. Resolve the target with the
[target rules](references/targets.md).

## Establish authority and target

1. Require an explicit `/pr` invocation. A bare `yes`, quoted approval, or earlier
   plan approval never authorizes delivery. Preserve the current model; execute
   directly in `dev`, without workers. In `chat`, ask the user to select `dev`
   instead of broadening permissions.
2. Parse arguments as `[:<base>] [@<remote>] [draft]`, in any order, each at most
   once. Reject unknown or duplicate tokens and empty values. `:<base>` is a branch
   name and `@<remote>` is a configured git remote name; validate both with Git,
   never as URLs, `owner/name`, or shell syntax, and quote every value. Bare names
   are not shorthand. `draft` makes a new PR a draft; new PRs otherwise open ready
   for review.
3. Read destination instructions and `../git-isolation/scripts/preflight.sh`, then
   run that helper in the checkout. Inspect index, unstaged/untracked content,
   existing commits, remotes, upstream, and branch push configuration. Preserve
   unrelated work and the existing index. Detached/unborn HEAD, secrets, or staged
   changes outside the delivery scope block delivery.
4. Consult current official Git and GitHub CLI documentation before relying on
   commands. Verify `gh` availability/authentication for the resolved host without
   printing tokens. Verify GitHub (or configured GitHub Enterprise) hosting from
   fetch/push destinations without printing embedded credentials. Distinguish the
   base (target) repository from the head (push) repository, and verify permissions
   and branch relationships. Do not assume `origin`; resolve ambiguous remotes or
   URL rewrites before mutation.
5. Resolve the base repository, base branch, and head repository/branch by the
   [target rules](references/targets.md). Record the invocation text, checkout,
   explicit tokens, resolved repositories and branches, and existing PR identity.
6. Query open PRs using the exact head repository/branch and target repository.
   Reuse a matching existing open PR; multiple matches require clarification.
   Existing PRs retain their base/draft state unless a token explicitly changes it.

## Prepare and review outgoing changes

1. Verify task acceptance and required local checks, including recorded baseline
   limitations, when the session has task history. Newly failing required checks
   block publishing; report known baseline failures honestly rather than inventing
   green.
2. Delivery scope is all uncommitted changes plus every commit ahead of the
   resolved base ref (`<remote>/<base>`). Do not require session attribution.
3. Branch handling follows the [target rules](references/targets.md#head-branch).
   Preserve uncommitted work in place; no stash, reset, clean, or manual patch
   transfer. Never push directly to a base/protected branch. No new worktree is
   needed.
4. If changes are uncommitted, load `commit` using the skill tool with the exact
   scope and `Confirmation policy: not-required`. Output the commit table from the
   commit skill's output template. The inner commit stops at local verification;
   this skill alone owns subsequent publication and the final response.
5. Fetch only the verified base and head refs if local information is insufficient;
   fetching does not authorize merging or rebasing. Review the complete outgoing
   diff and history relative to the verified base ref. Secrets, an empty diff,
   merge commits, or commits by an author other than the configured Git identity
   block publication. List the blocking commits; there is no override.

## Write for the reviewer

Use the [default PR body](references/templates.md#pr-body) unless repository PR
templates or contributor guidance require another layout. Read `GLOSSARY.md` if
present and use the user's domain language. Keep the default headings unless a
material reviewer need warrants an extra section; use plain prose in PR content.

- Title: Conventional Commit `<type>[optional scope][!]: <description>`, normally
  at most 72 characters. Types include `feat`, `fix`, `perf`, `refactor`, `style`,
  `chore`, `docs`, `test`, `build`, `ci`, and `revert`. Select the dominant change;
  mark breaking changes only when verified.
- Use GitHub-flavored Markdown. No Mermaid unless requested. Omit Merge Danger;
  still describe real compatibility/migration requirements where useful. Review
  checklists belong at the end when they help, not as mandatory filler.
- Record actual checks, failures, unrun checks, and pending CI distinctly. Checked
  validation boxes mean verified results; pending reviewer actions stay unchecked.
  Before/after proof must be observed, not fabricated for a template.
- Long logs may use `<details>`; screenshots/tables/ASCII trees only when clearer
  than prose. Do not upload local files or screenshots without checking for secrets
  and confirming attachment scope. Use `Refs #...` for verified issues; automatic
  issue-closing keywords require separate explicit closure authorization.
- For an existing PR, read its current title/body/labels first. Preserve human-written
  description content and existing labels. Refresh only attributable generated
  content; stop if ownership is unclear rather than overwrite a human description.

## Publish and verify

1. Record exact host, base/head repositories and branches, title/body, draft state,
   type label, and PR identity (if any). Use explicit destinations and safely quoted
   arguments/body files or stdin, never interpolated user text as shell code.
2. Ensure the matching Conventional Commit type label exists in the base
   repository. Create it only if absent; never use `--force` or alter existing label
   colors/descriptions. If label creation is denied, report the blocker; do not
   broaden permissions or silently omit the requested label.
3. Push only the verified head to its explicit remote/ref. Use a normal push;
   non-fast-forward rejection blocks delivery. No force-push, automatic fork,
   merge, rebase, deployment, or branch deletion.
4. Recheck for an existing matching open PR immediately before creation. Use
   `gh pr create` with explicit `--repo`, `--base`, `--head`, `--title`, `--body-file`,
   `--label`, and `--draft` only when requested. Use `<owner>:<branch>` for `--head`
   when the head repository differs from the base repository. For a matching
   existing PR use `gh pr edit` on its exact number/URL with explicit repository;
   preserve human content and labels, and change base/draft only when explicitly
   requested. Consult current CLI syntax for draft conversion. Unsupported fork/head
   forms are blockers, not permission to silently choose another repository.
5. Read back the PR URL, base/head repository/branch, title/body, labels, draft state,
   and published head SHA. Distinguish pending CI from local validation. A failed
   command can still create a PR: on uncertainty, inspect remote state before any
   retry. Never duplicate a PR or repeat completed commits after interruption.
6. Follow the [chat result](references/templates.md#chat-result): on success,
   reply with only the verified PR URL. If delivery is blocked, report the
   precise blocker.

**Done when:** the created/updated PR and published head are verified and its URL
is reported, or a precise blocker is recorded with local/remote state preserved.
No automatic merge, issue closure, branch cleanup, or external skill deletion.

## Dependencies

- `commit`: only when PR preparation needs local commits; pass
  `Confirmation policy: not-required`.
- `opencode`: only for OpenCode-specific behavior needed by the task.
- `writing-for-agents`: only when the task itself changes agent instructions,
  commands, or skills; not for ordinary PR prose.
