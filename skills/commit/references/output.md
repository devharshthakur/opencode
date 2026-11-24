# Commit output

Use these Markdown layouts in chat. Keep labels and order. Replace every
placeholder; do not add a recap. Keep the tables in caveman mode. Use exactly
three columns: `ID`, `Commit message`, and `Files`. Use one row per commit in
execution order, with sequential IDs starting at 1. For a title-only commit,
show only the subject in the `Commit message` cell, without a label. If the
message has a body or footers, show `title: ` before the subject, then
`<br>description: ` and the full remaining message in the same cell.
Never add a separate description list or totals row. Omit routine inspection
narration. Do not list individual paths or hashes unless asked. Escape Markdown syntax and use `<br>`
for line breaks within the cell, including blank lines. The labels and escapes
are display only; use the original verbatim message when committing.
Count planned files in the proposal and verified files in results.

## Commit series

```markdown
| ID | Commit message | Files |
| ---: | --- | ---: |
| 1 | title: <subject><br>description: <body and footers> | <number> |
| 2 | <subject without a body or footers> | <number> |

<approval line only when confirmation is required>
```

For `/commit`, end with the
[approval gate prompt](../../shared/approval-handoff/SKILL.md#approval-gate-protocol):

```text
Gate: commit c<N>
Ready to stage and create this exact series, without amend, push, or PR.
Reply `approve c<N>` (or `/approve`) to proceed, or describe changes.
```

Substitute the series ID (`c1` first; increment on any change to paths, grouping, or
messages). Wait for approval and follow the protocol's resolution rules. For `/commit:auto` and
commits inside `/pr`, omit that line and proceed within approved scope.

## Standalone result

```markdown
| ID | Commit message | Files |
| ---: | --- | ---: |
| 1 | title: <verified subject><br>description: <verified body and footers> | <number> |
| 2 | <verified subject without a body or footers> | <number> |

Checks: <actual validation or not run>
Remaining: <relevant changes and index status, or clean>
```

Use one row per verified commit. For an empty scope, say `Nothing to
commit.` and stop. Append only the exact
[PR offer](../../shared/pr-offer/SKILL.md#offer-once-at-completion) when eligible.
Inside `/pr`, omit this result and hand verified commit evidence to the PR
workflow; use its result template once.

## Standalone blocker

```markdown
Blocked: <precise blocker>

| ID | Commit message | Files |
| ---: | --- | ---: |
| 1 | title: <verified subject><br>description: <verified body and footers> | <number> |
| 2 | <verified subject without a body or footers> | <number> |

Remaining: <uncommitted work and index state>
Next: <smallest safe action or decision>
```

If no commit succeeded, replace the table with `Committed: none`.
