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
| `/fix <issue>` | Root-cause diagnosis plus Todo repair plan; approval implements |
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

CLI permissions stay `prompt` so other profiles keep their safeguards: `explore`
denies shell, edits, Code Mode, delegation, and known secret-bearing reads; `chat`
denies project tools; `implement` cannot recursively delegate. Managed policies and
permission denials remain binding even for `dev`.

## Further reading and checks

- Agents and permissions: [`agents/`](agents/)
- Commands: [`commands/`](commands/)
- Orchestration skills: [`skills/`](skills/) — `plan`, `fix`, `build`, `commit`, `git-isolation`, `pr`
- PR templates: [`skills/pr/references/templates.md`](skills/pr/references/templates.md)
- Shared guidance: [`AGENTS.md`](AGENTS.md)

Run the offline checks from the repository root:

```sh
ruby tests/workflow_test.rb
python3 tests/preflight_test.py
python3 tests/diag_branch_test.py
node --test tests/skill_policy_test.mjs
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

`extensions/workflow-pilot/` remains an **inactive** historical offline experiment:
it is not imported by the active plugin or wired into commands, though its tests are
retained.

</details>
