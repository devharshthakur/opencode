---
description: Repair a small, well-defined issue directly
subagent: false
---

Use this command in `dev`, preserving the current session model and agent. Request a
missing issue description. Invocation authorizes a small, scoped repair and its
validation in the current checkout without a separate plan approval. It does not
authorize isolation, staging, commits, publishing, destructive operations, or
unrequested scope expansion. Respect tool permissions and enclosing read-only
workflows.

Inspect the identified lines and relevant context first. Verify the reported issue
instead of assuming the diagnosis. For library, API, or platform behavior, consult
current official documentation using the available documentation tools. Make the
smallest supported repair, run focused checks appropriate to the change, review
the diff, and report results and any unverified behavior.

If the issue needs substantial investigation, the repair is not well-defined, or
the change would grow beyond a quick fix, stop and suggest `/fix` rather than
switching workflows or expanding scope automatically. Clarify missing requirements
and preserve existing changes. Load task-specific skills at their stated triggers.
Before creating disposable resources, load `cleanup`; account for them before
completion or reporting a blocker. Follow `reporting` for the result.

Issue:
$ARGUMENTS
