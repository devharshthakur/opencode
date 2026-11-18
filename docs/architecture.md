# Architecture

## Repository map

| Path | Contents |
| :--- | :--- |
| `agents/` | Primary agent and worker definitions |
| `commands/` | Slash-command workflows |
| `skills/` | Workflow and shared policy instructions |
| `plugins/` | OpenCode plugins |
| `opencode.sample.jsonc` | Tracked configuration template |
| `cli.json` | CLI preferences |
| `AGENTS.md` | Shared agent guidance |

## Configuration

`opencode.sample.jsonc` is the tracked config template. Local `opencode.jsonc` and
`service.json` are ignored. Agent frontmatter may pin models independently from
the config. See [setup](setup.md) for initialization and credentials.

## Plugins

| Plugin | Behavior |
| :--- | :--- |
| `caveman-auto.ts` | Attaches the installed `caveman` skill to the first prompt in each session; persists attachment state |
| `command-skills.ts` | Reads a trailing `<!-- opencode:skill <id> -->` marker, attaches that skill, and removes the marker |
| `english-output.ts` | Adds the English-output instruction to model requests, titles, and compaction without duplicate injection |

The skill plugins no-op when a skill is missing and log failures. Remove a plugin
file to disable it. Plugins use the pinned `@opencode/plugin@2.3.0` SDK.

## Shared workflow policy

The primary session owns approval, scope, evidence assessment, and acceptance.
Shared skills define execution, approval handoff, Markdown handoffs, verification,
cleanup, and completion reporting. Command and skill files are authoritative; this
page is an overview.

## Maintenance

- Use a fresh session to validate agent, permission, or skill changes.
- Config and CLI preferences normally reload automatically. Plugin changes outside
  watched directories may need an explicit reload or service restart.
- Static checks do not prove live permissions, model behavior, or plugin behavior.
- This repository has no permanent test suite. Run `git diff --check` for whitespace
  errors and conflict markers.
- Preserve existing files and changes. Roll back only affected files from a
  protected backup; never reset Git to simplify rollback.
