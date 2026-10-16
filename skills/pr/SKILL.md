---
name: pr
description: Prepare task-scoped commits and create or update a verified GitHub pull request
metadata:
  opencode/autoinvoke: false
---

# GitHub pull request

## Establish authority and target

1. Read [PR offer/authorization](../shared/pr-offer.md). Require explicit `/pr`
   invocation or a direct reply to the pending offer, with attributable task scope.
   Preserve the current model; execute directly in `dev`, without workers. In
   `chat`, ask the user to select `dev` instead of broadening permissions.
2. Read destination instructions and
   `../git-isolation/scripts/preflight.sh`, then run that helper in the checkout.
   Inspect index, unstaged/untracked content, existing commits, remotes, upstream,
   and branch push configuration. Preserve unrelated work and the existing index.
   Detached/unborn HEAD, secrets, mixed unrelated hunks/staged changes, or unclear
   ownership block delivery. Do not treat all dirty files as task-owned.
3. Consult current official Git and GitHub CLI documentation before relying on
   commands. Verify `gh` availability/authentication for the resolved host without
   printing tokens. Distinguish the base repository from the head/push repository
   in fork workflows; verify GitHub hosting, permissions, and branch relationships.
   Prefer configured upstream/push relationships; do not assume `origin`. Resolve
   ambiguous remotes, URL rewrites, or multiple destinations before mutation.
4. Query open PRs using the exact head repository/branch and target repository.
   Reuse a matching existing open PR; multiple matches require clarification.
   New PRs default explicitly to `main`, even if GitHub's default differs; verify
   the requested base exists. A missing base is a blocker, not a silent fallback.
   Existing PRs retain their base/draft state unless explicitly changed. Never
   retarget a PR or convert its draft state from an omitted option.

## Prepare and review outgoing changes

1. Verify task acceptance and required local checks, including recorded baseline
   limitations. Unverified task acceptance or newly failing required checks block
   publishing; report known baseline failures honestly rather than inventing green.
2. Reuse an attributable task branch when safe. If on `main`, the selected base,
   or another verified protected/default branch, create an unused `fix/<slug>` or
   `feat/<slug>` task branch from current local HEAD before committing. Preserve
   uncommitted work in place; no stash, reset, clean, or manual patch transfer.
   Validate the name, avoid collisions, and verify the destination branch/status.
   Never push directly to a base/protected branch. No new worktree is needed.
3. If task changes are uncommitted, load `commit` using the skill tool with exact
   task scope and `Confirmation policy: not-required`. Present files/messages and
   commit only attributable changes. The inner commit stops at local verification;
   this skill alone owns subsequent publication and the final response.
4. Verify the remote base/head without implicit merge/rebase. Fetch only the
   necessary verified refs if local information is insufficient; fetching does not
   authorize integrating changes. Review the complete outgoing diff and history
   relative to the verified base, not only the latest task edits. Unrelated commits,
   secrets, empty changes, or uncertain ownership block publication. Do not push
   unrelated commits merely because only task files were staged.

## Write for the reviewer

Read [type-specific template references](references/templates.md) and any repository
PR template/contributor guidance. Adapt sections to the actual change; templates
are references, not forms. Read `GLOSSARY.md` if present and use the user's domain
language. Prefer short prose, bullets, meaningful links, and fenced snippets.

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
2. Ensure the matching Conventional Commit type label exists in the target
   repository. Create it only if absent; never use `--force` or alter existing label
   colors/descriptions. If label creation is denied, report the blocker; do not
   broaden permissions or silently omit the requested label.
3. Push only the verified task head to its explicit remote/ref. Use a normal push;
   non-fast-forward rejection blocks delivery. No force-push, automatic fork,
   merge, rebase, deployment, or branch deletion.
4. Recheck for an existing matching open PR immediately before creation. Use
   `gh pr create` with explicit `--repo`, `--base`, `--head`, `--title`, `--body-file`,
   `--label`, and `--draft` only when requested. For a matching existing PR use
   `gh pr edit` on its exact number/URL with explicit repository; preserve human
   content and labels, and change base/draft only when explicitly requested.
   Consult current CLI syntax for draft conversion. Unsupported fork/head forms
   are blockers, not permission to silently choose another repository.
5. Read back the PR URL, base/head repository/branch, title/body, labels, draft state,
   and published head SHA. Distinguish pending CI from local validation. A failed
   command can still create a PR: on uncertainty, inspect remote state before any
   retry. Never duplicate a PR or repeat completed commits after interruption.
6. Report actual delivery and remaining local work. The verified PR URL is the
   final line, including when a PR exists but a later operation is blocked. If no
   PR exists, report the precise blocker; never invent a URL. Do not emit a PR offer.

**Done when:** the created/updated PR and published head are verified and its URL
is reported, or a precise blocker is recorded with local/remote state preserved.
No automatic merge, issue closure, branch cleanup, or external skill deletion.

## Dependencies

- `commit`: only when authorized PR preparation needs task-scoped local commits;
  pass `Confirmation policy: not-required` and suppress its completion offer.
- `opencode`: only for OpenCode-specific behavior needed by the task.
- `writing-for-agents`: only when the task itself changes agent instructions,
  commands, or skills; not for ordinary PR prose.
