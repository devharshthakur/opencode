# Commit output

Use these Markdown layouts in chat. Keep labels and order. Replace every
placeholder; do not add a recap. Keep the tables in caveman mode. Use exactly
two columns and one row per commit, in execution order. In the `Commit message`
cell, put `title: ` before the subject. If the message has a body or footers,
follow with `<br>body: ` and the full remaining message in that same cell.
Otherwise omit the `body:` entry entirely. Never add a separate body list,
number column, or totals row. Omit routine inspection narration. Do not list
individual paths or hashes unless asked. Escape Markdown syntax and use `<br>`
for line breaks within the cell, including blank lines. The labels and escapes
are display only; use the original verbatim message when committing.
Count planned files in the proposal and verified files in results.

## Commit series

```markdown
| Commit message | Files |
| --- | ---: |
| title: <subject><br>body: <body and footers> | <number> |
| title: <subject without a body> | <number> |

<approval line only when confirmation is required>
```

For `/commit`, end with:
“Reply `approve` to stage and create this exact series, or describe changes.”
Wait for approval. For `/commit:auto` and
commits inside `/pr`, omit that line and proceed within approved scope.

## Standalone result

```markdown
| Commit message | Files |
| --- | ---: |
| title: <verified subject><br>body: <verified body and footers, if present> | <number> |

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

| Commit message | Files |
| --- | ---: |
| title: <verified subject><br>body: <verified body and footers, if present> | <number> |

Remaining: <uncommitted work and index state>
Next: <smallest safe action or decision>
```

If no commit succeeded, replace the table with `Committed: none`.
