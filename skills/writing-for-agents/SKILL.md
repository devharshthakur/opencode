---
name: writing-for-agents
description: Design, write, or review instructions, commands, skills, and other documents consumed by agents.
---

# Writing for agents

Produce instructions that make the intended action, authority, and completion
condition clear. Follow the active workflow and its approval gates; instructions
add methods, not permission to edit, delegate, publish, or bypass restrictions.

## Design

1. Identify the audience, trigger, desired outcome, boundaries, and source of
   truth. Read relevant repository guidance and neighboring instructions first.
2. Reuse existing workflows rather than copying their rules. Resolve conflicts
   explicitly; do not weaken a safety or approval gate for brevity.
3. Keep the main path ordered. Put branch-specific detail in a referenced file
   only when the split helps; state exactly when the reader must load it.
4. Specify observable completion and failure conditions, including what to report
   or preserve when proof is unavailable. Distinguish required actions from
   conditional guidance.

## Write and review

- Use precise, actionable language and consistent identifiers. Define exceptions
  alongside the rule they qualify. Avoid vague triggers and contradictory steps.
- Prefer one authoritative location per rule and link to it using a real path.
  Do not embed secrets, machine-specific paths, or claims not supported by evidence.
- For skills, use the repository's skill conventions: a path-derived ID, useful
  description, appropriate invocation mode, and valid relative references.
  Include supporting files only when needed. Use `create-skill` when its workflow
  is explicitly invoked.
- Check the instruction against normal, blocked, and exceptional paths. Ensure
  task-specific methods remain subordinate to permissions, existing work
  preservation, approval, and cleanup.
- Validate metadata and referenced paths, inspect the diff, and report checks and
  any untested behavior. Do not claim that static validation proves model
  compliance.
