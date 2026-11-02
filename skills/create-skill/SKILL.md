---
name: Create skill
description: Guide creation of an accurate project-local OpenCode skill from supplied context, questions, and a confirmed design
metadata:
  opencode/autoinvoke: false
---

# Create skill

Create or safely extend one OpenCode skill for the active project. Preserve the
current model. Invocation starts the task but does not approve a design. Treat
supplied material as source input, then confirm the proposed skill before writing.

## 1. Read the request and target

Read attached files, pasted text, URLs, and the task brief as source material. Also
read the active project's instructions (`AGENTS.md`, `CLAUDE.md` when present),
existing `.opencode/` content, and nearby skill conventions. Distinguish documented
facts from choices only the user can make. Do not send credentials or private
project content to external documentation tools.

Find the nearest project-level `.opencode/skills/` directory. If none exists, use
the repository/project root. If the project root or target location is ambiguous,
ask. Follow the project's existing skill layout; otherwise use directory form:

```text
<project>/.opencode/skills/<id>/SKILL.md
```

Use `~/.config/opencode/skills/<id>/` only when the user explicitly asks for a
global skill. If a skill already exists at the target, read all of its files and
plan an additive update instead of overwriting it.

Completion: the target scope and directory are known, supplied material has been
read, and any existing target content is inspected.

## 2. Resolve intent

If the brief is missing or too vague to identify an outcome, ask what the skill
should do and when it should be used before proposing an ID or files. Then ask only
for information that changes the skill's content. Group related questions and use
the `question` tool when available. Cover:

- the outcome: what the skill makes the agent do;
- the triggers: tasks or phrases that should make it relevant;
- project facts: commands, paths, APIs, versions, and conventions it must use;
- invocation: model-invoked (description advertised) or command/reference-only
  (`metadata.opencode/autoinvoke: false`, or the project's equivalent);
- supporting files: references, scripts, or templates genuinely needed.

Use supplied material first; do not ask the user to repeat facts already present.
Resolve conflicts between sources and surface missing essentials. Ask dependent
questions only after their prerequisites are settled. Recommend defaults with
reasons. Completion: every material decision is answered or explicitly delegated,
and no invented project fact remains.

## 3. Design and confirm

Choose a unique lowercase kebab-case ID of 1–64 characters; the directory name is
the ID. The frontmatter `name` is a human display label. Keep `SKILL.md` for ordered
steps and completion criteria. Move branch-specific detail into `references/`,
deterministic helpers into `scripts/`, and reusable output into `templates/` only
when they earn their place. Write relative paths from the skill directory. A skill
adds methods, not authority: do not write instructions that bypass approvals,
permissions, or safety gates; do not include secrets or machine-specific paths.

Write the description for its audience. A model-invoked description names concrete
trigger tasks or phrases. A command/reference-only description is a concise human
summary. Use the project's existing frontmatter convention; otherwise use
`metadata.opencode/autoinvoke: false` for hidden skills and omit it for
model-invoked skills. Do not set conflicting invocation fields.

Present a compact **skill design plan**:

- target path and ID;
- invocation mode and frontmatter;
- `SKILL.md` outline: sections, steps, and completion criteria;
- supporting files and why;
- validation checks.

For an existing target, show the current files and the proposed additive changes.
Never overwrite or delete existing files without explicit approval. End with:

> Reply `create` to write these files, or describe changes.

Completion: the user has confirmed the exact design. Changed files, scope, or
invocation mode require renewed confirmation.

## 4. Create

Create only the confirmed directory and files. Preserve existing work and unrelated
files. Write frontmatter with non-empty `name` and `description`; add the hidden
invocation field only when chosen. Do not add command-only fields such as
`template`. Make every referenced path real. Do not create a command, change
OpenCode configuration, install packages, create branches, commit, or publish
unless separately authorized. Completion: the approved files exist and no
unapproved path changed.

## 5. Validate and report

Check:

- the file is exactly `SKILL.md`, under a directory matching the ID;
- frontmatter parses and `name` plus `description` are non-empty;
- the description matches the chosen invocation mode and names concrete triggers
  when model-invoked;
- every relative reference resolves; syntax-check created scripts with the
  appropriate non-executing check (`bash -n`, `node --check`, or equivalent); do
  not run side-effecting scripts;
- no secrets, generated artifacts, or unrelated edits;
- project permission restrictions are reported, not bypassed by editing
  configuration;
- `git diff --check` passes in a Git checkout.

Report created or updated paths, the skill ID, invocation mode, and actual checks.
State that OpenCode reloads skills automatically, but a fresh session mentioning
`@skill-id` is the reliable discovery check. Static checks do not prove model
obedience. No commit or publish.
