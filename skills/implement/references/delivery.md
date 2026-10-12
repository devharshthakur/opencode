# Delivery (push, PR, CI)

Conditional detail for the delivery stage of `implement`. Use only when the invoking command
authorizes the specific operation and user limits permit it. `commit` owns commit
mechanics and `git-isolation` owns isolation; do not restate them here.

## Push

- Recheck limits, required local proof, authentication, push remote, task branch, remote tip, the full
  diff and commits against base, and the absence of unrelated work or secrets. Stop on unexpected
  remote changes.
- Push normally to the verified task branch, setting upstream when needed; verify its remote SHA
  matches the intended local head. Never push to the base and never force-push. A rejection is not
  permission to rewrite history.
- Published history is append-only: organize commits before the first push and use follow-up commits
  for repairs, not routine amend/rebase/force-push.

## Pull request

- Recheck task/head PRs. Update only an attributable existing PR; otherwise create one with verified
  repository, head, and base. Change an existing base only when explicitly requested. Avoid empty or
  duplicate PRs.
- Explain the problem, solution, actual checks, and limitations concisely. Reference issues with
  `Refs #<number>` or verified URLs, never auto-closing keywords. Leave issue state unchanged absent a
  separate, confirmed request.
- Verify the PR URL, head SHA, base, and included commits, and record the URL immediately so later
  failures still end with it.

## CI

- Check CI for the current head SHA. Unless the user overrides, bound task-related repairs to three
  rounds and total CI waiting to 15 minutes, counting rounds and time across retries and resumption.
- Append fixes, rerun local gates, push normally, and check the new head. Never reset the budget or
  rerun unrelated failures indefinitely.
- Each CI repair must pass the main workflow's local validation gate before its follow-up push.
- Report pending, failed, unavailable, or approval-gated CI honestly. Budget exhaustion or unavailable
  CI ends waiting, not proof of success.
