# Agents

OpenCode has two primary agents and four specialist workers. Agent selection and
model selection are independent; commands preserve the current session model.

## Primary agents

| Agent | Purpose | Access |
| :--- | :--- | :--- |
| `dev` | Everyday project questions, direct development, and command workflows | Allow-all; configured permissions still apply |
| `chat` | General conversation and external research | No project tools; web, skills, questions, and todos only |

Switch between `dev` and `chat` with <kbd>Shift</kbd> + <kbd>Tab</kbd>. `dev` is the
default. Use `chat` when you want conversation without project inspection or shell
access.

## Workers

Workers are subagents, not session modes. They run on their configured models, which
may differ from the session model.

| Worker | Purpose | Access |
| :--- | :--- | :--- |
| `explore` | Bounded read-only discovery of implementation, callers, and tests | Read-only; no shell, edits, or secret-bearing config |
| `implement` | Execute an approved implementation handoff and return validation evidence | Scoped edits and checks; no recursion, browser, or delegation |
| `ui` | Build UI components, pages, and styles that match existing conventions | Read, edit, shell, web, skills, image generation; sensitive files denied |
| `verify` | Independently review actual approved changes | Read-only; no shell, edits, tests, or delegation |

`explore` and `verify` report evidence but do not change files. `implement` returns a
self-contained result for the parent to accept. `ui` follows existing design
conventions and handles visual implementation.

## Model pins

| Agent | Model |
| :--- | :--- |
| `implement` | `opencode-go/deepseek-v4.1-flash#max` |
| `ui` | `opencode-go/gpt-6-luna#high` |
| Others | Session or configuration default |

Model pins live in agent frontmatter and override `agents.<id>.model` from the
configuration. Use `/models` to choose the session model. Check the pins before
using `implement` or `ui`, and edit them if you cannot access those models.

> [!NOTE]
> The configured Muse Contributor model is not zero-data-retention. Prompts and
> completions may be used for training. Choose a compatible model before sharing
> sensitive code.

## Permission profiles

The checked-in permission lists are the source of truth. The main differences:

| Agent | Shell | Edits | Delegation | Sensitive files |
| :--- | :--- | :--- | :--- | :--- |
| `dev` | Allow-all | Allow-all | Workers per policy | Allow-all |
| `chat` | Denied | Denied | Denied | Denied |
| `explore` | Denied | Denied | Denied | Denied |
| `implement` | Allowed within task | Allowed within task | Denied | Config defaults |
| `ui` | Allowed | Allowed | Denied | Common secrets denied |
| `verify` | Denied | Denied | Denied | Common secrets denied |

Permission checks supplement, but do not replace, approval and ownership rules.
Static frontmatter does not prove live runtime behavior.

## Choosing an agent

| Situation | Agent |
| :--- | :--- |
| General conversation or web research | `chat` |
| Project work, commands, or direct execution | `dev` |
| Need bounded discovery before deciding | `explore` |
| Have an approved implementation brief | `implement` |
| Have an approved UI task | `ui` |
| Need a read-only independent review | `verify` |

See the agent definitions under
[`agents/`](https://github.com/devharshthakur/opencode/tree/main/agents) for the
complete permission lists.
