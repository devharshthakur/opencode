#!/bin/sh
# Print read-only commit-message evidence: recent subjects and convention files.
set -u

if [ "$#" -ne 0 ]; then
  printf '%s\n' 'Usage: sh conventions.sh (set the checkout as the working directory)' >&2
  exit 2
fi

export GIT_OPTIONAL_LOCKS=0 GIT_NO_LAZY_FETCH=1 GIT_TERMINAL_PROMPT=0
export LC_ALL=C
git_read() {
  git --no-pager -c core.fsmonitor=false -c core.hooksPath=/dev/null "$@"
}

if ! root=$(git_read rev-parse --show-toplevel 2>&1); then
  printf '%s\n' "$root" >&2
  exit 1
fi
cd "$root" || exit 1

printf '\n## Recent commit subjects (newest first, max 15)\n'
if git_read rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
  git_read log --no-merges --format='%s' -15 2>&1 | cut -c1-120
else
  printf '%s\n' '(unborn; no commits yet)'
fi

printf '\n## Commit convention files (tracked or present)\n'
found=0
for name in commitlint.config.js commitlint.config.cjs commitlint.config.mjs \
  commitlint.config.ts commitlint.config.cts .commitlintrc .commitlintrc.json \
  .commitlintrc.yaml .commitlintrc.yml .commitlintrc.js .commitlintrc.cjs \
  .gitmessage .czrc .cz.toml .cz.json cz.json .versionrc .versionrc.json \
  CONTRIBUTING.md .github/CONTRIBUTING.md docs/CONTRIBUTING.md; do
  if [ -f "$name" ] && [ ! -L "$name" ]; then
    printf '%s\n' "$name"
    found=1
  fi
done
template=$(git_read config --get commit.template 2>/dev/null || true)
if [ -n "$template" ]; then
  printf 'commit.template = %s\n' "$template"
  found=1
fi
if [ -f package.json ] && grep -Eq '"(commitlint|commitizen)"' package.json 2>/dev/null; then
  printf '%s\n' 'package.json (commitlint/commitizen config)'
  found=1
fi
[ "$found" -eq 1 ] || printf '%s\n' '(none)'
exit 0
