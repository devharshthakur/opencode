#!/bin/sh
# Resolve and check a /pr target without changing anything.
# Usage: sh pr-target.sh [:<base>] [@<remote>] [draft]   (checkout as workdir)
# Output: "key: value" lines, "BLOCKER: ..." lines, then "result: ready|blocked".
# Exit: 0 ready, 3 blocked, 2 usage error. Network: read-only ls-remote and gh queries.
# No fetch, index write, branch creation, push, or PR mutation.
set -u
set -f

export GIT_OPTIONAL_LOCKS=0 GIT_NO_LAZY_FETCH=1 GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -o BatchMode=yes}"
export GH_PROMPT_DISABLED=1 GH_NO_UPDATE_NOTIFIER=1 LC_ALL=C

git_read() {
  git --no-pager -c core.fsmonitor=false -c core.hooksPath=/dev/null "$@"
}

blockers=0
out() { printf '%s: %s\n' "$1" "$2"; }
block() { printf 'BLOCKER: %s\n' "$1"; blockers=$((blockers + 1)); }
finish() {
  if [ "$blockers" -gt 0 ]; then out result blocked; exit 3; fi
  out result ready
  exit 0
}
usage() {
  printf 'Usage error: %s\n' "$1" >&2
  printf '%s\n' 'Syntax: /pr [:<base>] [@<remote>] [draft], any order, each at most once.' >&2
  exit 2
}
safe_name() {
  case $1 in
    ''|-*|*[!A-Za-z0-9._/-]*) return 1 ;;
  esac
  return 0
}

# --- Arguments -------------------------------------------------------------
base=''; base_given=0; remote_arg=''; remote_given=0; draft=0
for token in "$@"; do
  case $token in
    :*)
      [ "$base_given" -eq 0 ] || usage "duplicate :<base>"
      base=${token#:}; base_given=1
      [ -n "$base" ] || usage "empty :<base>"
      safe_name "$base" && git check-ref-format --branch "$base" >/dev/null 2>&1 \
        || usage "invalid base branch name"
      ;;
    @*)
      [ "$remote_given" -eq 0 ] || usage "duplicate @<remote>"
      remote_arg=${token#@}; remote_given=1
      [ -n "$remote_arg" ] || usage "empty @<remote>"
      safe_name "$remote_arg" || usage "invalid remote name"
      ;;
    draft)
      [ "$draft" -eq 0 ] || usage "duplicate draft"
      draft=1
      ;;
    *) usage "unknown token" ;;
  esac
done
[ "$base_given" -eq 1 ] || base=main
out base_branch "$base$( [ "$base_given" -eq 1 ] && printf ' (explicit)' || printf ' (default)')"
out draft "$( [ "$draft" -eq 1 ] && printf 'requested (new PRs only)' || printf 'no')"

# --- Checkout --------------------------------------------------------------
if ! root=$(git_read rev-parse --show-toplevel 2>/dev/null); then
  block "not inside a Git working tree"; finish
fi
cd "$root" || exit 1
out repository "$root"

if ! branch=$(git_read symbolic-ref --quiet --short HEAD 2>/dev/null); then
  block "detached HEAD; check out a branch first"; finish
fi
if ! head_sha=$(git_read rev-parse --verify --quiet HEAD 2>/dev/null); then
  block "unborn branch '$branch'; create a commit first"; finish
