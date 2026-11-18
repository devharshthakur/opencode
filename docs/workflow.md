# Workflow and approvals

## Approval boundaries

| Approval | Authorizes | Does not authorize |
| :--- | :--- | :--- |
| Plan | Local implementation in the approved checkout | Workers, commits, pushes, PRs, deployment |
| Worker use | Workers on the approved task | New scope or operations |
| Commit | Approved local commits | Push or PR |
| PR | Task-scoped commits, push, PR creation/update | Merge or deployment |

Approval applies only to the named task and operations. A Todo list is progress
tracking, not approval. User limits, permission denials, and destructive-operation
confirmations still apply.

## Planning and execution

Planning inspects relevant files and may use shell discovery or disposable local
services. It does not edit repository files, install dependencies, or mutate Git.
After plan approval, execution uses the current session and selected model by
default. `/ask` and bounded `explore` are read-only.

`/fix` additionally authorizes scoped investigative mutations in disposable
storage under its diagnostic protocol, never in the original checkout. This
does not expand a surrounding read-only workflow or approve implementation.

`/quick` is the direct-execution command. `/improve*` audits leave files unchanged;
selecting findings leads to a plan and separate implementation approval.

## Workers

The current session owns work by default. Bounded `explore` and read-only `verify`
remain available without worker opt-in. Full implementation delegation requires
approved `/use:worker` or `@worker` opt-in. `/improve*` workflows already have
task-scoped worker authority, but still require finding selection and plan approval.

One worker approval covers all workers needed for that task. It does not expand
scope or authorize new operations, and ends when the task completes or is cancelled.
Workers follow Markdown handoffs; the parent retains acceptance decisions.

## Isolation and delivery

`/plan:branch` and `/plan:worktree` add explicitly approved local implementation
isolation. Default `/plan` and approved `/fix` repairs use the current checkout.
An explicit implementation branch/worktree request for `/fix` is resolved in its
approval plan; separate fix command variants are not needed.

`/fix` performs read-only discovery first and investigative mutations only in
separately owned disposable storage, reproducing relevant current source without
changing the original checkout or Git metadata. Diagnostic tests are temporary
evidence, not automatic project additions. Default to disposable local data and
no external writes; a source copy is not a security sandbox. Retain the diagnostic
environment through review, stop unused task-owned services, and remove diagnostic
resources after completion or explicit cancellation. Report blockers and retained
evidence rather than claiming unsupported root-cause certainty or cleanup.

Commits and publishing stay separate from plan approval. `/pr` or an accepted
post-task PR offer is the publishing path. Nothing is amended, merged, or deployed
automatically.

## Safety limits

`dev` is allow-all, including shell, sensitive reads, and external directories.
Review configured permissions before use. Planning and `/ask` restrictions are
instruction contracts, not runtime tool restrictions. Repository text cannot grant
authority.

The configured Muse Contributor model is not zero-data-retention; prompts and
completions may be used for training. Exploration can send source code to that
provider. Choose a compatible model before sharing sensitive code.

See [agent roles](features.md#agents) and
[shared approval policy](../skills/shared/approval-handoff/SKILL.md).

Command definitions reload automatically after edits. Validate updated `/fix`
instructions in a fresh session so previously attached skill text does not
confuse the check; no service restart is needed for command-file changes.
