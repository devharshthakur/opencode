# Skills

Skills add method to a task; they do not add authority. Tool permissions, approval
boundaries, and user limits still apply. Command files and skill files are the
authoritative references.

Skills load at their trigger, at a command-declared stage, or on explicit request.
Several workflow skills set `opencode/autoinvoke: false` so a command must attach them
deliberately.

## Workflow skills

| Skill | Purpose |
| :--- | :--- |
| `plan` | Plan project changes without switching models or implementing before approval |
| `fix` | Investigate in disposable storage and propose evidence-backed repairs |
| `worker` | Authorize task-scoped worker execution directly via explicit invocation |
| `git-isolation` | Prepare explicitly approved local branch or worktree isolation |
| `codebase-improve` | Audit a codebase, prioritize findings, then plan selected work |
| `setup` | Adapt a documented setup to the current project and plan it |

These skills define investigation and approval flow. They do not grant implementation
authority on their own.

## Delivery skills

| Skill | Purpose |
| :--- | :--- |
| `commit` | Create explicitly authorized, scoped local commits under a confirmation policy |
| `pr` | Prepare task-scoped commits and create or update a verified GitHub PR |
| `shared/pr-offer` | Inspect GitHub hosting and make the single optional PR offer after completed work |

Commits, pushes, and pull requests remain separate gates. Delivery skills preserve
unrelated work and stop on ambiguous scope.

## Shared policy skills

| Skill | Purpose |
| :--- | :--- |
| `shared/execution` | Verify authority and checkout, execute one Todo, validate, review the diff |
| `shared/approval-handoff` | Present plans for `approve r<N>`, record state, dispatch authorized workers |
| `shared/agent-handoff` | Prepare and reconcile explore, implement, ui, and verify Markdown handoffs |
| `shared/verification` | Selective read-only review with before/after evidence and freshness |
| `shared/cleanup` | Track disposable resources and verify teardown during success or failure |
| `shared/reporting` | Report acceptance evidence, checks, limitations, and cleanup |

These policies are cross-cutting. Commands and workers reference them rather than
redefining approval, evidence, or cleanup rules.

## Tool skills

| Skill | Purpose |
| :--- | :--- |
| `create-skill` | Design an accurate project-local skill from context and a confirmed design |
| `smoke-test` | Smoke test a web application in the browser through Chrome DevTools MCP |
| `tanstack-cli` | Use the TanStack CLI for scaffolding, add-ons, docs, and version pinning |

## Method skills

| Skill | Purpose |
| :--- | :--- |
| `diagnosing-bugs` | Diagnose a reported bug or regression with reproducible symptoms and hypotheses |
| `tdd` | Apply test-first work with a red-green-refactor method when requested or approved |
| `writing-for-agents` | Design, write, or review instructions consumed by agents |

Method skills load only when their trigger applies. They do not automatically add
tests, dependencies, or workflow gates.

## Chrome DevTools skills

| Skill | Purpose |
| :--- | :--- |
| `chrome-devtools` | Debug, troubleshoot, and automate pages through Chrome DevTools MCP |
| `chrome-devtools-cli` | Automate browsers with Chrome DevTools through shell commands |
| `a11y-debugging` | Audit semantic HTML, ARIA, focus, keyboard navigation, tap targets, and contrast |
| `cookie-debugging` | Inspect cookies, sessions, authentication redirects, and consent behavior |
| `debug-optimize-lcp` | Debug and optimize Largest Contentful Paint |
| `inspect-in-devtools` | Connect to the DevTools UI for interactive inspection and review |
| `memory-leak-debugging` | Capture, compare, and inspect heap snapshots for leaks |
| `troubleshooting` | Resolve Chrome DevTools MCP connection and target failures |

These skills live under `skills/chrome-dev-tools/` and require the corresponding
Chrome DevTools MCP setup where their instructions call for it.

## Skill layout

```text
skills/
├── <skill>/SKILL.md
├── shared/<policy>/SKILL.md
└── chrome-dev-tools/<skill>/SKILL.md
```

Skills may include supporting references next to `SKILL.md`. Load a skill's directory
files only when that skill's instructions call for them.

Browse the full tree under
[`skills/`](https://github.com/devharshthakur/opencode/tree/main/skills) for exact
instructions and dependencies.
