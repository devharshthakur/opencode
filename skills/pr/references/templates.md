# PR output

## PR body

```markdown
## Summary
<What changed and why, in one short paragraph.>

## Changes
- <Material behavior, implementation, or usage change.>

## Validation
- <Actual check and result, or explicit reason it was not run.>
```

Keep these headings and order by default for all change types. For fixes, state
the symptom and evidenced cause in `Summary`; label uncertainty. For performance,
report observed before/after measurements and conditions in `Validation`, or
state what's unmeasured. For refactors, name preserved or changed behavior in
`Changes`. Add a section only for distinct material information such as migration
steps or reviewer actions. Follow repository templates and preserve human-written
content on updates. Write normal reviewer-facing prose, not caveman shorthand.

## Chat result

On successful delivery, the entire final reply is the verified PR URL on its own
line. No label, table, recap, or follow-up suggestion. This applies to create,
update, and draft delivery.

If delivery is blocked, report the specific blocker and any next action needed.
Include the verified URL if a PR already exists; never guess one. Published PR
content and verification requirements are unchanged.
