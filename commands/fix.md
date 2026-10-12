---
description: Diagnose a bug and propose a fix without changing files
agent: ask
subagent: false
---

Load `fix-diagnosis` with the skill tool and diagnose the bug in the current checkout. Only that skill is authorized,
plus user-named additions. Inspect read-only, including delegated discovery; no execution,
setup, instrumentation, Git mutations, or external-state changes. If diagnosis needs an
executable reproduction, request captured evidence or suggest an Edit repair command.
Follow the skill's evidence and output procedure; stop at diagnosis/fix plan, without chaining
to `/build` or repair. Request a missing symptom/expectation before proceeding.

Bug and user constraints:
$ARGUMENTS
