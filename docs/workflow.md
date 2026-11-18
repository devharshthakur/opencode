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

`/plan:branch`, `/plan:worktree`, `/fix:branch`, and `/fix:worktree` add explicitly
approved local isolation. Default `/plan` and `/fix` use the current checkout.

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
