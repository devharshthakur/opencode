---
name: tanstack-cli
description: Use for TanStack CLI (`tanstack create`, `add`, `add-on`, `template`, `libraries`, `doc`, `search-docs`, `ecosystem`, `pin-versions`), scaffolding or extending TanStack apps, authoring add-ons/templates, and fetching current TanStack documentation.
---

# TanStack CLI

Use this skill for TanStack CLI workflows and whenever an implementation relies
on current TanStack library APIs. The CLI provides project scaffolding,
add-on/template management, a live library catalog, documentation search and
retrieval, and ecosystem recommendations. Treat live CLI output and the
official documentation as the source of truth; do not infer current IDs,
options, compatibility, or API behavior from memory.

## Working rules

- Read the target project's instructions, package manager, configuration, and
  current files before running a command that changes it.
- Discover add-on IDs and options before using them. Do not invent IDs or
  presume an add-on supports a framework or project mode.
- `create`, `add`, `add-on compile`, `template compile`, and `pin-versions`
  write project files. Check the target path and intended changes first; avoid
  overwriting non-empty directories or forcing add-on conflicts without
  explicit user intent.
- Prefer JSON output for catalog, search, and automation commands. Parse the
  returned data instead of relying on output order or remembered names.
- Use the project's package manager for generated-project tasks. Do not run
  installs or alter package versions unless the requested workflow calls for
  it.
- After scaffolding, inspect the generated files, `.cta.json`, package scripts,
  and `.env.example`; run the narrowest relevant check the project provides.

## Run the CLI

Use the globally installed `tanstack` executable when available. Otherwise,
use the package without adding it to the project:

```bash
pnpm dlx @tanstack/cli <command>
```

The official docs also show `npx @tanstack/cli <command>`. These are alternate
ways to invoke the CLI; do not add `@tanstack/cli` as a project dependency just
to use it. The CLI troubleshooting docs state Node.js 18+ is required.

## Fetch current TanStack documentation

Always fetch docs before writing or changing TanStack API usage. First discover
the exact library ID, search for the topic, then fetch the result page. Do not
guess document paths.

```bash
# 1. Find current library IDs, documentation URLs, and versions
pnpm dlx @tanstack/cli libraries --json

# 2. Search the correct library; use framework when relevant
pnpm dlx @tanstack/cli search-docs loaders \
  --library router --framework react --limit 10 --json

# 3. Fetch a known page, or use the exact path returned by your search
pnpm dlx @tanstack/cli doc router framework/react/guide/data-loading --json

# 4. For another documented version, request that version explicitly
pnpm dlx @tanstack/cli doc query framework/react/overview \
  --docs-version v5 --json
```

For a search result URL such as
`https://tanstack.com/start/latest/docs/framework/react/guide/data-loading#...`,
pass the library catalog ID and path `framework/react/guide/data-loading` to
`doc`; remove the URL origin, the version/docs prefix, and any `#anchor`.
Follow the actual URL returned by search rather than copying the example path.
The CLI accepts `latest` by default; choose `--docs-version` only when the
project targets a different documented major/version.

### TanStack CLI's own docs

The CLI reference itself is library ID `cli`. Its current documented pages are:

| Page | Path passed to `doc cli ...` |
| --- | --- |
| Overview | `overview` |
| Quick start | `quick-start` |
| CLI reference | `cli-reference` |
| MCP migration | `mcp-migration` |
| Add-ons catalog | `add-ons` |
| Templates | `templates` |
| Creating add-ons | `creating-add-ons` |
| Examples | `examples` |
| Troubleshooting | `troubleshooting` |

Fetch any page with, for example:

```bash
pnpm dlx @tanstack/cli doc cli cli-reference --json
```

To refresh every documented CLI page in one session, run the following
read-only loop:

```bash
for page in overview quick-start cli-reference mcp-migration add-ons templates creating-add-ons examples troubleshooting; do
  pnpm dlx @tanstack/cli doc cli "$page" --json
done
```

Search results include page URLs and excerpts. Use `--limit` from 1 to 50 to
control result count; `--framework` and `--library` narrow searches. Add
`--json` for machine-readable output. If the CLI or network is unavailable,
use the matching official `https://tanstack.com/<library>/latest/docs/...`
page via the available web-fetch tool; state when results could not be checked
live.

## Command reference

