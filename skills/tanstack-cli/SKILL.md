---
name: tanstack-cli
description: Use for any task involving the TanStack CLI (tanstack / @tanstack/cli) — creating TanStack Start and Router projects, working with add-ons, templates, or the agent introspection commands (create, add, add-on, template, libraries, doc, search-docs, ecosystem, pin-versions).
---

# TanStack CLI

Scaffold TanStack Start & Router applications with add-ons for auth, databases, deployment, and more. Run via `tanstack` or `npx @tanstack/cli`.

For agent automation and introspection, always prefer `--json` output for deterministic parsing. Do not scrape websites to discover add-ons, docs, libraries, or ecosystem data — use the CLI commands below instead.

## tanstack create

Create a new TanStack application. By default creates a TanStack Start app with SSR.

```bash
tanstack create [project-name] [options]
```

| Option | Description |
|--------|-------------|
| `--add-ons <ids>` | Comma-separated add-on IDs |
| `--template <url-or-id>` | Template URL/path or built-in template ID |
| `--blank` | Minimal one-route Start project: no default starter UI, examples, Tailwind, devtools, test stack, or TanStack Intent setup. Pass `--intent` to include local skill mappings for coding agents |
| `--package-manager <pm>` | `npm`, `pnpm`, `yarn`, `bun`, `deno` |
| `--framework <name>` | `React`, `Solid` |
| `--router-only` | File-based Router-only app without TanStack Start (add-ons/deployment/template disabled) |
| `--toolchain <id>` | Toolchain add-on (see `--list-add-ons`) |
| `--deployment <id>` | Deployment add-on (see `--list-add-ons`) |
| `--examples` / `--no-examples` | Include or exclude demo/example pages |
| `--tailwind` / `--no-tailwind` | Deprecated compatibility flags for standard projects; blank projects omit Tailwind |
| `--no-git` | Skip git init |
| `--no-install` | Skip dependency install |
| `-y, --yes` | Use defaults, skip prompts |
| `--interactive` | Force interactive mode |
| `--target-dir <path>` | Custom output directory |
| `-f, --force` | Overwrite existing directory |
| `--list-add-ons` | List all available add-ons |
| `--addon-details <id>` | Show details for a specific add-on |
| `--json` | Machine-readable JSON for automation |
| `--add-on-config <json>` | JSON string with add-on options |

Examples:

```bash
tanstack create my-app -y
tanstack create my-app --blank -y
tanstack create my-app --blank --deployment cloudflare -y
tanstack create my-app --add-ons clerk,drizzle,tanstack-query
tanstack create my-app --router-only --toolchain eslint --no-examples
tanstack create my-app --template https://example.com/template.json
tanstack create my-app --template ecommerce
tanstack create --list-add-ons --framework React --json
tanstack create --addon-details drizzle --framework React --json
```

Notes:
- `--blank` creates the smallest useful Start project (one route). Explicit add-ons and deployment adapters can add their own required files and dependencies.
- Add `-y` to use defaults for every remaining option; when the target is non-empty, also pass `--force` or the command exits without writing.

## tanstack add

Add add-ons to an existing project.

```bash
tanstack add [add-on...] [options]
```

| Option | Description |
|--------|-------------|
| `--forced` | Force add-on installation even if conflicts exist |

```bash
tanstack add clerk drizzle
tanstack add tanstack-query,tanstack-form
```

Visual setup is available at `https://tanstack.com/builder`.

## tanstack add-on

Create and manage custom add-ons.

```bash
tanstack add-on init       # Extract add-on from current project → .add-on/ with info.json + assets/
tanstack add-on compile    # Rebuild after changes
tanstack add-on dev        # Continuously rebuild while authoring
```

## tanstack template

Create reusable project templates.

```bash
tanstack template init      # Creates template-info.json and template.json
tanstack template compile   # Rebuild compiled template.json after changes
```

## Introspection commands

```bash
tanstack libraries [--group <state|headlessUI|performance|tooling>] [--json]
tanstack doc <library> <path> [--docs-version <version>] [--json]
tanstack search-docs <query> [--library <id>] [--framework <name>] [--limit <n>] [--json]
tanstack ecosystem [--category <category>] [--library <id>] [--json]
tanstack pin-versions   # Pin TanStack package versions, add missing peer deps
```

`--limit` default is `10`, max `50`. `--docs-version` defaults to `latest`.

