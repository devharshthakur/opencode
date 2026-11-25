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
2. Read destination instructions. Start from the command's invocation snapshot
   (`preflight.sh` output and recent commits); without one, run
   `sh ../git-isolation/scripts/preflight.sh` with the checkout as workdir.
   Inspect index and unstaged/untracked content. Preserve unrelated work and the
   existing index. Secrets or staged changes outside the delivery scope block delivery.
3. Run the target resolver once with the shell tool, checkout as workdir, passing
   each `/pr` argument as a separate single-quoted word:
   `sh <pr-base>/scripts/pr-target.sh [':<base>'] ['@<remote>'] ['draft']`, where
   `<pr-base>` is this skill's base directory. It is a trusted read-only helper:
   run it, do not read it. It implements the [target rules](references/targets.md):
   argument syntax, push-remote and base resolution, GitHub hosting without
   printing credentials, `gh` authentication, head push permission, base branch
   existence and local base-ref freshness, head branch action, outgoing-history
   identity and merge checks, and matching open PRs. It never fetches or mutates.
   - Exit `2`: invalid arguments; report its usage error and stop.
   - Exit `3` (`result: blocked`): every `BLOCKER:` line stops delivery. Report
     them verbatim with their suggested `/pr` form. Exception: a missing or stale
     base ref blocker allows exactly `git fetch <remote> <base>` for the named
     ref, then rerun the resolver once.
   - Exit `0` (`result: ready`): use its `key: value` facts as the resolved
     target record. Do not re-derive them with separate Git or `gh` calls.
4. Record the invocation text, checkout, explicit tokens, resolved repositories
   and branches, `head_action`, `gh_head_arg`, and `existing_pr`. Reuse a single
   matching open PR; existing PRs retain their base/draft state unless a token
   explicitly changes it. Consult current official Git and GitHub CLI documentation
   only for commands the resolver does not run: branch creation, push, label
   creation, and `gh pr create/edit/view`.

## Prepare and review outgoing changes

1. Verify task acceptance and required local checks, including recorded baseline
   limitations, when the session has task history. Newly failing required checks
   block publishing; report known baseline failures honestly rather than inventing
   green.
2. Delivery scope is all uncommitted changes plus every commit ahead of the
   resolved base ref (`<remote>/<base>`). Do not require session attribution.
3. Branch handling follows the resolver's `head_action` (spec:
   [target rules](references/targets.md#head-branch)). For `create-branch`, pick an
   unused `feat/<slug>` or `fix/<slug>` name. Preserve uncommitted work in place;
   no stash, reset, clean, or manual patch transfer. Never push directly to a base/protected branch. No new worktree is
   needed.
4. If changes are uncommitted, load `commit` using the skill tool with the exact
   scope and `Confirmation policy: not-required`. Output the commit table from the
   commit skill's output template. The inner commit stops at local verification;
   this skill alone owns subsequent publication and the final response.
5. Fetch only the verified base and head refs if local information is insufficient;
   fetching does not authorize merging or rebasing. After any branch creation or
   commits, rerun the resolver with the same arguments; it must report
   `result: ready`, `head_action: reuse`, and the final `existing_pr`. Its
   outgoing-history check covers merge commits and authors other than the
   configured Git identity; there is no override. Review the complete outgoing
   diff relative to the verified base ref yourself: secrets or an empty diff
   block publication.

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
