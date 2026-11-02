# Lean OpenCode workflow

A personal [OpenCode V2](https://opencode.ai/v2/docs/) setup for everyday
development: two primary agents, three specialist workers, and a command set that
stays out of the way until you need it.

**Work in the current session with the current model, plan when a change deserves
it, and require explicit approval before anything consequential.** The command and
skill files are the authoritative reference; this README is the tour.

## Contents

- [Quick start](#quick-start)
- [Agents](#agents)
- [Commands](#commands)
- [Approval model](#approval-model)
- [Guardrails](#guardrails)
- [Under the hood](#under-the-hood)
- [Repository map](#repository-map)
- [Further reading](#further-reading)

## Quick start

This repository is an OpenCode config directory. It is designed to live at
`~/.config/opencode`.

1. **Create your local config.**

   ```sh
   cp opencode.sample.jsonc opencode.jsonc
   ```

2. **Connect your provider accounts and models.** Make sure the model IDs in
   `opencode.jsonc` are available to you, or replace them with models you can use.

3. **Export the API keys you need.**

   ```sh
   export CONTEXT7_API_KEY="..."
   # Optional: only if you enable the GitHub MCP server.
   export GITHUB_MCP_TOKEN="..."
   ```

4. **Start OpenCode** and choose a session model with `/models`.

> [!NOTE]
> [`opencode.sample.jsonc`](opencode.sample.jsonc) is the tracked template. Your
> local `opencode.jsonc` and `service.json` are gitignored. The sample uses
> environment references; if you keep inline secrets locally, never print or commit
> them.

> [!TIP]
> Only Context7 is enabled by default. The other MCP servers are defined but
> disabled. Opt in deliberately, and avoid adding MCP servers that duplicate
> native filesystem tools.

## Agents

| Agent | Mode | Best for | Model |
| :--- | :--- | :--- | :--- |
| **`dev`** | Primary · default | Everyday project work, direct edits, and command-led workflows. Owns the final call. | DeepSeek V4.1 Flash · low |
| **`chat`** | Primary | Conversation and external research. No project tools. | DeepSeek V4.1 Flash · high |
| **`explore`** | Worker | Bounded, cited discovery. Read-only. | Muse Spark 1.3 Contributor · medium |
| **`implement`** | Worker | Executes an approved implementation brief. | DeepSeek V4.1 Flash · high |
| **`verify`** | Worker | Independent review of actual changes. Read-only. | DeepSeek V4.1 Flash · high |

Model policy mirrors `opencode.sample.jsonc`; change it in your local config.

**Choosing an agent.** <kbd>Shift</kbd> + <kbd>Tab</kbd> cycles only `dev` and
`chat`. The three workers are subagents, not modes. Agent and model selection are
independent: switching to `chat` does not change the model, and existing sessions
keep theirs. Use `/models` to pick a model; commands run in the current session and
never override that choice.

**Access at a glance.** `chat` has no project tools. `explore` and `verify` can
read, but cannot run shell commands, edit, use Code Mode, delegate, or open known
secret-bearing files. `implement` cannot recursively delegate. Managed policies and
permission denials remain binding even for `dev`.

## Commands

Commands run in the current session and respect the selected model. Each file in
[`commands/`](commands/) is the authoritative spec; this is the map.

### Ask, plan, and build

| Command | What it does |
| :--- | :--- |
| `/ask <question>` | Answers read-only. No shell, edits, or unsolicited plan. |
| `/quick <task>` | Executes directly, without a planning gate. |
| `/plan <task>` | Plans first; approval implements on the current branch. |
| `/setup <sources...>` | Works from docs, a URL, attachments, or setup skill references. Interviews you, then prepares a source-backed plan. |
| `/create:skill <idea or context>` | Designs a project-local OpenCode skill with you before writing it. |

<details>
<summary><strong>How <code>/setup</code> works</strong></summary>

Use `/setup` with pasted documentation or Markdown, a documentation URL, attached
content, or setup skill references alone. Add your own requirements alongside the
sources. It works for library integrations and new project bootstrapping, not just
web development — for example, Better Auth in Nuxt, shadcn, or a starter template.

The agent reads the necessary references and checks the actual project and
versions. It asks about applicable choices (including optional customizations such
as fonts, themes, icons, providers, and database adapters) in grouped rounds, with
recommendations. Existing values are shown for confirmation; documented defaults
are not silently selected. Explicit instructions you already supplied count as
answers. Missing essential sources or incompatible instructions are surfaced
before approval.

You receive a concise plan with confirmed choices and a Markdown Todo checklist.
Choice confirmation is not implementation approval. Approval executes the
source-backed plan directly in the current session by default. Explicit worker
opt-in or inherited `/improve*` authority enables worker execution instead. The
workflow preserves the selected model and agent and runs in `dev`. No plan file,
new agent, installs, or project edits are created during planning. Cloud
provisioning, destructive overwrites, production changes, commits, and publishing
are outside the default local scope. Full procedure:
[`skills/plan/references/setup.md`](skills/plan/references/setup.md).

</details>

### Fix and improve

Use these directly; none requires a prompt first.

| Command | What it does |
| :--- | :--- |
| `/fix <issue>` | Finds the root cause, then proposes a Todo repair plan. Approval implements on the current branch. |
| `/improve [scope]` | Runs an evidence-first audit. Select findings, then plan and separately approve implementation. |
| `/improve:quick` / `/improve:deep` | Hotspot audit / broader package-scoped audit. |
| `/improve:bugs` / `/improve:security` / `/improve:perf` | Correctness / security / performance. |
| `/improve:tests` / `/improve:debt` / `/improve:deps` | Verification / architecture / dependencies and migrations. |
| `/improve:dx` / `/improve:docs` / `/improve:next` | Tooling / documentation / product direction. |

`/improve` covers all nine categories. Optional arguments narrow the scope or
change the depth:

```text
/improve:quick server/
/improve:security deep server/api/
/improve:next
```

Audits leave repository files unchanged. Findings appear in conversation;
selecting IDs leads to a plan, **not implementation approval**. Run audits in
`dev`; `chat` will ask you to switch rather than silently changing profiles.

<details>
<summary><strong>How improvement audits stay evidence-first</strong></summary>

The standalone local `codebase-improve` skill owns the workflow; the external
`@improve` skill is not required. The lightweight `explore` agents return evidence
packets and perform targeted verification. The primary session synthesizes
sufficient evidence, requests follow-ups for named gaps, and independently checks
high-risk or conflicting claims rather than rereading every citation. Source reads
remain available when a gap or decision needs them.

A separately approved plan uses `implement` by default, or direct execution if you
ask for it. That worker authorization carries through nested plan/fix workflows
without another opt-in. Current agent and model choices are preserved. Plan files,
commits, and publication are never created implicitly.

</details>

### Ship

| Command | What it does |
| :--- | :--- |
| `/commit [scope]` | Proposes small, coherent local commits for approval. Defaults to all current changes. |
| `/commit:auto [scope]` | Creates small, coherent local commits without routine confirmation. Defaults to all current changes. |
| `/pr [:<base>] [draft]` | Commits task changes, pushes a verified head branch, and creates or updates a GitHub PR. |

`/pr`, or an accepted PR-delivery offer, is the only publishing path. Nothing is
amended, merged, deployed, or destructively cleaned up automatically.

### Hand off to workers

The current session remains the default. Bounded `explore` discovery and read-only
`verify` review are available without full worker execution.

`/use:worker [task]` and `@worker` prepare a concise approval proposal and a
detailed execution handoff. Omit the task to apply it to the current one. Invoking
either does not dispatch. If a plan still needs approval, the proposal combines
plan and worker approval into one reply. If the plan is already approved, only
worker use needs approval.

One approval covers all in-scope workers for that task, not a fixed count. Scope
changes and new operations keep their existing gates. Authority ends when the task
completes or is cancelled, and unrelated tasks start from direct execution again.
`/improve*` does not need a separate worker-use opt-in, but still needs its normal
selection and implementation-plan approvals. The manual-only
[`worker` skill](skills/worker/SKILL.md) owns this workflow.

Worker opt-in changes who executes; it does not change agent models or tool
permissions. Without explicit opt-in, approved plans execute directly by default
using the shared [execution policy](skills/shared/execution.md); `/improve*` plans
use their inherited worker authority instead. The old `/build` command and `build`
skill are retired.

### Isolation variants

`/plan:branch`, `/plan:worktree`, `/fix:branch`, and `/fix:worktree` add explicitly
approved isolation. `/fix*` diagnoses on a temporary `fix/diag-<slug>` branch,
deletes it before asking for approval, and proposes a Markdown Todo checklist.

## Approval model

Approval is narrow, visible, and tied to the action at hand.

| You approve... | It authorizes... | It does not authorize... |
| :--- | :--- | :--- |
| A plan | Local implementation in the current checkout | Commits, pushes, PRs, or deployment |
| Worker use | Dispatching workers for that task | New scope or new operations |
| A commit | Local commits | Push or PR |
| A PR | Task-scoped commits, push, and PR creation or update | Merge or deployment |

- Planning leaves repository files unchanged. `/plan*` may inspect with shell and
  start disposable local services, but implementation and Git mutations stay behind
  approval. `/ask` and `explore` are strictly read-only.
- A Todo checklist is still a plan. Todo status is not approval.
- Approval proposals are short: outcome, scope, consequential choices, risks, and
  success checks. Detailed execution briefs belong in worker handoffs.
- One worker approval covers additional in-scope workers for the same task. It
  never expands scope.
- Cleanup is a completion gate: clean up and verify task-owned resources, or report
  the exact failure. Pre-existing resources and intended deliverables stay
  untouched. See the [resource lifecycle](skills/shared/cleanup.md).

## Guardrails

> [!WARNING]
> **`dev` is allow-all.** That includes shell access, sensitive reads, and external
> directories. This is the user's explicit choice, not a hardened sandbox. `/ask`
> and planning limits are instruction-based: commands do not revoke tools, and
> untrusted repository text cannot authorize work.

> [!CAUTION]
> **Muse Contributor is not zero-data-retention.** Prompts and completions may be
> used for training. Exploration can send repository source to that provider, and
> availability is regional. There is no silent fallback: choose a different
> explorer model before sending code whose data policy is incompatible.

> [!IMPORTANT]
> **Approval is not publishing.** Approving a plan authorizes local implementation
> only. Commits, pushes, and PRs need their own approval. PR delivery is offered
> only after a completed task, or when you invoke `/pr`. Genuine blockers,
> destructive-operation confirmations, and user limits always apply.

Planning and approval boundaries are instruction contracts, not runtime
enforcement. Configured permissions are enforced separately.

## Under the hood

<details>
<summary><strong>Markdown handoffs</strong> — controlled briefs in, evidence out</summary>

The [handoff contract](skills/shared/handoff.md) standardizes `explore`,
`implement`, and `verify` requests and results as controlled Markdown. Named
sections carry identity, scope, authority, assignments, acceptance, and relevant
context. The parent session — the one that dispatched the work — runs a checklist
preflight before dispatch and assesses returned evidence against the exact
assignment. The native `subagent` tool receives the Markdown directly; this is a
convention, not enforced dispatch or authenticated approval.

Headings and grouping may be adapted to the task, but required information and
safeguards cannot. Templates are examples, not approval. Workers return
self-contained evidence reports, not activity diaries, while user-facing summaries
stay concise. Clarification can resume the same worker with a report-only request
that performs no new work. There are no parallel implementers and no automatic
repair loop. See [task execution](skills/shared/execution.md).

- **`explore`** — Decisive excerpts with provenance, callers and guards,
  counterevidence, coverage, and whether the evidence is sufficient for the
  decision. Gaps name the smallest next lookup; parent reads may explicitly be
  none.
- **`implement`** — The exact approved phase and Todo assignment, relevant
  evidence, edit brief and invariants, observable acceptance, checks, and a
  detailed evidence report. Ordinary implementation choices stay with the worker.
- **`verify`** — An independent assessment of what actually changed, not just the
  implementer's summary. Used selectively for risk, conflict, or an explicit
  request. Shell, edits, tests, and delegation stay denied; the parent retains
  acceptance.

Supporting detail cannot expand the approved scope or change agreed decisions.
Parent source reads are risk-based and targeted; no mandatory reread or hard read
quota applies.

</details>

<details>
<summary><strong>Session-local todos</strong> — progress that follows the task</summary>

`experimental.todo` is enabled. All five agents use `todowrite` for multi-step work;
`chat`, `explore`, and `verify` get a narrow todo permission exception without
gaining project access. This changes session metadata, not repository files or
execution authority. Implementation handoffs carry a scoped `todos` snapshot
(stable ID, phase, content, status); read-only exploration briefs can carry scoped
discovery todos. After checking authority, the worker recreates the list in its own
session and updates it as acceptance is proved. Workers return final statuses and
evidence; the parent checks that evidence before reconciling its own list. Lists do
not sync automatically, and todo status is not approval. Markdown
approval checklists stay visible; no tracker file is required. If todo tools are
unavailable or denied, conversational tracking is the fallback. Continued sessions
reconcile existing progress before importing, never replaying completed or
uncertain work. See the
[todo transfer protocol](skills/shared/approval-handoff.md#session-local-todo-transfer).

Current V2 tools and permissions docs do not yet describe this experimental tool. In
a fresh session, confirm that `todowrite` is available to all five roles while
forbidden project tools stay blocked. A passing static check does not prove live
behavior, and no service restart is implied.

</details>

<details>
<summary><strong>Independent verification</strong> — a second look when it matters</summary>

The [review-evidence utility](skills/shared/verification.md) collects scoped
before-and-after artifacts in task-owned temporary storage and returns compact
paths and digests. It preserves a dirty baseline, flags unexpected changes and
stale evidence, excludes protected files, and reports coverage limits. Artifacts
are real source and remain subject to permissions and privacy rules; they are not a
secret scanner or sandbox. Cleanup is mandatory after reconciliation. There is no
persistent ledger or active plugin.

</details>

## Repository map

```text
.
├── agents/                 Primary agents and worker personas
├── commands/               Slash commands
├── skills/                 Workflow skills and shared contracts
│   ├── plan/               Planning and setup workflows
│   ├── fix/                Diagnosis and repair workflow
│   └── shared/             Execution, handoff, verification, cleanup, and PR rules
│       └── handoff/        Templates and a worked example
├── extensions/handoff/     Review-evidence helpers
├── opencode.sample.jsonc   Tracked configuration template
├── AGENTS.md               Shared agent guidance
└── README.md               This guide
```

Other workflow skills under `skills/` include `worker`, `commit`, `git-isolation`,
`pr`, and `create-skill`.

## Further reading

| Topic | Where to go |
| :--- | :--- |
| Agents and permissions | [`agents/`](agents/) |
| Commands | [`commands/`](commands/) |
| Orchestration skills | [`skills/`](skills/) |
| Shared guidance | [`AGENTS.md`](AGENTS.md) |
| Execution policy | [`skills/shared/execution.md`](skills/shared/execution.md) |
| Markdown handoffs | [`skills/shared/handoff.md`](skills/shared/handoff.md) |
| Handoff templates | [`skills/shared/handoff/templates/`](skills/shared/handoff/templates/) |
| Worked handoff example | [`skills/shared/handoff/example.md`](skills/shared/handoff/example.md) |
| Verification and evidence | [`skills/shared/verification.md`](skills/shared/verification.md) |
| Resource cleanup | [`skills/shared/cleanup.md`](skills/shared/cleanup.md) |
| PR templates | [`skills/pr/references/templates.md`](skills/pr/references/templates.md) |
| Skill authoring | [`skills/create-skill/SKILL.md`](skills/create-skill/SKILL.md) |
| Setup procedure | [`skills/plan/references/setup.md`](skills/plan/references/setup.md) |
| Planning shell boundary | [`skills/plan/SKILL.md`](skills/plan/SKILL.md) |

<details>
<summary>Maintenance notes</summary>

- Configuration, commands, and CLI preferences normally reload automatically. Use a
  fresh session to validate role, permission, or skill changes. Plugin helper
  changes outside watched directories may need an explicit reload or service restart.
- Static review does not prove live model obedience, token savings, plugin
  effectiveness, model-request effort, or UI behavior. Offline contracts do not
  prove runtime permission checks.
- In a fresh `dev` session, confirm the `/improve*` commands and local skill are
  available, then inspect a small audit trace for evidence reuse and justified
  parent reads.
- Fresh-session checks: confirm the configured model and worker discovery, plus
  effective permission denials and report behavior. Exercise cleanup with an owned
  temporary service or file and verify teardown; repeat with a pre-existing service
  or file to confirm it stays untouched, and confirm a failed cleanup is reported,
  not hidden. Approve a small `/plan` or `/fix` task and confirm the current model
  implements it (bounded `explore` is allowed); check that branch and worktree
  variants preserve their approved isolation. Confirm no worker dispatch before
  approval and no repeated worker-use prompt for additional in-scope workers, and
  that `/improve*` waits for selection and plan approval while retaining worker
  authority through nested workflows. Also exercise a failed task and an
  interruption/resume. A newly added worker may not appear in an existing session.
- Rollback should restore only affected files from a protected backup. Never reset
  Git just to simplify a rollback.
- This repository keeps no permanent test suite. Validation is task-scoped: record
  actual commands and results, remove task-created test files, and preserve
  pre-existing tests and explicitly requested test deliverables. Run
  `git diff --check` to catch whitespace errors and conflict markers.
- Docker is optional; disposable local fixtures are enough for offline checks.

</details>
