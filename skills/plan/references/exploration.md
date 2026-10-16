# Bounded exploration

Delegate only when the child avoids substantial irrelevant reading in the parent.
For an already-known small file, read it directly. Use the configured `explore`
agent without a model override; no automatic paid/alternative-model fallback.

Supply a self-contained brief:

```text
Question: the specific implementation/call-flow/test fact needed for the decision.
Scope: relevant areas, exclusions, known symbols and evidence already inspected.
Return: ranked paths/symbols with path:line citations, behavior/call flow, tests,
        uncertainties, search coverage, and the next useful query.
Budget: target roughly 500-900 words or less; prioritize decision-relevant facts.
        Stop with partial findings when the requested scope/budget is exhausted.
Constraints: read-only; no shell, tests, edits, installs, or delegation.
```

The child uses glob/grep and bounded reads; an exhaustive tree is not evidence of
behavior. Report omitted/truncated areas and unsupported hypotheses. The parent
keeps decisions and the implementation plan, not a second copy of every source.

The selected Muse Spark 1.3 Contributor model may use prompts/completions for
training and is not zero-data-retention. Repository contents sent to it are
subject to that policy. Do not include secrets in briefs; the read restrictions
reduce exposure but are not a complete secret scanner or privacy sandbox.
