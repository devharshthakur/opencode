---
name: Completion report
description: "Use when finalizing a task or worker result to report acceptance evidence, actual checks, limitations, todo state, cleanup, and the next permitted action."
---

# Completion report

Apply [`cleanup`](../cleanup/SKILL.md) before the final response or worker handoff,
including on blockers. Lead with the result or exact blocker. Report concisely:

- What changed and which acceptance criteria are proved.
- For tracked work, final Todo statuses by ID with evidence and blockers; say if the todo tool was unavailable. The parent updates its list only after assessing a worker's evidence ([todo transfer](../approval-handoff/SKILL.md#session-local-todo-transfer)).
- Actual passing, failing, blocked, and unrun checks, with baseline failures separate.
- Limitations and any pending fresh-session proof for configuration changes.
- Cleanup: resources removed and verified, or none created; retained resources, failures, and safe next steps. Mention pre-existing resources only when relevant.
- Repository, branch, path, retained isolation or backups, staged status, preserved pre-existing work. State plainly when work is uncommitted and local.

Never invent results, hashes, links, or savings. Redact secrets. No automatic
next-phase execution or publishing.

Workers follow the [`agent-handoff` skill](../agent-handoff/SKILL.md) and the
role's compact result template; they never publish. The parent gives the user a
concise summary, not the worker report. Never offer or suggest a PR. After an
explicit `/pr`, use the [PR chat result](../../pr/references/templates.md#chat-result);
on success reply with only the verified PR URL.