fi
out current_branch "$branch"
out head_sha "$head_sha"
dirty=$(git_read status --porcelain=v1 --untracked-files=all 2>/dev/null | wc -l | tr -d ' ')
staged=$(git_read diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
out uncommitted_paths "$dirty (staged: $staged)"

# --- Remotes ---------------------------------------------------------------
remotes=$(git_read remote 2>/dev/null)
remote_count=$(printf '%s\n' "$remotes" | grep -c . || true)
[ "$remote_count" -gt 0 ] || { block "no Git remotes configured"; finish; }

head_remote=''; head_remote_source=''
for key in "branch.$branch.pushRemote" remote.pushDefault "branch.$branch.remote"; do
  value=$(git_read config --get "$key" 2>/dev/null || true)
  if [ -n "$value" ] && [ "$value" != . ]; then
    head_remote=$value; head_remote_source=$key; break
  fi
done
if [ -z "$head_remote" ] && [ "$branch" != "$base" ]; then
  # A new head branch without push configuration inherits the local base branch's.
  for key in "branch.$base.pushRemote" "branch.$base.remote"; do
    value=$(git_read config --get "$key" 2>/dev/null || true)
    if [ -n "$value" ] && [ "$value" != . ]; then
      head_remote=$value; head_remote_source="$key (inherited from local base branch)"; break
    fi
  done
fi
if [ -z "$head_remote" ]; then
  if [ "$remote_count" -eq 1 ]; then
    head_remote=$remotes; head_remote_source='only configured remote'
  else
    block "push remote for '$branch' is ambiguous (no pushRemote, pushDefault, or upstream); set one, e.g. git config remote.pushDefault <remote>"
    finish
  fi
fi
safe_name "$head_remote" || { block "push remote name '$head_remote' is unsupported"; finish; }
out head_remote "$head_remote ($head_remote_source)"

if [ "$remote_given" -eq 1 ]; then
  printf '%s\n' "$remotes" | grep -qxF -- "$remote_arg" \
    || { block "remote '$remote_arg' is not configured; configured: $(printf '%s' "$remotes" | tr '\n' ' ')"; finish; }
  base_remote=$remote_arg
else
  base_remote=$head_remote
fi
out base_remote "$base_remote$( [ "$remote_given" -eq 1 ] && printf ' (explicit)' || printf ' (head push remote)')"

# Parse a remote URL into "host owner repo" without echoing credentials.
parse_url() {
  case $1 in
    *://*) # scheme://[user[:secret]@]host[:port]/owner/repo
      printf '%s\n' "$1" | sed -E -e 's#^[a-zA-Z][a-zA-Z0-9+.-]*://##' \
        -e 's#^[^@/]*@##' -e 's#^([^/:]+):[0-9]*/#\1/#' ;;
    /*|.*) return 1 ;; # local path, not a hosted repository
    *) # scp-like [user@]host:owner/repo
      printf '%s\n' "$1" | sed -E -e 's#^[^@/:]*@##' -e 's#^([^/:]+):#\1/#' ;;
  esac | sed -E -e 's#\.git/?$##' -e 's#/$##' \
    | awk -F/ 'NF >= 3 && $1 != "" { print $1, $(NF-1), $NF }'
}

resolve_repo() { # $1 remote, $2 get-url flag ("" or --push)
  url=$(git_read remote get-url $2 "$1" 2>/dev/null) || return 1
  parse_url "$url"
}

hosted=1
if ! head_parts=$(resolve_repo "$head_remote" --push) || [ -z "$head_parts" ]; then
  block "push URL of remote '$head_remote' is not a hosted repository URL"; hosted=0
fi
if ! base_parts=$(resolve_repo "$base_remote" '') || [ -z "$base_parts" ]; then
  block "URL of remote '$base_remote' is not a hosted repository URL"; hosted=0
fi
if [ "$hosted" -eq 1 ]; then
  set -- $head_parts; head_host=$1; head_owner=$2; head_name=$3
  set -- $base_parts; base_host=$1; base_owner=$2; base_name=$3
  for part in "$head_host" "$head_owner" "$head_name" "$base_host" "$base_owner" "$base_name"; do
    safe_name "$part" || { block "remote URL contains unsupported characters"; hosted=0; break; }
  done
fi
gh_ok=0
if [ "$hosted" -eq 1 ]; then
  out head_repository "$head_host/$head_owner/$head_name"
  out base_repository "$base_host/$base_owner/$base_name"
  [ "$head_host" = "$base_host" ] || block "head host '$head_host' differs from base host '$base_host'"
  if [ "$head_owner/$head_name" = "$base_owner/$base_name" ]; then
    out cross_repository no
    out gh_head_arg "<branch>"
  else
    out cross_repository yes
    out gh_head_arg "$head_owner:<branch>"
  fi

  # GitHub CLI and hosting
  if ! command -v gh >/dev/null 2>&1; then
    block "GitHub CLI 'gh' is not installed"
  elif gh auth status --hostname "$base_host" >/dev/null 2>&1; then
    gh_ok=1
    out gh_auth "authenticated for $base_host"
  elif [ "$base_host" = github.com ]; then
    block "gh is not authenticated for github.com; run: gh auth login"
  else
    block "host '$base_host' is not github.com and gh has no login for it (GitHub Enterprise needs gh auth login --hostname $base_host)"
  fi

  if [ "$gh_ok" -eq 1 ]; then
    push_perm=$(gh api --hostname "$head_host" "repos/$head_owner/$head_name" --jq '.permissions.push' 2>/dev/null || true)
    case $push_perm in
      true) out head_push_permission yes ;;
      false) block "no push permission to $head_owner/$head_name; forks are never created automatically" ;;
      *) block "cannot read repository $head_host/$head_owner/$head_name with gh" ;;
    esac
  fi
fi

# --- Base branch -------------------------------------------------------------
remote_base_sha=$(git_read ls-remote --heads "$base_remote" "refs/heads/$base" 2>/dev/null | awk 'NR == 1 { print $1 }')
if [ -z "$remote_base_sha" ]; then
  if ! git_read ls-remote --heads "$base_remote" >/dev/null 2>&1; then
    block "cannot reach remote '$base_remote' (git ls-remote failed)"
  elif [ "$base_given" -eq 1 ]; then
    block "branch '$base' does not exist on remote '$base_remote'"
  else
    default=$(git_read ls-remote --symref "$base_remote" HEAD 2>/dev/null \
      | awk '$1 == "ref:" { sub("refs/heads/", "", $2); print $2; exit }')
    block "remote '$base_remote' has no 'main' branch; default branch is '${default:-unknown}'. Re-run /pr :${default:-<branch>}"
  fi
  finish
fi
base_ref="refs/remotes/$base_remote/$base"
out base_ref "$base_remote/$base"
local_base_sha=$(git_read rev-parse --verify --quiet "$base_ref" 2>/dev/null || true)
if [ -z "$local_base_sha" ]; then
  out base_ref_state "missing locally; run: git fetch $base_remote $base, then re-run this script"
  block "local ref $base_remote/$base is missing; fetch it before ancestry checks"
  finish
elif [ "$local_base_sha" != "$remote_base_sha" ]; then
  out base_ref_state "stale (local $(printf '%.7s' "$local_base_sha"), remote $(printf '%.7s' "$remote_base_sha")); run: git fetch $base_remote $base, then re-run"
  block "local ref $base_remote/$base is stale; fetch it before ancestry checks"
  finish
fi
out base_ref_state current

# --- Head branch action -------------------------------------------------------
if ! git_read merge-base HEAD "$base_ref" >/dev/null 2>&1; then
  block "'$branch' shares no history with $base_remote/$base"
  finish
fi

upstream=$(git_read rev-parse --symbolic-full-name '@{upstream}' 2>/dev/null || true)
# Refs merged into HEAD but not into the base ref, as "distance branch-name",
# excluding the current branch, the local base branch (may be ahead), the
# current branch's upstream/push tracking refs, and */HEAD.
candidates=$(git_read for-each-ref --merged HEAD --no-merged "$base_ref" \
  --format='%(refname)' refs/heads refs/remotes 2>/dev/null \
  | while IFS= read -r ref; do
      case $ref in
        ("refs/heads/$branch"|"refs/heads/$base"|"refs/remotes/$head_remote/$branch"|"$upstream"|refs/remotes/*/HEAD) continue ;;
        (refs/heads/*) name=${ref#refs/heads/} ;;
        (refs/remotes/*) rest=${ref#refs/remotes/}; name=${rest#*/} ;;
        (*) continue ;;
      esac
      printf '%s %s\n' "$(git_read rev-list --count "$ref..HEAD" 2>/dev/null || echo 999999)" "$name"
    done | sort -k2,2 -k1,1n | awk '!seen[$2]++' | sort -n | head -10)

if [ "$branch" = "$base" ]; then
  action="create-branch: new unused feat/<slug> or fix/<slug> from current HEAD; uncommitted work and local commits move with it; local '$base' stays as is"
elif [ "$branch" = main ] && [ "$base_given" -eq 1 ]; then
  block "on 'main' with explicit base '$base': a branch from here would not descend from '$base'. Check out or create a branch off '$base' first"
  action=blocked
else
  action="reuse: '$branch'"
fi
if [ -n "$candidates" ]; then
  nearest=$(printf '%s\n' "$candidates" | awk 'NR == 1 { print $2 }')
  names=$(printf '%s\n' "$candidates" | awk '{ printf "%s%s", sep, $2; sep = ", " }')
  block "'$branch' descends from branches not merged into $base_remote/$base ($names); nearest candidate parent '$nearest'. Re-run /pr :$nearest if that is the intended base"
  action=blocked
fi
out head_action "$action"

# --- Outgoing history ----------------------------------------------------------
id_email=$(git_read config --get user.email 2>/dev/null || true)
id_name=$(git_read config --get user.name 2>/dev/null || true)
[ -n "$id_email" ] || block "git user.email is not configured"
out git_identity "${id_name:-<unset>} <${id_email:-unset}>"
count=$(git_read rev-list --count "$base_ref..HEAD" 2>/dev/null || printf '?')
out outgoing_commits "$count"
offenders=$(git_read log --format='%h%x09%P%x09%ae%x09%an%x09%s' "$base_ref..HEAD" 2>/dev/null \
  | awk -F'\t' -v email="$id_email" -v name="$id_name" '
      { reason = ""
        if (split($2, p, " ") > 1) reason = "merge commit"
        else if ($3 != email || $4 != name) reason = "author " $4 " <" $3 ">"
        if (reason != "") { n++; if (n <= 20) print $1 " " reason ": " substr($5, 1, 60) } }
      END { if (n > 20) print "... " n - 20 " more" }')
if [ -n "$offenders" ]; then
  block "outgoing history has merge commits or other authors (no override):"
  printf '%s\n' "$offenders" | sed 's/^/  - /'
fi
if [ "$count" = 0 ] && [ "$dirty" -eq 0 ]; then
  block "nothing to deliver: no outgoing commits and no uncommitted changes"
fi

# --- Existing pull request --------------------------------------------------------
if [ "$gh_ok" -eq 1 ] && [ "$branch" != "$base" ]; then
  prs=$(gh pr list --repo "$base_host/$base_owner/$base_name" --head "$branch" --state open \
    --json number,url,isDraft,baseRefName,headRepositoryOwner \
    --jq ".[] | select(.headRepositoryOwner.login == \"$head_owner\") | \"#\(.number) \(.url) base=\(.baseRefName) draft=\(.isDraft)\"" 2>/dev/null)
  if [ $? -ne 0 ]; then
    block "gh pr list failed for $base_host/$base_owner/$base_name"
  elif [ -z "$prs" ]; then
    out existing_pr none
  else
    n=$(printf '%s\n' "$prs" | grep -c .)
    out existing_pr "$(printf '%s' "$prs" | tr '\n' ';')"
    [ "$n" -le 1 ] || block "multiple open PRs match head '$head_owner:$branch'; ask which to update"
  fi
elif [ "$branch" = "$base" ]; then
  out existing_pr "n/a (a new head branch will be created)"
fi

finish
