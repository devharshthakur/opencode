---
description: Create a project-local OpenCode skill from supplied context and a confirmed design
subagent: false
---

Load `create-skill` using the skill tool. Execute directly in `dev` with the current session model; no worker. If invoked in `chat`, ask the user to switch to `dev` without broadening permissions. Invocation starts a skill-creation task and authorizes local creation or update only after the user confirms the skill design; it does not authorize commits, publishing, installs, or changes outside the approved skill. Default target: the active project's `.opencode/skills/<id>/SKILL.md`; use the global skills directory only when explicitly requested. Read any attached or pasted context before asking questions. Preserve existing work and ask before replacing or merging an existing skill. Follow the helper's discovery, design, creation, and validation procedure.

Request and supplied context:
$ARGUMENTS