```bash
tanstack libraries --group state --json
tanstack doc router framework/react/guide/data-loading
tanstack doc query framework/react/overview --docs-version v5 --json
tanstack search-docs "server functions" --library start
tanstack search-docs loaders --library router --framework react --json
tanstack ecosystem --category database
tanstack ecosystem --library router --json
```

## Configuration (.cta.json)

Generated projects include `.cta.json`, used by `add-on init` and `template init` to detect changes:

```json
{
  "version": 1,
  "projectName": "my-app",
  "framework": "react",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "packageManager": "pnpm",
  "chosenAddOns": ["tanstack-query", "clerk"]
}
```

## Add-ons

Add-ons extend a project with auth, databases, deployment, and more. They provide:
- **Files**: source in `src/integrations/`, demo routes in `src/routes/demo/`
- **Dependencies**: merged into `package.json`
- **Hooks**: code injection (providers, Vite plugins, devtools)
- **Env vars**: added to `.env.example`

Discover with `tanstack create --list-add-ons` and `tanstack create --addon-details <id>`.

### Authoring custom add-ons

1. `tanstack create my-addon-dev -y` and add your code (`src/integrations/`, `src/routes/demo/`, update `package.json`).
2. `tanstack add-on init` → extracts `.add-on/info.json`, `.add-on/package.json`, `.add-on/assets/**`.
3. Edit `.add-on/info.json`, then `tanstack add-on compile`.
4. Test: `npx serve .add-on -l 9080` then `tanstack create test --add-ons http://localhost:9080/info.json`.

`info.json` required fields:

```json
{
  "name": "My Feature",
  "version": "0.0.1",
  "description": "What it does",
  "type": "add-on",
  "phase": "add-on",
  "category": "tooling",
  "modes": ["file-router"]
}
```

- `type`: `add-on`, `toolchain`, `deployment`, `example`
- `phase`: `setup`, `add-on`, `example`
- `category`: `tanstack`, `auth`, `database`, `orm`, `deploy`, `tooling`, `monitoring`, `api`, `i18n`, `cms`, `other`
- Optional: `dependsOn`, `conflicts`, `envVars`, `gitignorePatterns`

Integrations (`integrations` array) inject code. Types: `root-provider`, `provider`, `vite-plugin`, `devtools`, `header-user`, `layout`. Each has `type`, `jsName`, and `path`.

EJS templates: files ending `.ejs` are processed with variables `projectName`, `typescript`, `tailwind`, `addOnEnabled` (`{ [id]: boolean }`), `addOnOption` (`{ [id]: options }`). File patterns: `file.ts` (copy as-is), `file.ts.ejs` (EJS), `_dot_gitignore` → `.gitignore`, `file.ts.append` (append).

## Templates

Templates are reusable project starting points that can declare add-on dependencies.

```bash
tanstack create my-app --template ecommerce          # built-in ID
tanstack create my-app --template https://example.com/template.json
tanstack create my-app --template ./template.json
```

Create: scaffold a project with the shape you want → `tanstack template init` → edit `template-info.json` → `tanstack template compile` → distribute the compiled `template.json`. Re-run `compile` after source changes. Registry entries can expose templates under `templates` or `starters`.

## Programmatic generation

For Cloudflare Workers / edge SSR, use `@tanstack/create/worker` (`createMemoryEnvironment`, `createWorkerCreate`, `createWorkerManifestLoader`) with a loader for the framework and add-on chunks you support. It does not import the full template manifest at startup. The default `@tanstack/create` export is the Node/CLI path (scans templates from disk); `@tanstack/create/edge` is the bundled in-memory manifest path (Worker-compatible but imports the full manifest, so not for size-constrained bundles).

## MCP migration

`tanstack mcp` is removed from the CLI. Use direct commands instead:

| Old MCP tool | New CLI command |
|---|---|
| `listTanStackAddOns` | `tanstack create --list-add-ons --framework React --json` |
| `getAddOnDetails` | `tanstack create --addon-details drizzle --framework React --json` |
| `createTanStackApplication` | `tanstack create my-app --framework React --add-ons drizzle,clerk` |
| `tanstack_list_libraries` | `tanstack libraries --json` |
| `tanstack_doc` | `tanstack doc query framework/react/overview --json` |
| `tanstack_search_docs` | `tanstack search-docs "server functions" --library start --json` |
| `tanstack_ecosystem` | `tanstack ecosystem --category database --json` |

Notes: the CLI MCP server will not be restored; existing MCP client configs pointing to `@tanstack/cli mcp` break and should be removed. The app-level `mcp` add-on still exists for projects hosting their own MCP endpoints.
