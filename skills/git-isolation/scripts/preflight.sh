#!/bin/sh
set -eu

if [ "$#" -ne 0 ]; then
  printf '%s\n' 'Usage: sh preflight.sh (set the checkout as the working directory)' >&2
  exit 2
fi

# Prevent optional index writes, lazy network fetches, and configured helper execution.
export GIT_OPTIONAL_LOCKS=0 GIT_NO_LAZY_FETCH=1 GIT_TERMINAL_PROMPT=0
export LC_ALL=C
git_read() {
  git --no-pager -c core.fsmonitor=false -c core.hooksPath=/dev/null "$@"
}

bounded() {
  awk '
    { if (NR > 80 || bytes + length($0) + 1 > 4096) { truncated = 1; next }
      print; bytes += length($0) + 1 }
    END { if (truncated) print "[truncated; inspect this section separately]" }
  '
}

report() {
  title=$1
  shift
  printf '\n## %s\n' "$title"
  if output=$(git_read "$@" 2>&1); then
    if [ -n "$output" ]; then printf '%s\n' "$output" | bounded
    else printf '%s\n' '(none)'; fi
  else
    code=$?
    printf '%s\n' "$output" | bounded >&2
    printf 'Git inspection failed: %s (exit %s)\n' "$title" "$code" >&2
    exit "$code"
  fi
}

if inside=$(git_read rev-parse --is-inside-work-tree 2>&1); then
  if [ "$inside" != true ]; then
    printf '%s\n' 'Preflight requires a Git working tree, not a bare repository.' >&2
    exit 1
  fi
else
  code=$?
  printf '%s\n' "$inside" | bounded >&2
  exit "$code"
fi

report Repository rev-parse --show-toplevel
printf '\n## Branch\n'
if branch=$(git_read symbolic-ref --quiet --short HEAD 2>&1); then
  printf '%s\n' "$branch" | bounded
else
  code=$?
  if [ "$code" -eq 1 ]; then printf '%s\n' '(detached)'
  else printf '%s\n' "$branch" | bounded >&2; exit "$code"; fi
fi
printf '\n## HEAD\n'
if head=$(git_read rev-parse --verify --quiet HEAD 2>&1); then
  printf '%s\n' "$head" | bounded
else
  code=$?
  if [ "$code" -eq 1 ]; then printf '%s\n' '(unborn; no commit yet)'
  else printf '%s\n' "$head" | bounded >&2; exit "$code"; fi
fi
report 'Status (staged / unstaged / untracked)' status --porcelain=v1 --untracked-files=all
report 'Unstaged statistics' diff --no-ext-diff --no-textconv --stat
report 'Staged statistics' diff --cached --no-ext-diff --no-textconv --stat
report Worktrees worktree list --porcelain
