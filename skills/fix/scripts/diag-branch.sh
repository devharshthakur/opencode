#!/bin/sh
set -eu

usage() {
  printf '%s\n' 'Usage: sh diag-branch.sh <enter|leave> <slug>' >&2
  exit 2
}

[ "$#" -eq 2 ] || usage
action=$1
slug=$2

case "$slug" in
  ''|*[!A-Za-z0-9._-]*)
    printf 'Invalid diagnostic branch slug: %s\n' "$slug" >&2
    exit 2
    ;;
esac

branch="fix/diag-$slug"

# Prevent optional index writes, lazy network fetches, hooks, and GPG prompts.
export GIT_OPTIONAL_LOCKS=0 GIT_NO_LAZY_FETCH=1 GIT_TERMINAL_PROMPT=0 LC_ALL=C
git_cmd() {
  git --no-pager \
    -c core.fsmonitor=false \
    -c core.hooksPath=/dev/null \
    -c commit.gpgSign=false \
    -c user.name=opencode-diag \
    -c user.email=diag@opencode.local \
    "$@"
}

inside=$(git_cmd rev-parse --is-inside-work-tree 2>/dev/null || true)
if [ "$inside" != true ]; then
  printf '%s\n' 'diag-branch.sh requires a Git working tree.' >&2
  exit 1
fi

case "$action" in
  enter)
    parent_sha=$(git_cmd rev-parse --verify --quiet HEAD) || {
      printf '%s\n' 'Cannot enter diagnostic branch from an unborn HEAD.' >&2
      exit 1
    }
    parent_branch=$(git_cmd symbolic-ref --quiet --short HEAD) || {
      printf '%s\n' 'Cannot enter diagnostic branch from a detached HEAD.' >&2
      exit 1
    }
    case "$parent_branch" in
      fix/diag-*)
        printf 'Already on a diagnostic branch: %s\n' "$parent_branch" >&2
        exit 1
        ;;
    esac
    if git_cmd show-ref --verify --quiet "refs/heads/$branch"; then
      printf 'Diagnostic branch already exists: %s\n' "$branch" >&2
      exit 1
    fi
    git_cmd switch -q -c "$branch"
    git_cmd commit -q --no-verify --allow-empty -m "diag-snapshot: staged"
    git_cmd add -u
    git_cmd commit -q --no-verify --allow-empty -m "diag-snapshot: unstaged"
    git_cmd add -A
    git_cmd commit -q --no-verify --allow-empty -m "diag-snapshot: untracked"
    snapshot_sha=$(git_cmd rev-parse HEAD)
    git_cmd config "branch.$branch.diagParentBranch" "$parent_branch"
    git_cmd config "branch.$branch.diagParentSha" "$parent_sha"
    git_cmd config "branch.$branch.diagSnapshotSha" "$snapshot_sha"
    printf 'entered %s from %s (%s)\n' "$branch" "$parent_branch" "$parent_sha"
    ;;
  leave)
    current_branch=$(git_cmd symbolic-ref --quiet --short HEAD || true)
    if [ "$current_branch" != "$branch" ]; then
      printf 'Expected current branch %s, found %s\n' "$branch" "${current_branch:-(detached)}" >&2
      exit 1
    fi
    parent_branch=$(git_cmd config --get "branch.$branch.diagParentBranch" || true)
    parent_sha=$(git_cmd config --get "branch.$branch.diagParentSha" || true)
    snapshot_sha=$(git_cmd config --get "branch.$branch.diagSnapshotSha" || true)
    if [ -z "$parent_branch" ] || [ -z "$parent_sha" ] || [ -z "$snapshot_sha" ]; then
      printf 'Missing diagnostic snapshot metadata on %s\n' "$branch" >&2
      exit 1
    fi
    base_check=$(git_cmd rev-parse --verify --quiet "$snapshot_sha~3" || true)
    if [ "$base_check" != "$parent_sha" ]; then
      printf 'Snapshot ancestry mismatch on %s\n' "$branch" >&2
      exit 1
    fi
    git_cmd reset -q --hard "$snapshot_sha"
    git_cmd clean -fdq
    git_cmd reset -q HEAD~1
    git_cmd reset -q HEAD~1
    git_cmd reset -q --soft HEAD~1
    git_cmd switch -q "$parent_branch"
    git_cmd branch -q -d "$branch"
    printf 'restored %s (%s) and deleted %s\n' "$parent_branch" "$parent_sha" "$branch"
    ;;
  *)
    usage
    ;;
esac
