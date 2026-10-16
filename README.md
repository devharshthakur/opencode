# Lean OpenCode workflow

Personal [OpenCode V2](https://opencode.ai/v2/docs/) setup: two primary agents,
two subagent-only workers, current-model commands, and deliberate approval boundaries.

## Agents and models

| Agent | Where | Model policy |
| --- | --- | --- |
| `dev` | Primary; default | DeepSeek V4.1 Flash low by default; ordinary questions or direct edits |
| `chat` | Primary | DeepSeek V4.1 Flash high preference; external conversation/research, no project tools |
| `explore` | Subagent only | Muse Spark 1.3 Contributor medium; bounded cited discovery |
| `implement` | Subagent only | DeepSeek V4.1 Flash high; approved-plan execution |

Shift+Tab should cycle only `dev` and `chat`. Workers use `mode: subagent` with
`hidden: false`: the model can discover/delegate to them without adding primary modes.
Unused built-in `build`, `plan`, and `general` profiles are disabled.

### Model selection

The root default selects DeepSeek Flash; its model-level `reasoningEffort: low`
also covers fresh sessions where the root default does not retain a variant.
Agent pins live in configuration, not duplicated in agent files or commands.

Commands omit both `agent` and `model` and force current-session execution. Use
development commands in `dev`. They must preserve a manually selected session
model. Selecting an agent and selecting a session model are separate in V2:
switching to `chat` alone does not guarantee a model switch. Use `/models` to
select a different model when wanted. Existing sessions keep their selected model.

### Privacy and permission boundaries

**Muse Contributor permits prompts/completions to be used for training and is
not zero-data-retention.** Exploration may send repository source to that provider;
availability is regional. No silent fallback to another model. Choose a different
explorer model explicitly before sending code whose data policy is incompatible.

**`dev` is allow-all, including shell, sensitive reads, and external directories.**
This is the user's explicit choice, not a hardened sandbox. `/ask` and planning
limits are instruction-based: commands do not revoke tools. Untrusted repository
text cannot authorize work, but these prompts are not a security boundary.

CLI permissions remain `prompt` so other profiles retain their safeguards.
`explore` denies shell, edits, Code Mode, delegation, and known secret-bearing
reads; it is not a complete secret scanner (searches/briefs can still expose data).
`implement` cannot recursively delegate. `chat` denies project tools, permitting
web research and Context7 documentation through Code Mode. Managed policies and
permission denials remain binding even for `dev`.

## Commands

| Command | Behavior |
| --- | --- |
| `/ask <question>` | Read-only project answer; no shell, edits, or unsolicited implementation plan |
| `/plan <task>` | Detailed plan; approval dispatches `implement` on the current branch |
| `/plan:branch <task>` | Same, with explicitly approved local branch isolation |
| `/plan:worktree <task>` | Same, with explicitly approved local worktree isolation |
| `/fix <issue>` | Temp-branch root-cause diagnosis + Todo repair plan; approval implements on the current branch |
| `/fix:branch <issue>` | Same, with explicitly approved local `fix/<slug>` branch isolation |
| `/fix:worktree <issue>` | Same, with explicitly approved local `fix/<slug>` worktree isolation |
| `/quick <task>` | Direct execution using the current model; bypass planning regardless of complexity |
| `/build [plan/phases]` | Execute an already approved plan directly; no worker or isolation preparation |
| `/commit [scope]` | Approve exact files/messages before local staging and commits |
| `/commit:auto [scope]` | Explicitly authorize scoped local commits without routine confirmation |
| `/pr [:<base>] [draft]` | Task-scoped commits/push and create or update a GitHub PR; new PR base defaults to `main` |

The old delivery and `:pr` families remain retired. `/fix`, `/fix:branch`, and
`/fix:worktree` diagnose on a temporary `fix/diag-<slug>` branch (carrying and
restoring uncommitted changes deterministically via Git), delete the temporary
branch before asking for approval, break the repair into a Markdown Todo checklist,
and dispatch `implement` (`single-worker` for small cohesive fixes or sequential
`per-todo-worker` with parent validation between Todos for large fixes). No command
here publishes, amends, merges, deploys, closes issues, or performs destructive
cleanup automatically.

### Optional GitHub PR delivery

After a completed code/repair/commit task with unpublished work and a verified
GitHub remote, the parent offers PR delivery in plain text (not the question tool).
Reply `yes`, `yes :develop`, `yes draft`, or `yes :develop draft`; standalone `/pr`
accepts the same optional `:<base>` and `draft` arguments. Bare branch names and
unknown/duplicate arguments are rejected. New PRs explicitly default to `main`;
existing open PRs retain their base/draft state unless explicitly changed.

That separate reply or `/pr` invocation authorizes a safe task branch when needed,
attributable commits, normal push, missing type-label creation, and PR creation or
update. Ordinary implementation/plan approval never approves publishing. Unclear
scope, unrelated outgoing commits, secrets, ambiguous fork/remotes, missing base,
or non-fast-forward push stop delivery. No force-push or automatic merge/cleanup.

The local explicit-only `pr` skill owns delivery, using `commit` only when needed.
It follows configured push/upstream relationships rather than assuming `origin`,
reuses matching open PRs, preserves human-written descriptions and existing labels,
and ends with a verified PR URL. Only the parent offers, never workers, inner
commits, read-only answers, unfinished tasks, or an already completed PR workflow.
Explicit no-PR/no-push/no-commit limits suppress the offer.

Titles use Conventional Commits with a matching type label (`feat`, `fix`, `perf`,
`refactor`, `style`, `chore`, `docs`, `test`, `build`, `ci`, or `revert`). Existing
label metadata is never overwritten. Adaptable GFM templates prioritize human
readability; fix PRs start from Issue / Root Cause or Cause / The Fix / Review or
Validation Checklist. No Mermaid unless requested and no Merge Danger section.
Template references live in `skills/pr/references/templates.md` independently of
the external `~/.agents/skills/pr`, which this setup does not delete. Native global
skills take precedence over compatibility skills with the same ID; verify local
skill loading in a fresh session before deleting the external reference yourself.

Ordinary `dev` requests may edit directly. `/quick` is a deliberate planning bypass,
not a permission to expand the task, discard work, or publish. Genuine blockers,
missing requirements, destructive-operation confirmations, and user limits still apply.
Commit scope is explicit or attributable to the current task, never all changes by default.

### Planning and handoff

Planning uses native discovery/documentation and optionally the read-only explorer;
no shell, reproductions, edits, or implementation worker before approval. Plans have
a stable title/revision, current/desired behavior, exclusions, inspected paths and
interfaces, ordered phases/dependencies, observable acceptance, exact validation,
isolation/base intent, preservation decisions, risks, and rollback where relevant.

The approval question names current/branch/worktree execution and excludes commits
and publishing. Direct approval dispatches one foreground `implement` worker with
the exact plan, limits, and relevant evidence—not the transcript. The parent
retains its selected model. Revisions need renewed approval; partial approval limits
phases. Repeated approval never launches duplicates. Missing execution identity
after interruption blocks replay until reconciled. This is instruction-driven,
not an exactly-once runtime state machine.

`/build` remains the explicitly selected direct alternative, not approval itself.
Do not execute it while a worker owns the task. A user can explicitly approve
direct execution instead of dispatch. Plan loading alone authorizes nothing.

Branch/worktree plans default to verified local `HEAD`, even with remotes; no
implicit fetch. Dirty branch switching blocks. Worktrees preserve the original
checkout and never copy dirty files or credentials automatically. Resolve tasks
depending on uncommitted original work before approval. Retain/report task isolation;
no automatic verification isolation or cleanup. Isolation is not delivery approval.

## Skills and context

Six local entry skills own orchestration: `plan`, `fix`, `build`, `commit`, `git-isolation`, `pr`.
They are explicit-only. Commands authorize dependencies only at written triggers;
`/ask` and `/quick` need no unconditional workflow-skill load.

The `local.skill-policy` plugin filters discovery at prompt admission, after
filesystem skill sources are ready. It intends to advertise only these external methods:
`codebase-design`, `diagnosing-bugs`, `domain-modeling`, `tdd`, and `writing-for-agents`.
Built-in OpenCode guidance remains available. Upstream explicit-only settings stay
explicit-only. Other installed external skills remain registered/manual, including
useful optional review, research, prototype, grilling, handoff, and wizard methods.
Publisher files are untouched; same-named project/native skills are not filtered.
Edit the curated list in `extensions/skill-policy/core.mjs` deliberately.
Before a location's first admitted prompt, a raw skill-registry listing may still
show the unfiltered source definitions. Verify filtering after an actual prompt;
plugin-active status and passing pure-helper tests alone do not prove it works.

Skills supply methods, not authority. Their tracker, branch, commit, or delegation
assumptions cannot expand the invoking task. Routine disagreement does not trigger
grilling. Challenge material mistakes with evidence and alternatives; respect an
informed user choice instead of agreeing automatically or debating indefinitely.

Use one task per session where practical. Read known small files directly; delegate
only bounded discovery that avoids substantial parent-context noise. Require
path:line evidence and honest search limits. Native glob/grep/read are enough;
`tree` is optional orientation, not the exclusive exploration tool. `ast-grep` may
help structural searches later; neither is installed or required by this setup.

Direct `/quick` and `/build` retain history. Plan files/checkpoints are written
only when requested. Manual compaction (`auto: false`) keeps a recent 30k-token tail;
it is lossy and cannot shrink fixed instructions/tool schemas. No fixed universal
"smart context" threshold or claimed percentage savings. Compare parent + worker
usage, retries, latency, and acceptance quality before claiming savings.

For genuinely project-independent chat, start a fresh session outside a repository.
Changing agents does not erase existing history or ambient project instructions.

## Configuration and authentication

Copy `opencode.sample.jsonc` to the ignored local `opencode.jsonc` and connect your
accounts. The tracked sample uses environment references. This user's local file
retains existing inline secrets by explicit choice; never print or commit them.
Gitignore prevents ordinary tracking, not exposure through tools, backups, or sharing.
`service.json` is also ignored and remains untouched.

**Only Context7 is enabled by default.** All other MCP definitions remain configured
but disabled. Opt into others deliberately; avoid duplicating native filesystem
tools with extra MCP schemas. CLI preferences belong in `cli.json`.

Repository scripts/package managers take precedence. Otherwise prefer `pnpm` for
JS/TS and `uv` for Python environment/package work. Stack-specific methods stay
task-local rather than always-loaded global framework instructions.

## Checks and rollout

```sh
ruby tests/workflow_test.rb
python3 tests/preflight_test.py
python3 tests/diag_branch_test.py
node --test tests/skill_policy_test.mjs
node --test tests/workflow_pilot_test.mjs
git diff --check
```

Offline checks cover contracts, simulated permission ordering, references, pure
skill-filter behavior, and unchanged-checkout preflight. They do not prove live
model obedience, plugin effectiveness, model-request effort, or UI behavior.

Commands/configuration/CLI preferences normally reload automatically. Use a fresh
session for role/permission/skill validation; loaded instructions/history may remain.
Plugin helper changes outside watched directories can require an explicit reload
or service restart; this setup does not restart the shared service automatically.

Fresh-session acceptance checklist (record actual results, not assumptions):

- Shift+Tab shows two primaries; both workers remain discoverable subagents.
- Fresh development defaults to DeepSeek low; manually selected planning/direct models persist.
- `/ask` makes no changes; `/quick` does not impose planning; `/build` requires approval.
- Explorer uses Muse medium, returns useful citations, and cannot shell/edit/delegate.
- Approved automatic handoff uses DeepSeek high; rejection/revision/partial/repeated approval behave correctly.
- Curated skill advertisement, manual loading, and non-dev permission prompts work.
- Only Context7 connects by default; inline local credentials remain private.
- Live branch/worktree scenarios need separately authorized disposable tests; do not publish to test setup.

Restore only affected files from a protected local backup if rollback is needed;
preserve subsequent user work and session/service data. Never reset Git to simplify rollback.

`extensions/workflow-pilot/` remains an **inactive** historical offline experiment.
It is not imported by the active plugin or wired into commands. Its tests are retained.
