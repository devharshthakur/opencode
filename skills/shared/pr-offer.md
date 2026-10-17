# Optional GitHub PR delivery

## Offer once at completion

Only the parent `dev` session, after a completed implementation, repair, or commit
task (including ordinary direct development), checks for a GitHub remote and
unpublished task changes/commits. A remote alone is not proof of GitHub hosting:
inspect fetch/push destinations without printing embedded credentials; verify
GitHub or a configured GitHub Enterprise host. Use read-only Git/`gh` inspection
when execution is authorized. Do not run shell during read-only `/ask`; `/plan*`
shell discovery follows its own boundary and never triggers PR-delivery inspection.

Follow configured upstream/push relationships, not an assumed `origin`. If several
targets remain ambiguous, resolve that before publishing. Missing authentication
or unverifiable hosting is a limitation to report, not permission to guess.

When eligible, make the final line a plain-text statement, never the `question` tool:

> To create a PR, reply `yes` for `main`, or `yes :<branch>` for another base; add `draft` for a draft PR. This authorizes task-scoped branch preparation, commits, push, labels, and PR creation.

For a matching existing open PR needing task updates, use:

> To update the existing PR, reply `yes`; add `:<branch>` to explicitly change its base, or `draft` to make it a draft. This authorizes task-scoped commits, push, labels, and PR updates.

Suppress offers for read-only answers, planning/awaiting approval, failed or
unfinished tasks, worker/Todo reports, no remaining task changes, explicit
no-PR/no-push/no-commit limits, or completed PR delivery. Workers return evidence
to the parent; an inner `commit` call inside `pr` never emits its own offer.

The suppression limits above mean explicit user delivery restrictions. Routine
local-only command defaults govern that command's execution, not whether to offer
separately authorized PR delivery. Never treat an offer as publication authority.

## Interpret the reply

Accept only a direct affirmative response to the latest unambiguous pending PR
offer: `yes`, `yes :<branch>`, `yes draft`, or `yes :<branch> draft`.
Standalone `/pr [:<base>] [draft]` supplies the same authority. Accept each optional
argument at most once; reject unknown/duplicate arguments and empty bases. A base
is a branch name, not shell syntax: validate it with Git and quote all values.
Bare branch names are not shorthand. `draft` is optional; new PRs otherwise open
ready for review. An existing PR retains its base/draft state unless explicitly
changed; `main` is the default for new PRs only.

Record task scope, checkout, authorization source/text, explicit base/draft options,
resolved repositories/head, and existing PR identity in conversation. Earlier plan
approval, quoted approval, or an unrelated `yes` does not authorize PR delivery.
This is a separate authorization transition; never rewrite a local-only worker
handoff to imply it approved publishing. User restrictions and permission denials
remain binding; clarify contradictory instructions before mutation.

On authorization, load `pr` using the skill tool and execute directly in `dev`
with the current model. Authorize its dependency manifest at its written triggers.
After interruption or uncertain push/create results, reconcile remote head and PR
identity before retrying. Never replay commits or create duplicate PRs.
