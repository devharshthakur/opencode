# Fix output

Use the matching Markdown layout in chat. Keep labels and order; replace every
placeholder and omit only lines marked optional when inapplicable. Use short
sentences and avoid repeating evidence, status, or next steps. Caveman governs
chat phrasing, not approval wording. Warnings, clarifying questions, and
material evidence may need more space. Do not shrink away required facts.
For routine progress, use one line per phase change; include required resource
checkpoints and permission requests when due.

## Approval plan

```markdown
## Plan: <stable title>
Revision: <N>

Issue: <actual vs expected behavior and impact>
Cause: <confirmed cause and decisive evidence>
Scope: <proposed behavior, exclusions, and what stays unchanged>
Execution: <checkout/isolation, local base, execution mode, preservation and operation limits>
Diagnostics: <retained path, state, material omissions, service status and disposal point; or none created>
Decisions and risks: <material choices, alternatives, risks or rollback, if applicable>

- [ ] T1: <outcome; prerequisites if any; observable acceptance>
- [ ] T2: <repeat only for additional Todos>

Validation: <planned checks and known limits>

<exact approval line from approval-handoff for this revision and isolation>
```

`Decisions and risks` is optional if none affect approval. Use the
[approval policy](../../shared/approval-handoff/SKILL.md#final-plan-approval)
for the final line. Do not present this layout as ready for approval when the
cause or a consequential choice is unresolved.

## Blocked diagnosis or repair

```markdown
Blocked: <precise blocker and phase>
Evidence: <decisive observation and what remains unproved>
State: <affected Todo/work state, retained evidence/resources and original checkout status>
Next: <smallest safe experiment, decision, or permission needed>
```

## Repair result

```markdown
Fixed: <observable behavior restored>
Checks: <actual results and material failures, limitations, or unrun checks>
State: <revision/Todo status, checkout and delivery state; preserved work if relevant>
Cleanup: <verified disposal, none created, or exact retained resources and next action>
```

If eligible, append only the exact
[PR offer](../../shared/pr-offer/SKILL.md#offer-once-at-completion) as the final line.
