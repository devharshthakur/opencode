# Lean OpenCode workflow

Personal [OpenCode V2](https://opencode.ai/v2/docs/) setup: two primary agents,
two subagent-only workers, current-model commands, and deliberate approval
boundaries. This README is an introduction and quick reference — each command and
skill file stays the authoritative detail.

## Getting started

Copy the tracked `opencode.sample.jsonc` to the ignored `opencode.jsonc`, then
connect your accounts. The sample uses environment references
(`{env:CONTEXT7_API_KEY}`, `{env:GITHUB_MCP_TOKEN}`); this user's local file keeps
existing inline secrets by explicit choice — never print or commit them. Both
`opencode.jsonc` and `service.json` are gitignored and left untouched.

**Only Context7 is enabled by default.** Every other MCP definition stays
configured but disabled; opt in deliberately and avoid duplicating native
filesystem tools with extra MCP schemas.

## Agents

| Agent | Where | Model policy |
| --- | --- | --- |
| `dev` | Primary; default | DeepSeek V4.1 Flash low; ordinary questions or direct edits |
| `chat` | Primary | DeepSeek V4.1 Flash high; external conversation/research, no project tools |
| `explore` | Subagent only | Muse Spark 1.3 Contributor medium; bounded cited discovery |
| `implement` | Subagent only | DeepSeek V4.1 Flash high; approved-plan execution |

Shift+Tab cycles only `dev` and `chat`; both workers remain discoverable subagents.
Selecting an agent and selecting a session model are separate in V2: switching to
`chat` alone does not switch the model, and existing sessions keep their selected
model. Use `/models` to pick a different one; commands run in the current session
and never override that choice.

## Everyday commands

| Command | Behavior |
| --- | --- |
| `/ask <question>` | Read-only answer; no shell, edits, or unsolicited plan |
| `/quick <task>` | Direct execution on the current model; planning bypass |
| `/plan <task>` | Plan; approval dispatches `implement` on the current branch |
| `/setup <docs, URL, or setup skill references>` | Discover setup choices, prepare a concise custom plan; approval implements locally |
| `/fix <issue>` | Root-cause diagnosis plus Todo repair plan; approval implements |
| `/improve [scope]` | Evidence-first audit; select findings, then plan and separately approve implementation |
| `/build [plan/phases]` | Execute an already approved plan directly |
| `/commit [scope]` | Approve exact files and messages before local commit |
| `/commit:auto [scope]` | Authorize scoped local commits without routine confirmation |
| `/pr [:<base>] [draft]` | Task-scoped commits/push and create or update a GitHub PR |

Planning variants add explicitly approved isolation: `/plan:branch`,
`/plan:worktree`, `/fix:branch`, and `/fix:worktree`. `/fix*` diagnoses on a
temporary `fix/diag-<slug>` branch, deletes it before asking for approval, and
proposes a Markdown Todo checklist. Nothing here publishes, amends, merges,
deploys, or performs destructive cleanup automatically. Full behavior lives in
[`commands/`](commands/).

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
approved plan uses the existing local `implement` handoff or explicitly selected
direct `/build`. Current session agent/model choices are preserved. Use `dev`;
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
Choice confirmation is not implementation approval. Approval sends one `implement`
worker the detailed source-backed plan for all tasks; you can explicitly request
direct execution instead. No plan file, new agent, installs, or project edits are
created during planning. The workflow preserves the selected model/agent and runs
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

CLI permissions stay `prompt` so other profiles keep their safeguards: `explore`
denies shell, edits, Code Mode, delegation, and known secret-bearing reads; `chat`
denies project tools; `implement` cannot recursively delegate. Managed policies and
permission denials remain binding even for `dev`.

## Further reading and checks

- Agents and permissions: [`agents/`](agents/)
- Commands: [`commands/`](commands/)
- Orchestration skills: [`skills/`](skills/) — `plan`, `fix`, `codebase-improve`, `build`, `commit`, `git-isolation`, `pr`
- PR templates: [`skills/pr/references/templates.md`](skills/pr/references/templates.md)
- Shared guidance: [`AGENTS.md`](AGENTS.md)

Run the offline checks from the repository root:

```sh
ruby tests/workflow_test.rb
python3 tests/preflight_test.py
python3 tests/diag_branch_test.py
node --test tests/skill_policy_test.mjs
node --test tests/exploration_contract_test.mjs
node --test tests/workflow_pilot_test.mjs
git diff --check
```

<details>
<summary>Maintenance notes</summary>

Offline checks cover contracts, simulated permission ordering, references, pure
skill-filter behavior, and unchanged-checkout preflight. They do not prove live
model obedience, plugin effectiveness, model-request effort, or UI behavior.
Commands, configuration, and CLI preferences normally reload automatically; use a
fresh session to validate role, permission, or skill changes. Plugin helper changes
outside watched directories can require an explicit reload or service restart, and
rollback should restore only affected files from a protected backup — never reset
Git to simplify it.

Fresh-session cleanup proof remains manual: exercise `/plan*` discovery with an
owned temporary service/file and verify teardown before approval; repeat with
implementation through `/quick` and `/build`/worker handoff. Verify a pre-existing
service/file remains untouched, and a failed or uncertain cleanup is reported
without forceful escalation. Also exercise a failed task and interruption/resume.
Use disposable local fixtures; Docker is optional, not required for offline checks.

`extensions/workflow-pilot/` remains an **inactive** historical offline experiment:
it is not imported by the active plugin or wired into commands, though its tests are
retained.

</details>
