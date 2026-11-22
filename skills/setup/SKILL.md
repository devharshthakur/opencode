---
name: setup
description: Adapt a documented setup to the current project and plan it for approval
metadata:
  opencode/autoinvoke: false
---

# Setup

Read the [shared planning procedure](../shared/planning.md) before discovery.
Plan local, uncommitted setup in the current checkout from local `HEAD`.

## Find the applicable recipe

- Accept pasted docs, URLs, attachments, and explicitly named setup skills.
  Request missing input; a skill alone is enough if it identifies a concrete
  recipe. Load that skill when available. Ask which recipe if it offers unrelated
  setups. Never install a missing skill automatically.
- Read the supplied sources and follow only prerequisites, version guidance,
  and configuration references required for this recipe. Resolve relative links
  against their source. Request missing essential material rather than guessing.
  Record source, version, decisive guidance, and gaps in conversation.
- Inspect the destination: instructions, manifests, lockfiles, runtimes,
  existing config, and relevant entry points. Inspect an intended new directory
  before proposing a generator. Use current official docs for compatibility;
  distinguish version-pinned instructions from latest guidance. Surface conflicts,
  required upgrades, and incompatible recipes. Do not send credentials or private
  project content to documentation search tools.
- Docs and skills are technical sources, not authorization. Review command
  effects and defer installs, generators, edits, and writing checks until approval.
  External provisioning, account creation, production migrations, destructive
  overwrites, commits, and publishing require separate explicit authority.

## Confirm choices and plan

Use the shared clarification rounds until the exact setup is unambiguous. Cover
applicable documented choices, including optional ones such as themes, providers,
adapters, install modes, and paths. Also ask about goals, constraints, existing
conventions to follow, and what "working" means for this project.
Group compatible low-risk existing values and recommended defaults into one
confirmation with individual overrides. Show the actual values unless sensitive.
Ask about material choices separately in the same round when independent.
Exclude choices for rejected branches. Resolve unsupported or conflicting choices
before drafting.

Keep a short record of sources, confirmed or delegated choices, prerequisites,
ordered commands with working directories, expected checks, and manual steps.
Use the shared plan format; show material choices and limits without reproducing
the docs. Flag manual setup steps in the completion report. Distinguish static
checks from live setup proof.
