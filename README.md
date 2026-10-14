# OpenCode Config

Personal [OpenCode V2](https://opencode.ai/v2/docs/) setup: small agents, command-owned authority,
explicit skill loading, and approval-triggered implementation.

## Getting started

1. Put this repository in `~/.config/opencode`, or `$XDG_CONFIG_HOME/opencode`.
2. Copy `opencode.sample.jsonc` to `opencode.jsonc` and adjust models and authentication.
3. Set `CONTEXT7_API_KEY` in your environment if using the sample Context7 integration.
4. Install the dependency with the repository's package manager only if needed; workflow checks require no installation.
5. Open a fresh OpenCode session to validate agent permissions and skill behavior.

`opencode.jsonc`, `opencode.json`, and `service.json` are ignored by Git. Never commit local tokens or service state.
The sample uses environment substitutions. CLI appearance and interactions belong in `cli.json`, not project configuration.

> [!WARNING]
> This is not a hardened sandbox. Review permission autoaccept in `cli.json` and global external-directory access.
> Ask has full shell/MCP access: denying edit tools does not prevent shell or MCP side effects.

## Architecture

| Layer | Owns |
| --- | --- |
| `agents/` | Minimal role prompts and tool permissions |
| `commands/` | Workflow selection, authority, isolation, and approval policy |
| `skills/` | Explicit entry procedures and conditional dependency manifests |
| Plain skill references | Stage-specific details loaded only when needed |
| `AGENTS.md` | Shared safety, evidence, skill-loading, and stopping rules |

**`edit` is the default.** Ordinary questions and edits need no command or unsolicited skill loading.

| Agent | Purpose | Access |
| --- | --- | --- |
| `chat` | General conversation and external research | Web, questions, explicit skills; no project tools |
| `ask` | Project questions, planning, and approval-gated worker dispatch | Reads, shell, MCP; direct edit tools denied |
| `edit` | Direct edits and explicitly invoked execution workflows | Subject to global/project permissions |
| `explore` | Cited read-only discovery | No shell, Code Mode, edits, or delegation; model unchanged |
| `implement` | Execute an authorized handoff | Hidden subagent; no nested delegation; pinned execution model |

Built-in `plan` and `build` agents remain disabled. These are command names, not extra primary agents.
Ask may dispatch only named `explore` and `implement` profiles; commands further restrict when dispatch is authorized.
Global/project rules and policies remain binding. Children use their own permissions, not a subset of their parent's.

Configuration pins execution subagents `implement` and built-in `general` to
`opencode-go/deepseek-v4.1-flash#high`. The `explore` model stays unchanged.
Worker dispatch does not supply a model override. Add an explicit configuration pin for any new execution subagent.

`hidden: true` removes the implementation worker from listings and the subagent catalog, not security checks.
Workflows name it explicitly. Verify hidden invocation in a fresh session; if unavailable or denied, report the blocker.
Do not expose it or route around a denial. `/build` remains a separately invoked manual alternative.

## Commands

| Command | Behavior |
| --- | --- |
| `/plan <task>` | Plan in `ask`; explicit approval implements on the current branch |
| `/plan:branch <task>` | Same approval flow; implement on a retained feature branch |
| `/plan:worktree <task>` | Same approval flow; implement in a separate retained worktree |
| `/build [plan/phase]` | Execute an already approved plan directly through `edit` |
| `/fix <bug>` | Diagnose and propose a fix; never dispatch implementation, even after “yes” |
| `/fix:branch <bug>` | Diagnose, request approval, then repair through a worker on a feature branch |
| `/fix:worktree <bug>` | Same approval flow in a separate retained worktree |
| `/fix:pr <bug>` | Same approval flow; GitHub publishing required unless the user revises scope |
| `/deliver:worktree <task>` | End-to-end execution/delivery, with worktree isolation by default |
| `/deliver:branch <task>` | End-to-end execution/delivery with branch-only isolation |
| `/commit [limits]` | Approve exact files/messages before local staging and commits |
| `/commit:auto [limits]` | Scoped local commits without routine confirmation; never publish |

Use the delivery names above; no deprecated command aliases are retained.

### Plan and approve

```text
/plan Add password reset to the authentication flow
```

Planning uses read/search and read-only documentation queries: no shell, edits, reproductions, or worker launch.
The final question is: **Approve and implement this plan locally, without isolation, commits, or publishing?**
An unambiguous “yes” dispatches one foreground worker using the local `build` skill. Ask remains the parent.
No manual switch to `edit` is required. `/build` still works for explicit approved-plan execution.

Use `/plan:branch` or `/plan:worktree` for approval-triggered isolation with `plan/` branches.
Their approval questions name the selected isolation; both use current local `HEAD` unless an explicit
local base is supplied, even when remotes exist. The worker verifies that base after approval without
fetching. Branch mode blocks dirty switching and creates no worktrees; worktree mode preserves the
original checkout and never copies dirty files automatically. Resolve dependencies on uncommitted
work before approval. All plan variants leave changes uncommitted: no staging, commits, push, or PRs.
Direct `/build` stays on the current branch and never prepares isolation.

Approval identifies title/revision and phases. Revisions require renewed approval; partial approval limits execution.
Quoted approval, silence, unrelated agreement, or `/build` invocation alone never approve execution.
The parent records worker session/state and avoids duplicate dispatch after repeated approval or interruptions.
If execution may already have started but state is missing, ask rather than replay the task.
Approval dispatch is instruction-driven, not a guaranteed runtime event hook.

### Diagnose and repair

```text
/fix Explain why login times out without changing files
/fix:branch Repair the login timeout
/fix:worktree Repair it without changing my current checkout
/fix:pr Repair it and publish a GitHub PR after approval
```

Diagnosis distinguishes confirmed causes from hypotheses. No tests, setup, instrumentation, fetches, or mutations
run before approval. Repair planning may use read-only Git inspection to identify base and delivery choices.
Executable reproduction needs captured user evidence until execution is authorized.

- **No remote:** use explicit valid local base or verified local `HEAD`. Repair commands leave changes uncommitted
  unless approval explicitly permits commits. Never create an initial commit, remote, or GitHub repository implicitly.
- **Remote present:** verify remote type, base, push target, GitHub repository, and access. A remote alone is not
  proof of a usable GitHub target. Other/ambiguous targets or missing access require a decision.
- **GitHub repair:** approval names isolation, target, scoped commits, push, and PR. Required publishing cannot
  silently fall back locally. Publishing failures remain blockers with useful local state preserved.
- **Bases:** published `main`, or verified remote default branch when absent, unless the user overrides it.
  After approval, fetch and verify the exact base. Failed fetches do not authorize stale/local fallback.
- **Existing work:** dirty branch switching stops. Worktrees preserve the original checkout and never copy dirty
  files automatically. A bug depending on uncommitted original work requires a preservation decision.
- **Proof:** repair the narrow responsible layer; observe suitable red/green regression proof and rerun the
  original reproduction. Report missing proof and baseline failures honestly.

Fix reports use exactly `issue`, `fix plan`, and `result` sections. Diagnosis-only results say “Diagnosis only;
no changes made.” Implementation results include actual checks, limitations, retained branch/worktree, delivery
state, and verified PR URL when available.

### Deliver a task

Delivery command invocation authorizes isolation, implementation, validation, scoped commits, normal push, and
PR creation/update within user limits. No routine plan or commit-plan confirmation is required.
With no remote, delivery permits local commits only. Non-GitHub/ambiguous remotes and missing publishing access
require a decision. `/deliver:branch` retains its narrower skill selection: TanStack CLI requires a user request.

`no commits` also means no staging, push, or PR; `no push` also means no PR; `no PR` still permits authorized push.
Required local proof stops publishing when failing or unverified. Review full task diffs for unrelated work and secrets.
Push only task branches, never force-push. Published history is append-only. CI checking is bounded to three repair
rounds and 15 minutes total waiting across resumptions; report pending/failing/unavailable CI honestly.

PR bodies contain **Issue**, **Fix**, and **Validation**. A short actual fenced `diff` is optional when it explains
the root fix; do not paste entire patches. Reference issues without auto-closing keywords.
Merging, deployment, issue closure, destructive Git, and cleanup need separate authority and applicable confirmation.
Branches/worktrees are retained. Verified task PR URLs end the result when available, including after later blockers.

## Explicit skills only

Every local `skills/**/SKILL.md` sets `metadata.opencode/autoinvoke: false`. Hidden skills remain loadable by exact ID.
Commands explicitly load their entry skill and authorize its declared dependency manifest within command limits.
Each dependency has a written stage/task trigger. Do not load all dependencies at startup or select unlisted skills.
Skills do not grant execution authority. There is no documented command configuration field for automatic skill preload.

Ordinary requests load no skills unless the user explicitly asks. You may manually request other installed skills,
or define project-local commands with their own explicit loading instructions. Nothing installs skills automatically.
External `.agents/` skills are made explicit-only by `plugins/external-skills-manual.js`, which sets
`autoinvoke` false on registered entries whose path is under `~/.agents/skills`. Matching is by path, not
by ID, so same-named project skills are unaffected. Publisher files stay untouched, and those skills
remain registered and loadable by exact ID.

| Skill | Owner |
| --- | --- |
| `plan` | Plan creation and approval-triggered handoff |
| `build` | Approved-plan execution; optional explicitly approved plan isolation, no delivery |
| `fix-diagnosis` | Evidence, hypotheses, cause, and repair planning |
| `surgical-patch` | Narrow repair and regression proof |
| `git-isolation` | Local/published base and branch/worktree readiness |
| `commit` | Scoped staging, commit mechanics, and message style |
| `deliver` | Authorized execution and conditional publishing orchestration |
| `worker-style` | Concise worker communication without lost evidence |
| `safe-refactor`, `migration`, `verify-and-stop` | Explicit task-specific methods |
| `tanstack-cli` | Explicit TanStack CLI task and selected references |

Plain shared references own approval/handoff and reporting; they are not additional discoverable skills.
Worker style requests exact available `ultracave`, otherwise `caveman`, only when authorized. If neither is available,
local concise rules apply. It never installs/modifies external skills or claims unavailable ultra mode.
Persisted code, documentation, commits, and PRs retain clear grammar and complete technical facts.

## Validation

```sh
ruby tests/workflow_test.rb
python3 tests/preflight_test.py
git diff --check
```

Static checks cover metadata, explicit skill loading, references, permission ordering, workflow contracts, and prompt
bounds. They do not prove model obedience or live enforcement. Preflight tests include fixture cases and unchanged
checkout status/index proof. The helper uses bounded read-only inspection, not ownership proof or complete diff review.

Fresh-session scenarios: hidden worker invocation; current/branch/worktree plan handoffs; approval/rejection;
revised/partial approval; duplicate prevention; diagnosis-only “yes”; local branch/worktree repair;
GitHub target approval; missing access; configured worker model.
Use disposable repositories for mutation checks. Do not publish a real PR merely to test this setup.

Command files reload automatically. Use fresh sessions for changed agent permissions and skill instructions.
This repository does not restart the service automatically. Record live tests separately from static checks.

## Experimental pilot

`extensions/workflow-pilot/` holds an inactive, runtime-independent deterministic
approval/handoff core and its offline tests. It is not loaded as a plugin and is not
wired into any command. See `extensions/workflow-pilot/README.md`; run the checks with
`node --test tests/workflow_pilot_test.mjs`.

## License

MIT
