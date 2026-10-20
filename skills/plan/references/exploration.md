# Bounded exploration

Delegate only when the child avoids substantial irrelevant reading in the parent.
For an already-known small file, read it directly. Use the configured `explore`
agent without a model override; no automatic paid/alternative-model fallback.

Supply a self-contained brief, scoped to a decision rather than a file inventory:

```text
Question: the specific implementation/call-flow/test fact needed for the decision.
Scope: relevant areas, exclusions, known symbols and evidence already inspected.
Return: evidence packet: conclusion, ranked paths/symbols and bounded line ranges,
        decisive excerpts, behavior/call flow, counterevidence, checks performed,
        uncertainties, coverage limits, and sufficiency for the requested decision.
Budget: target roughly 500-900 words or less; prioritize decision-relevant facts.
        Stop with partial findings when the requested scope/budget is exhausted.
Constraints: read-only; no shell, tests, edits, installs, or delegation.
```

For multi-step discovery, optionally supply a scoped `todos` snapshot with stable
IDs, content, and status. The explorer recreates it with `todowrite` in its own
session and returns final statuses with its evidence packet; otherwise it creates
its own scoped progress list. This is session metadata, not permission for edits
or execution. Use the status/projection, continuation, fallback, and parent
reconciliation rules in
[session-local todo transfer](../../shared/approval-handoff.md#session-local-todo-transfer);
implementation approval/phase requirements there do not apply to read-only briefs.

Give independent children distinct questions/scopes; disclose unavoidable overlap.
Use concurrent calls or background mode for independent work, within the selected
workflow's budget. A series of foreground calls is sequential, not parallel.
Resume a known child for a targeted follow-up where supported; commission a fresh
independent child when the evidence needs an independent check. Neither route
authorizes implementation, recursive delegation, shell, or broader permissions.

## Evidence packet

The child uses glob/grep and bounded reads; an exhaustive tree is not evidence of
behavior. Include short decisive excerpts only where they support the conclusion
or a selected plan; no file dumps. Cite exact path, symbol, line range, and current
revision when known. Reuse inspected evidence and report omitted/truncated areas.
State checks actually performed and their results; separate source observations,
external-library assumptions, and hypotheses. Missing explicit configuration does
not prove an SDK default is absent. Consult current official documentation through
permitted tools for library-dependent claims, or identify the unresolved lookup.
Confidence is not proof. Include relevant guards/callers and counterevidence.

End with **sufficient for decision** or **specific missing evidence**, naming the
unresolved question and smallest useful lookup. A parent-read recommendation must
identify the question and exact bounded range; **none needed** is a valid answer.

## Parent decision

| Condition | Next action |
| --- | --- |
| Sufficient evidence | Accept the supported facts and synthesize the decision or plan; retain citations and excerpt provenance. |
| Missing evidence | Request a targeted follow-up for the named gap; keep unverified claims provisional. |
| High-risk or conflicting evidence | Request independent bounded verification of the claim and its counterevidence; resolve or explicitly retain uncertainty. |

Read source directly for a named unresolved question that delegation cannot
efficiently resolve, necessary edit context, or risk-relevant review. Required
instructions and already-known small files remain appropriate direct reads.
Explain the purpose briefly when expanding beyond the packet. There is no hard
read cap, automatic reinspection of every citation, or blanket trust of findings.
Verified excerpts may be reused with provenance; refresh only when drift or a
specific gap makes them insufficient. Stop discovery when the decision is supported
or an exact blocker remains. The parent keeps decisions and the implementation
plan, not a second copy of every source. These are instruction-level rules, not
runtime enforcement or a guarantee of token savings.

The selected Muse Spark 1.3 Contributor model may use prompts/completions for
training and is not zero-data-retention. Repository contents sent to it are
subject to that policy. Do not include secrets in briefs; the read restrictions
reduce exposure but are not a complete secret scanner or privacy sandbox.
