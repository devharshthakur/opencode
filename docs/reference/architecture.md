# Architecture

## Repository map

| Path | Contents |
| :--- | :--- |
| `agents/` | Primary agent and worker definitions |
| `commands/` | Slash-command workflows |
| `skills/` | Workflow, delivery, shared-policy, tool, and Chrome DevTools skills |
| `plugins/` | OpenCode plugins |
| `docs/` | Documentation source and VitePress configuration |
| `.github/workflows/` | GitHub Pages deployment |
| `opencode.sample.jsonc` | Tracked configuration template |
| `cli.json` | CLI preferences |
| `AGENTS.md` | Shared agent guidance |
| `package.json` | Documentation build scripts and plugin SDK dependency |
| `LICENSE` | MIT license |

## Configuration

`opencode.sample.jsonc` is the tracked config template. Local `opencode.jsonc` and
`service.json` are ignored. Agent models are set under `agents` in the config; agent
files do not pin models. See [Getting Started](../guide/getting-started.md) for initialization and
credentials.

Configuration changes normally reload automatically. Plugin changes outside watched
directories may need an explicit reload or service restart.

## Plugins

| Plugin | Behavior |
| :--- | :--- |
| `caveman-auto.ts` | Attaches the installed `caveman` skill once per session or compaction cycle, persists attachment state, and requests compaction near 180k context tokens |
| `command-skills.ts` | Reads a trailing `<!-- opencode:skill <id> -->` marker, attaches that skill, and removes the marker |
| `english-output.ts` | Adds the English-output instruction to model requests, titles, and compaction without duplicate injection |

The skill plugins no-op when a skill is missing and log failures. Remove a plugin
file to disable it. Plugins use the pinned `@opencode/plugin@2.3.2` SDK.

## Documentation site

The documentation is a VitePress site with Markdown sources under `docs/`.

| Item | Location |
| :--- | :--- |
| Site config | `docs/.vitepress/config.mts` |
| Home page | `docs/index.md` |
| Guide | `docs/guide/` |
| Reference | `docs/reference/` |
| Build output | `docs/.vitepress/dist` (ignored) |
| Cache | `docs/.vitepress/cache` (ignored) |
| Deployment | `.github/workflows/deploy-docs.yml` |

The site uses `base: '/opencode/'` for GitHub Pages. Local commands:

```sh
npm run docs:dev
npm run docs:build
npm run docs:preview
```

Pushes to `main` and manual dispatches build and deploy the site through GitHub
Pages. Before the first deployment, enable GitHub Pages with GitHub Actions as the
source in the repository settings. Documentation links to repository files outside
`docs/` use full GitHub URLs so they work on both GitHub and the published site.

## Shared workflow policy

The primary session owns approval, scope, evidence assessment, and acceptance.
Shared skills define execution, approval handoff, Markdown handoffs, verification,
cleanup, and completion reporting.

`/plan` and `/setup` attach separate skills and share the
[planning procedure](https://github.com/devharshthakur/opencode/blob/main/skills/shared/planning.md).
Command and skill files are authoritative; this page is an overview.

## Maintenance

- Use a fresh session to validate agent, permission, or skill changes.
- Check the `agents` models in your config and the agent permission profiles before relying on them.
- Static checks do not prove live permissions, model behavior, or plugin behavior.
- This repository has no permanent test suite. Run `git diff --check` for whitespace
  errors and conflict markers, and `npm run docs:build` after documentation changes.
- Preserve existing files and changes. Roll back only affected files from a
  protected backup; never reset Git to simplify rollback.

## Further reading

- [Agents](./agents.md) for roles, models, and access.
- [Commands](./commands.md) for workflow entry points.
- [Skills](./skills.md) for methods and shared policies.
