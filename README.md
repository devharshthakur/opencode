# Lean OpenCode workflow

Personal [OpenCode V2](https://opencode.ai/v2/docs/) setup: two primary agents,
three subagent-only workers, current-model commands, and deliberate approval
boundaries. This README is an introduction and quick reference — each command and
skill file stays the authoritative detail.

## Getting started

Copy the tracked `opencode.sample.jsonc` to the ignored `opencode.jsonc`, then
connect your accounts. The sample uses environment references
(`{env:CONTEXT7_API_KEY}`, `{env:GITHUB_MCP_TOKEN}`); this user's local file keeps
existing inline secrets by explicit choice — never print or commit them. Both
`opencode.jsonc` and `service.json` are gitignored; credentials stay untouched.
The handoff update adds only the `verify` model entry to the local configuration.

**Only Context7 is enabled by default.** Every other MCP definition stays
configured but disabled; opt in deliberately and avoid duplicating native
filesystem tools with extra MCP schemas.

## Agents

| Agent | Where | Model policy |
| --- | --- | --- |
| `dev` | Primary; default | DeepSeek V4.1 Flash low; ordinary questions or direct edits |
| `chat` | Primary | DeepSeek V4.1 Flash high; external conversation/research, no project tools |
| `explore` | Subagent only | Muse Spark 1.3 Contributor medium; bounded cited discovery |
| `implement` | Subagent only | DeepSeek V4.1 Flash high; authorized worker execution of approved plans |
| `verify` | Subagent only | DeepSeek V4.1 Flash high; independent read-only change review |

Shift+Tab cycles only `dev` and `chat`; all three workers remain discoverable subagents.
Selecting an agent and selecting a session model are separate in V2: switching to
`chat` alone does not switch the model, and existing sessions keep their selected
model. Use `/models` to pick a different one; commands run in the current session
and never override that choice.

### Session-local todos

The sample enables `experimental.todo`; the local config already enables it.
Both primary agents and all workers use `todowrite` for multi-step progress,
skipping trivial requests. `chat`, `explore`, and `verify` have a narrow todo permission
exception; their project-access restrictions remain unchanged. This changes
session metadata, not repository files or execution authority.

Implementation handoffs carry a scoped `todos` snapshot (stable ID, phase,
content, status). After validating authority, the worker recreates it in its own
session and updates it as acceptance is proved. Read-only exploration briefs can
also carry scoped discovery todos. Workers return final statuses and evidence;
the parent checks the evidence before reconciling its own list. Lists are not
automatically synchronized between sessions. See the
[todo transfer protocol](skills/shared/approval-handoff.md#session-local-todo-transfer).

Todo status is not approval. Markdown approval checklists remain visible, and no
tracker file is required. Unavailable/denied tools are reported with conversational
tracking as fallback; continued sessions reconcile existing progress before import,
never replaying completed or uncertain work.

Config and instructions normally reload automatically; use fresh sessions to
validate this experimental feature. Confirm `todowrite` is available to `dev`,
`chat`, `explore`, `implement`, and `verify`, while forbidden project tools remain blocked
for restricted roles. On a separately approved small multi-step task, inspect the
worker's initial list, status updates, final evidence, and parent reconciliation;
also check partial assignment and continuation without replay. Offline contracts
do not prove runtime permission checks or model obedience. Current V2 tools and
permissions docs do not yet describe this experimental tool; no service restart
or live proof is implied by a passing static check.

## Markdown worker handoffs

The [handoff contract](skills/shared/handoff.md) standardizes `explore`,
`implement`, and `verify` requests/results as controlled Markdown. Named sections
carry identity, scope, authority, assignments, acceptance, and relevant context.
The parent uses checklist preflight before dispatch and assesses returned evidence
against the exact assignment. Native `subagent` receives the Markdown prompt
directly: this is **not** enforced dispatch or authenticated approval.

Templates may be adapted to the task: headings and grouping are flexible, required
information and safeguards are not. User-facing approval plans explain outcomes,
scope, consequential choices, risks, and success checks concisely. Subagents receive
a separate detailed execution brief with the approved assignment, relevant source
evidence, implementation guidance, and exact checks. Supporting detail cannot
expand the approved scope or change agreed decisions.

- **Explore:** decisive excerpts, provenance, guards/callers, counterevidence,
  coverage, and decision sufficiency. Parent reads may explicitly be none; gaps
  name the smallest lookup. No mandatory rereading of citations or hard read quota.
- **Implement:** exact approved phase/Todo assignment, relevant evidence, edit
  brief/invariants, observable acceptance, checks, and detailed evidence report.
  Ordinary implementation choices stay with the worker.
- **Verify:** independent assessment of actual before/after changes, not just the
  implementer summary. Selective for risk/conflict or explicit requests; shell,
  edits, tests, and delegation remain denied. The parent retains acceptance.

Workers return self-contained, role-specific evidence reports for parent decisions,
not activity diaries. Parent source reads are risk-based and targeted; user-facing
summaries stay concise. Clarification can resume the attributable worker with a
report-only Markdown request, which performs no new work. Templates are examples, not
approval. Ordinary tasks execute in the current session with its selected model;
bounded `explore` discovery and read-only `verify` assistance remain allowed.
Implementation dispatch needs approved explicit `@worker` or `/use:worker` opt-in,
except `/improve*` tasks retain default worker authority through nested workflows.
No parallel implementers or automatic repair loop is added. See
[task execution](skills/shared/execution.md).

The [review-evidence utility](skills/shared/verification.md) lets the parent collect
scoped baseline/after artifacts in task-owned temporary storage, returning compact
paths/digests rather than source to the parent model. It preserves dirty baselines,
flags unexpected changes and stale evidence, excludes protected files, and reports
coverage limits. Before/after artifacts are real source and remain subject to
permissions/privacy policy; they are not a secret scanner or sandbox. Cleanup is
mandatory after reconciliation. There is no persistent ledger or active plugin.

Fresh-session proof is required for verifier discovery, effective permission
denials, configured model, and receipt/report behavior. Existing sessions may not
expose a newly added worker. Offline checks do not prove obedience or token savings.

## Everyday commands

| Command | Behavior |
| --- | --- |
| `/ask <question>` | Read-only answer; no shell, edits, or unsolicited plan |
| `/quick <task>` | Direct execution on the current model; planning bypass |
| `/plan <task>` | Plan; approval executes directly on the current branch |
| `/setup <docs, URL, or setup skill references>` | Discover setup choices, prepare a concise custom plan; approval implements locally |
| `/create:skill <idea or context>` | Interview and design a project-local OpenCode skill; confirm before writing |
| `/fix <issue>` | Root-cause diagnosis plus Todo repair plan; approval executes directly |
| `/improve [scope]` | Evidence-first audit; select findings, then plan and separately approve implementation |
| `/use:worker [task]` or `@worker` | Propose worker execution; one approval covers workers needed for that task |
| `/commit [scope]` | Defaults to all current changes; approve small coherent local commits as an ordered series |
| `/commit:auto [scope]` | Defaults to all current changes; create small coherent local commits without routine confirmation |
| `/pr [:<base>] [draft]` | Task-scoped commits/push and create or update a GitHub PR |

Planning variants add explicitly approved isolation: `/plan:branch`,
`/plan:worktree`, `/fix:branch`, and `/fix:worktree`. `/fix*` diagnoses on a
temporary `fix/diag-<slug>` branch, deletes it before asking for approval, and
proposes a Markdown Todo checklist. Nothing here publishes, amends, merges,
deploys, or performs destructive cleanup automatically. Full behavior lives in
[`commands/`](commands/).

### Explicit worker opt-in

Use `@worker` or `/use:worker` with a task, or omit arguments to use the current
task. Both prepare a concise approval proposal and detailed execution handoff;
invocation alone does not dispatch. If a plan also needs approval, the proposal
combines plan approval and worker-use approval into one reply. If the exact plan
is already approved, only worker use needs approval.

One approval authorizes worker use for the task, not a particular count. The parent
may dispatch additional in-scope workers without asking again. Scope changes and
new operations retain their existing approval gates. Task completion/cancellation
ends that authority; unrelated tasks default to direct execution. `/improve*`
does not need a separate worker-use opt-in, but still needs its normal selection
and implementation-plan approvals. The manual-only
[`worker` skill](skills/worker/SKILL.md) owns this opt-in workflow.

The custom `/build` command and `build` skill are retired: approved plans now
execute directly by default, using the shared execution reference. No agent model
or tool permission configuration is changed by worker opt-in.

### Codebase improvement audits

Use these directly, with no prompt required:

| Command | Scope |
| --- | --- |
| `/improve` | Standard audit across all nine categories |
| `/improve:quick` / `/improve:deep` | Hotspot audit / broader package-scoped audit |
| `/improve:bugs` / `/improve:security` / `/improve:perf` | Correctness / security / performance |
| `/improve:tests` / `/improve:debt` / `/improve:deps` | Verification / architecture / dependencies and migrations |
| `/improve:dx` / `/improve:docs` / `/improve:next` | Tooling / documentation / product-direction proposals |

Optional short arguments narrow scope or override depth:

```text
/improve:quick server/
/improve:security deep server/api/
/improve:next
```

The standalone local `codebase-improve` skill owns the workflow; the external
`@improve` skill is not required. Configured cheap `explore` agents return evidence
packets and perform targeted verification. The parent synthesizes sufficient
evidence, requests follow-ups for gaps, and independently verifies high-risk or
conflicting claims rather than automatically rereading every cited file. Source
reads remain available for named gaps and necessary decision/edit/review context.

Audits are read-only under the shared planning boundary. Findings appear in
conversation; selecting IDs leads to a plan, **not implementation approval**.
Plans/files, commits, or publication are never created implicitly. A separately
approved plan uses the existing local `implement` handoff by default, or direct
execution if explicitly requested. Its worker authority survives nested plan/fix
workflows without a separate worker-use prompt. Current session agent/model choices
are preserved. Use `dev`;
`chat` must ask you to switch rather than silently changing profiles.

Commands normally reload automatically. In a fresh `dev` session, confirm the
`/improve*` commands and local skill are available; then check a small audit trace
for evidence reuse and justified parent reads. Offline contracts do not establish
model obedience or measured token savings.

### Documentation-driven setup

Use `/setup` with pasted documentation or Markdown, a documentation URL, attached
content, or setup skill references alone. Add your own requirements alongside the
sources. It works for library integrations and new project bootstrapping, not just
web development—for example, Better Auth in Nuxt, shadcn, or a starter template.

The agent reads necessary references and checks the actual project and versions.
It asks about applicable setup choices (including optional customizations such as
fonts, themes, icons, providers, and database adapters) in grouped rounds, with
recommendations. Existing values are shown for confirmation; documented defaults
are not silently selected. Explicit instructions already supplied count as answers.
Missing essential sources or incompatible instructions are surfaced before approval.

You receive a concise plan with confirmed choices and a Markdown Todo checklist.
Choice confirmation is not implementation approval. Approval executes the detailed
source-backed plan directly in the current session by default. Explicit approved
worker opt-in or inherited `/improve*` authority enables worker execution instead.
No plan file, new agent, installs, or project edits are created during planning.
The workflow preserves the selected model/agent and runs
in `dev`; cloud provisioning, destructive overwrites, production changes, commits,
and publishing are outside the default local scope. Full setup procedure:
[`skills/plan/references/setup.md`](skills/plan/references/setup.md).

## Important boundaries

> [!WARNING]
> **`dev` is allow-all** — including shell, sensitive reads, and external
> directories. This is the user's explicit choice, not a hardened sandbox. `/ask`
> and planning limits are instruction-based: commands do not revoke tools, and
> untrusted repository text cannot authorize work.

> [!WARNING]
> **Muse Contributor allows prompts and completions to be used for training and is
> not zero-data-retention.** Exploration may send repository source to that
> provider, and availability is regional. There is no silent fallback — choose a
> different explorer model before sending code whose data policy is incompatible.

**Approval is not publishing.** Approving a plan authorizes local implementation
only; commits, pushes, and PRs need their own explicit approval, and the parent
offers PR delivery only after a completed task (or you run `/pr`). Genuine blockers,
destructive-operation confirmations, and user limits always apply.

**Planning can inspect via shell and start disposable local services** needed for
discovery. `/plan*` keeps repository files unchanged and leaves implementation and
Git mutations behind approval. See the [planning shell boundary](skills/plan/SKILL.md).
`/ask` and `explore` remain read-only.

**Task-owned resource cleanup is a completion gate**, including during planning.
Follow the shared [resource lifecycle](skills/shared/cleanup.md) from resource
creation, not only at the final response. Pre-existing resources and intended
deliverables stay untouched; cleanup failures are reported, not hidden. This is an
instruction protocol, not a crash-recovery service or runtime enforcement hook.

CLI permissions are independently configured: `explore` and `verify`
deny shell, edits, Code Mode, delegation, and known secret-bearing reads; `chat`
denies project tools; `implement` cannot recursively delegate. Managed policies and
permission denials remain binding even for `dev`.

## Further reading

- Agents and permissions: [`agents/`](agents/)
- Commands: [`commands/`](commands/)
- Orchestration skills: [`skills/`](skills/) — `plan`, `fix`, `codebase-improve`, `worker`, `commit`, `git-isolation`, `pr`
- Skill authoring: [`skills/create-skill/SKILL.md`](skills/create-skill/SKILL.md)
- Direct/worker execution policy and procedure: [`skills/shared/execution.md`](skills/shared/execution.md)
- PR templates: [`skills/pr/references/templates.md`](skills/pr/references/templates.md)
- Shared guidance: [`AGENTS.md`](AGENTS.md)
- Markdown handoffs and templates: [`skills/shared/handoff.md`](skills/shared/handoff.md)
- Independent verification and evidence collection: [`skills/shared/verification.md`](skills/shared/verification.md)

Task-scoped validation tests are the default: agents create only what the current
task needs, record actual results, and remove the test files before completion.
Pre-existing tests and explicitly requested test deliverables remain. Run
`git diff --check` before completion to catch whitespace errors and conflict
markers. This repository keeps no permanent test suite; see the
[templates](skills/shared/handoff/templates/) and
[worked example](skills/shared/handoff/example.md) for the handoff format.

<details>
<summary>Maintenance notes</summary>

Static review does not prove live model obedience, token savings, plugin
effectiveness, model-request effort, or UI behavior.
Commands, configuration, and CLI preferences normally reload automatically; use a
fresh session to validate role, permission, or skill changes. Plugin helper changes
outside watched directories can require an explicit reload or service restart, and
rollback should restore only affected files from a protected backup — never reset
Git to simplify it.

Fresh-session cleanup proof remains manual: exercise `/plan*` discovery with an
owned temporary service/file and verify teardown before approval; repeat with
implementation through `/quick`, approved direct plans, and explicit worker handoff.
Verify a pre-existing service/file remains untouched, and a failed or uncertain cleanup is reported
without forceful escalation. Also exercise a failed task and interruption/resume.
Use disposable local fixtures; Docker is optional, not required for offline checks.

Fresh-session routing proof remains manual: approve a small `/plan` or `/fix`
task and confirm the current model implements it (bounded `explore` is allowed).
Check branch/worktree variants preserve their approved isolation. Invoke `@worker`
or `/use:worker` and confirm no dispatch before approval, a detailed approved
handoff afterward, and no repeated worker-use prompt for additional in-scope workers.
Confirm `/improve*` still waits for selection/plan approval and retains worker
authority through nested planning/fixing. These are instruction contracts, not
runtime enforcement or live proof.

</details>
