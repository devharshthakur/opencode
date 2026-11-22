# Bounded exploration

Delegate only when the child avoids substantial irrelevant reading in the parent.
Read an already-known small file directly. Use the configured `explore` agent with
no model override and no automatic paid or alternative-model fallback.

Supply a self-contained brief under the [`agent-handoff` skill](agent-handoff/SKILL.md)
using the exploration template: decisions and questions, literal path scope and
exclusions, known evidence, required coverage, and stopping condition. Preflight is
the checklist there. The child gets no shell, tests, edits, installs, or delegation;
no implementation approval is needed. It stops with partial findings when scope or
budget is exhausted and returns the compact
[exploration result](agent-handoff/templates/explore-result.md).

For multi-step discovery, optionally pass a scoped `todos` snapshot; the explorer
recreates it with `todowrite` and returns final statuses (otherwise it keeps its
own list). Rules: [todo transfer](approval-handoff/SKILL.md#session-local-todo-transfer);
its approval and phase requirements do not apply to read-only briefs.

Give independent children distinct questions and scopes; disclose unavoidable
overlap. Launch independent children concurrently (background); consecutive
foreground calls are sequential. Resume a known child for a targeted follow-up, or
use a fresh child for an independent check. Neither authorizes implementation,
recursion, shell, or broader permissions.

## Evidence packet

Role-specific rules on top of the handoff contract's
[evidence requirements](agent-handoff/SKILL.md#evidence-and-parent-reports):

- Keep conclusions, hypotheses, and recommendations separate.
- Use glob/grep and bounded reads; a directory listing is not evidence of behavior.
- Missing explicit configuration does not prove an SDK default is absent. Check
  current official docs for library claims, or name the unresolved lookup.
- Include relevant guards, callers, and counterevidence; report omitted or truncated areas.

State **sufficient for decision** (naming it) or the **specific missing evidence**,
the unresolved question, and the smallest useful lookup. Name each recommended
parent read's question and exact range, or say **none needed**.

## Parent decision

| Condition | Next action |
| --- | --- |
| Sufficient evidence | Accept the supported facts; synthesize the decision or plan; keep citations. |
| Missing evidence | Ask for a targeted follow-up on the named gap; keep claims provisional. |
| High-risk or conflicting evidence | Request independent bounded verification of the claim and counterevidence. |

Read source directly for a named unresolved question, necessary edit context, or
risk-relevant review. Explain briefly when reading beyond the packet. There is no
hard read cap or blanket re-inspection; refresh verified excerpts only on drift or
a specific gap. Stop when the decision is supported or an exact blocker remains.
The parent keeps decisions and the plan, not copies of every source. These are
instruction-level rules, not runtime enforcement or guaranteed savings.

The `explore` model (Muse Spark 1.3 Contributor) may use prompts and completions
for training and is not zero-data-retention. Repository content sent to it is
subject to that policy; keep secrets out of briefs. Read restrictions reduce
exposure but are not a secret scanner or privacy sandbox.
