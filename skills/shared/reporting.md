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

Do not invent results, hashes, links, or savings. Keep worker output concise but
preserve identifiers, uncertainty, authority limits, and evidence. Review is
against both requirements and repository rules; do not force parallel reviews
or extra skills for every task. No automatic next-phase execution or publishing.

## Worker receipts and requested reports

Workers use the [JSON handoff contract](handoff.md). Default output is a compact
receipt (exploration retains its decisive evidence packet), with identifiers,
acceptance/check/cleanup proof, uncertainty, and blockers. No default narrative
`detailed_report`. The parent may request it initially or later in the same
attributable worker session. A report-only continuation expands existing evidence
without new edits, commands/checks, resources, or dispatch. The parent validates
identity/structure and assesses proof; successful tool return is not acceptance.

At completed development/repair/commit tasks, the parent follows
[optional PR delivery](pr-offer.md) for the single plain-text GitHub PR offer and
any later authorization. Worker reports never offer or publish. After authorized
PR delivery, end with the verified PR URL instead of another offer.
