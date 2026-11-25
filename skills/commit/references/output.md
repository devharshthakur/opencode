# Commit output

## Mandatory table

Every commit proposal, standalone result, and standalone blocker MUST open with the
commit table below, for every caller and every display request. Tables are required
even in caveman mode and even when the user does not ask for one.

Invalid output, which must be rewritten before sending:

- prose, bullet lists, or per-commit code blocks in place of table rows;
- a commit table with columns other than `ID`, `Type`, `Subject`, `Body`, `Files`;
- branch, merge, push/PR, check, or remaining-state details written as prose
  instead of Item/Value rows.

## Commit table

Columns, exactly in this order:

- `ID`: sequential from 1 in execution order.
- `Type`: the `type(scope)` prefix exactly as in the verified message, with `!` if
  present (for example `feat`, `chore(config)`).
- `Subject`: the description after the prefix, verbatim, without a trailing period.
- `Body`: the body and footers, with `<br>` for each line break and each blank line.
  Use `-` when the message has no body or footers.
- `Files`: planned file count in a proposal; verified file count in a result.

Do not list individual paths or hashes unless asked. Escape Markdown syntax inside
cells. The table is display only: commit the original verbatim message, one `-m` per
paragraph.

## Item/Value table

Use this table after the commit table, with only the rows that apply:

- `Branch`, `Merge`, `Push / PR` in a proposal (`Push / PR` is `none` unless authorized).
- `Checks`, `Remaining` in a standalone result.
- `Blocked`, `Remaining`, `Next` in a standalone blocker.
- `Committed` with value `none` when no commit succeeded.

No totals row and no separate description list.

## Commit series (proposal)

````markdown
| ID | Type | Subject | Body | Files |
| ---: | --- | --- | --- | ---: |
| 1 | <type(scope)> | <subject> | <body and footers with <br>, or -> | <planned number> |
| 2 | <type(scope)> | <subject> | - | <planned number> |

| Item | Value |
| --- | --- |
| Branch | <name, when requested> |
| Merge | <method and target, when requested> |
| Push / PR | none |

Gate: commit c<N>
Ready to stage and create this exact series, without amend, push, or PR.
Reply `approve c<N>` (or `/approve`) to proceed, or describe changes.
````

The `Gate` block is plain text per the
[approval gate protocol](../../shared/approval-handoff/SKILL.md#approval-gate-protocol).
Substitute the series ID (`c1` first; increment on any change to paths, grouping, or
messages). For `/commit:auto` and commits inside `/pr`, omit the gate block and proceed
within approved scope.

## Standalone result

````markdown
| ID | Type | Subject | Body | Files |
| ---: | --- | --- | --- | ---: |
| 1 | <verified type(scope)> | <verified subject> | <verified body and footers, or -> | <verified number> |

| Item | Value |
| --- | --- |
| Checks | <actual validation, or not run> |
| Remaining | <relevant changes and index status, or clean> |
````

Use one row per verified commit. For an empty scope, output only an Item/Value table
with the row `Result | Nothing to commit.`, then stop.
Append nothing after the tables. Inside `/pr`, omit this result and hand verified
commit evidence to the PR workflow; use its result template once.

## Standalone blocker

````markdown
| ID | Type | Subject | Body | Files |
| ---: | --- | --- | --- | ---: |
| 1 | <verified type(scope)> | <verified subject> | <verified body and footers, or -> | <verified number> |

| Item | Value |
| --- | --- |
| Blocked | <precise blocker> |
| Remaining | <uncommitted work and index state> |
| Next | <smallest safe action or decision> |
````

If no commit succeeded, omit the commit table and show only the Item/Value table with
`Committed | none` as its first row, followed by `Blocked`, `Remaining`, and `Next`.