| Command | Use |
| --- | --- |
| `create [project-name] [options]` | Scaffold a TanStack Start or Router project; inspect `create --help` and the live docs for current options. |
| `add [add-on...]` | Add catalog add-ons to the current project. |
| `add-on init` / `compile` / `dev` | Extract, build, or watch a custom add-on. |
| `template init` / `compile` | Initialize or compile a reusable project template. |
| `libraries [--group ...] [--json]` | List the TanStack library catalog. |
| `search-docs <query> [options]` | Search current docs. |
| `doc <library> <path> [options]` | Fetch one documentation page. |
| `ecosystem [--category ...] [--library ...] [--json]` | Discover partner recommendations. |
| `pin-versions` | Pin TanStack package ranges and add missing peer dependencies. Review changes before/after. |

`tanstack mcp` is not a current command. See [MCP removal and migration](#mcp-removal-and-migration).

## Create projects

By default `create` makes a TanStack Start app with SSR. Use `--router-only`
when the user specifically wants a Router-only app rather than Start. Use
`--blank` for a minimal Start app with one route and no default starter UI,
examples, Tailwind, devtools, tests, or Intent setup. Explicit add-ons or
deployment adapters may still add their own required files and dependencies.

Common examples:

```bash
pnpm dlx @tanstack/cli create my-app -y
pnpm dlx @tanstack/cli create my-app --blank -y
pnpm dlx @tanstack/cli create my-app --blank --deployment cloudflare -y
pnpm dlx @tanstack/cli create my-app --add-ons tanstack-query,clerk,drizzle -y
pnpm dlx @tanstack/cli create my-app --router-only -y
```

Important `create` options:

- `--add-ons <ids>`: comma-separated add-on IDs; discover them first.
- `--template <url-or-id>`: built-in template, local path, or URL.
- `--blank`: minimal Start scaffold.
- `--package-manager <pm>`: `npm`, `pnpm`, `yarn`, `bun`, or `deno`.
- `--framework <name>`: documented values include `React` and `Solid`.
- `--router-only`: Router-only project; add-ons, deployment, and templates are
  disabled in this mode per the CLI reference.
- `--toolchain <id>` / `--deployment <id>`: choose discovered add-on IDs.
- `--examples` / `--no-examples`: include or exclude examples.
- `--tailwind` / `--no-tailwind`: deprecated compatibility flags for standard
  projects; blank scaffolds omit Tailwind.
- `--intent`: include local coding-agent skill mappings.
- `--no-git` / `--no-install`: skip Git initialization or dependency install.
- `-y, --yes`: accept remaining defaults and skip prompts.
- `--interactive`: force the prompt flow.
- `--target-dir <path>`: choose the output directory.
- `-f, --force`: overwrite an existing target. Only use when overwrite is
  explicitly intended.
- `--list-add-ons` / `--addon-details <id>`: inspect catalog options.
- `--add-on-config <json>`: provide add-on options.
- `--json`: machine-readable output where supported.

`-y` does not authorize overwriting an existing non-empty directory; pass
`--force` only after checking the target and confirming overwrite is intended.
The `--blank` and `--router-only` modes are different: blank is minimal Start,
while router-only excludes Start. Follow the exact current CLI reference when
combining mode-specific options.

### Discover and add add-ons

Before scaffolding with or adding an add-on, query its ID, dependencies,
configuration options, and conflicts. Specify framework for framework-specific
results:

```bash
pnpm dlx @tanstack/cli create --list-add-ons --framework React --json
pnpm dlx @tanstack/cli create --addon-details clerk --framework React --json
```

For existing projects:

```bash
pnpm dlx @tanstack/cli add clerk drizzle
pnpm dlx @tanstack/cli add tanstack-query,tanstack-form
```

Conflicts are rejected by default. `add --forced` overrides conflicts; only
use it when the user has chosen to override them. The `--forced` flag is not a
substitute for examining conflict metadata.

### Project metadata

Generated projects include `.cta.json`, which records CLI configuration such
as project name, framework, mode, TypeScript/Tailwind settings, package
manager, and chosen add-ons. Add-on and template initialization use it to
detect project changes. Preserve it and inspect its actual keys before
hand-editing; projects may include additional values such as `addOnOptions`,
`includeExamples`, `intent`, `routerOnly`, `git`, or `install`.

## Author add-ons and templates

### Custom add-ons

Use `tanstack add-on init` in a project to extract `.add-on/` metadata and
assets, `tanstack add-on compile` after edits, and `tanstack add-on dev` for a
watch/rebuild loop. A custom add-on typically contains:

```text
.add-on/
├── info.json        # metadata and integration configuration
├── package.json     # optional dependency/script additions
└── assets/          # files copied into generated projects
```

The metadata describes its `type`, `phase`, `category`, supported `modes`,
dependencies/conflicts, environment variables, options, integrations, and
demo routes. EJS assets can use project variables such as `projectName`,
`typescript`, `tailwind`, `addOnEnabled`, and `addOnOption`; filename patterns
include `.ejs` processing, `_dot_gitignore` renaming, and `.append` merging.
Consult the current [Creating Add-ons guide](https://tanstack.com/cli/latest/docs/creating-add-ons)
before authoring against metadata or injection hooks.

Custom add-ons can be consumed using a URL pointing directly to `info.json`.
Test with a clean scaffold before publishing; prefer stable/versioned URLs.

### Templates

Use `tanstack template init` to create `template-info.json` and `template.json`
from the project shape, then `tanstack template compile` after source or
metadata changes. Consume built-in IDs, local paths, or URLs using
`create --template`. Registry entries may expose templates under `templates`
or `starters`. Verify a compiled template from a clean project before
distribution.

## Programmatic generation

For Cloudflare Workers and other edge SSR runtimes, use
`@tanstack/create/worker` with `createWorkerCreate` and
`createWorkerManifestLoader`; provide catalog, framework, and add-on loaders
for the modules the Worker supports. The default `@tanstack/create` entry is
the Node/CLI path and scans framework templates from disk. `@tanstack/create/edge`
uses an in-memory bundled manifest and works at runtime, but imports the full
manifest and is unsuitable for size-constrained Worker bundles. See the
[programmatic generation section](https://tanstack.com/cli/latest/docs/cli-reference)
for the API example and module paths; do not guess loader paths or package
exports.

## MCP removal and migration

The CLI's `tanstack mcp` server was removed and will not be restored. Do not
configure agents to call `@tanstack/cli mcp`. Replace the old MCP functions
with CLI introspection, using `--json` for deterministic results:

| Former operation | Current CLI replacement |
| --- | --- |
| List add-ons | `create --list-add-ons --framework React --json` |
| Get add-on details | `create --addon-details <id> --framework React --json` |
| Create app | `create <name> --framework React --add-ons <ids>` |
| List libraries | `libraries --json` |
| Fetch documentation | `doc <library> <path> --json` |
| Search documentation | `search-docs <query> --library <id> --json` |
| Find ecosystem partners | `ecosystem --category <category> --json` |

This removal is separate from the app-level `mcp` add-on, which can still
scaffold MCP endpoints into an application.

## Troubleshooting

- **Command not found:** use `pnpm dlx @tanstack/cli ...` or install the CLI
  globally using the official setup instructions.
- **Node too old:** CLI docs require Node.js 18+; check `node --version`.
- **Target already exists:** use a different target or inspect before choosing
  `--force`.
- **Add-on conflict/fetch error:** check connectivity and inspect
  `--addon-details`; do not force a conflict by default.
- **Missing environment values:** check `.env.example`, set local values, and
  restart the generated app. Never copy real secrets into reports.
- **Tailwind not applied:** confirm selected project options and the generated
  styles/configuration rather than assuming every preset includes it.
- For reports, capture CLI version, Node version, OS, package manager, and the
  complete error message (redacting credentials and other secrets).

## Official documentation index

All CLI pages are under `https://tanstack.com/cli/latest/docs/`:

- [Overview](https://tanstack.com/cli/latest/docs/overview)
- [Quick start](https://tanstack.com/cli/latest/docs/quick-start)
- [CLI reference](https://tanstack.com/cli/latest/docs/cli-reference)
- [MCP migration](https://tanstack.com/cli/latest/docs/mcp-migration)
- [Add-ons](https://tanstack.com/cli/latest/docs/add-ons)
- [Templates](https://tanstack.com/cli/latest/docs/templates)
- [Creating add-ons](https://tanstack.com/cli/latest/docs/creating-add-ons)
- [Examples](https://tanstack.com/cli/latest/docs/examples)
- [Troubleshooting](https://tanstack.com/cli/latest/docs/troubleshooting)

For full local command details, see [`references/cli-reference.md`](references/cli-reference.md)
and [`references/add-ons-and-templates.md`](references/add-ons-and-templates.md).
