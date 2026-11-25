# PR target resolution

Syntax: `/pr [:<base>] [@<remote>] [draft]`. Resolve in this order; every blocker
stops before any commit, branch creation, or push, and names the exact fix.

These rules are the specification that `../scripts/pr-target.sh` implements. Agents
run the script instead of applying them by hand; keep the two in sync when either
changes.

## Base repository and branch

| Input | Rule |
| :--- | :--- |
| `@<remote>` given | Base repository is that remote's GitHub repository. The remote must exist and resolve to verified GitHub hosting. |
| No `@<remote>` | Base repository is the repository of the head's push remote. Never auto-target a fork's parent; cross-repo PRs need an explicit `@<remote>`. |
| `:<base>` given | Base branch is that branch. It must exist on the base repository. |
| No `:<base>` | Base branch is `main`. If the base repository has no `main`, block and name its actual default branch so the user can re-run with `:<branch>`. Never fall back silently. |

The base ref used for ancestry and outgoing review is `<base-remote>/<base>`,
fetched if stale, not the local branch of the same name.

## Head branch

The head repository is the repository of the branch's push remote:
`branch.<name>.pushRemote`, then `remote.pushDefault`, then the upstream remote.
A head branch with none of these (for example one just created from the base
branch) inherits the local base branch's `pushRemote` or upstream remote. A
repository with exactly one remote uses it. Block on remaining ambiguity. Without push rights to the head repository, report a blocker;
never create a fork.

| Current state | Action |
| :--- | :--- |
| On the base branch (for example `main`) | Create an unused `feat/<slug>` or `fix/<slug>` branch from current local HEAD. Uncommitted work and local-only commits move with it. Local base branch stays as is, even if ahead. |
| On the base branch, explicit non-`main` `:<base>` | Block: a branch from here would not descend from the base. Tell the user to check out or create a branch off `<base>` first. |
| On another branch that branched from the base ref | Reuse it. |
| On another branch that did not branch from the base ref | Block and name the nearest candidate parent branch (for example `dev`), so the user re-runs with `:dev`. Never guess. |
| Detached or unborn HEAD | Block. |

A branch "branched from the base ref" when `git merge-base HEAD <base-ref>` exists
and no other ref is merged into HEAD but not into the base ref. List candidates with
`git for-each-ref --merged HEAD --no-merged <base-ref>`, excluding the current
branch, its own remote-tracking ref, and the local base branch (which may be ahead
of `<base-ref>`). The nearest candidate is the one with the fewest commits to HEAD. Any remaining candidate means the branch
descends from something other than the base: block and name it.

## Cross-repository heads

When the head repository differs from the base repository (fork to upstream), push
the head to the fork's remote and open the PR with `--head <fork-owner>:<branch>`
against the base repository. When they are the same repository, use the bare
branch name.

## Outgoing history

Every commit in `<base-ref>..HEAD` must be by the configured Git identity
(`user.name`/`user.email`) and must not be a merge commit. Otherwise block and
list the offending commits. No override exists.

## Blocker wording

State the blocker, the observed value, and the exact `/pr` form that would proceed.
Example: "Branch `my-fix` descends from `dev`, not `main`. Re-run `/pr :dev`."
