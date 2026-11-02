# Completion report

Apply [cleanup](cleanup.md) before the final response or worker handoff, including
on failures/blockers when execution remains available. Lead with result or exact
blocker. Report:

- What changed and which acceptance criteria are proved.
- For tracked work, final todo statuses by stable ID, completion evidence, and
  blockers/next steps; identify unavailable/denied todo tools. Workers return their
  session-local snapshot; the parent reconciles its own list only after assessing
  evidence under [approval/handoff](approval-handoff.md#session-local-todo-transfer).
- Actual passing/failing/blocked/unrun checks, including baseline failures.
- Relevant limitations and pending fresh-session proof for configuration changes.
- Cleanup verification: resources stopped/removed, or none created; exact retained
  resources, failed/unverified cleanup, and safe next steps. Preserve pre-existing
  resources and mention optional user shutdown only when relevant.
- Repository/branch/path, retained isolation or backup resources, staged status,
  and preserved pre-existing work. Say explicitly when work is uncommitted/local.

Do not invent results, hashes, links, or savings. Keep user-facing output concise;
worker reports preserve identifiers, uncertainty, authority limits, and decisive
evidence without redundant narration. Review is
against both requirements and repository rules; do not force parallel reviews
or extra skills for every task. No automatic next-phase execution or publishing.

## Worker reports and user summaries

Workers use the [Markdown handoff contract](handoff.md) and role-specific result
templates. Return detailed, self-contained reports for the parent: outcome,
criterion-linked evidence, actual checks, relevant decisions, limitations, blockers,
Todo state, cleanup, and continuation. Exploration supplies decision-relevant
evidence; verification retains contradicted/unverified criteria. Avoid activity
diaries and redundant source dumps. The parent makes risk-based targeted reads
instead of routinely repeating sufficient investigation, and gives the user a
concise summary rather than reproducing the worker report. No token savings are
assumed without measurement.

The parent may request clarification in the same attributable worker session.
A report-only follow-up expands existing evidence without new edits,
commands/checks, resources, or dispatch. Preserve prior outcomes and unknowns.
The parent checks identity/structure and assesses proof; successful tool return
is not acceptance.

At completed development/repair/commit tasks, the parent follows
[optional PR delivery](pr-offer.md) for the single plain-text GitHub PR offer and
any later authorization. Worker reports never offer or publish. After authorized
PR delivery, end with the verified PR URL instead of another offer.
