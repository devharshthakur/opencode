---
name: tanstack-cli
description: Use when running or explaining tanstack CLI commands — scaffolding a TanStack Start app, adding add-ons, authoring add-ons or templates, listing libraries, fetching or searching TanStack docs, ecosystem recommendations, and pinning package versions.
---

# TanStack CLI

`tanstack` scaffolds TanStack apps, adds add-ons to existing projects, and reads or searches TanStack documentation.

Two rules before running anything:

- **The installed CLI wins.** When a flag here is missing, renamed, or rejected, run `tanstack <command> --help` and follow that. This reference tracks the published docs; the binary tracks its own version.
- **Automate with `-y` and `--json`.** Both suppress prompts and output stable machine-readable data. A non-empty target directory needs `--force` as well; without it `create` exits without writing.

## tanstack create

Create a new TanStack application. Defaults to a TanStack Start app with SSR.

```bash
tanstack create [project-name] [options]
```

| Option | Description |
|--------|-------------|
| `--add-ons <ids>` | Comma-separated add-on IDs |
| `--template <url-or-id>` | Template URL/path or built-in template ID |
| `--blank` | Minimal one-route Start project: no default starter UI, examples, Tailwind, devtools, or test stack |
| `--package-manager <pm>` | `npm`, `pnpm`, `yarn`, `bun`, `deno` |
| `--framework <name>` | `React`, `Solid` |
| `--build-tool <name>` | `vite` (default), `rsbuild` |
| `--router-only` | File-based Router-only app, without TanStack Start; disables add-ons, deployment, and template |
| `--toolchain <id>` | Toolchain add-on (`--list-add-ons` shows options) |
| `--deployment <id>` | Deployment add-on (`--list-add-ons` shows options) |
| `--examples` / `--no-examples` | Include or exclude demo/example pages |
| `--tailwind` / `--no-tailwind` | Deprecated compatibility flags; blank projects omit Tailwind |
| `--intent` | Include TanStack Intent: local skill mappings for coding agents |
| `--no-git` | Skip git init |
| `--no-install` | Skip dependency install |
| `-y, --yes` | Use defaults, skip prompts |
| `--interactive` | Force interactive mode |
| `--target-dir <path>` | Custom output directory |
| `-f, --force` | Overwrite existing directory |
| `--list-add-ons` | List all available add-ons |
| `--addon-details <id>` | Show details for one add-on |
| `--json` | Machine-readable JSON output |
| `--add-on-config <json>` | JSON string with add-on options |

```bash
tanstack create my-app -y
tanstack create my-app --blank -y
tanstack create my-app --blank --deployment cloudflare -y
tanstack create my-app --add-ons clerk,drizzle,tanstack-query
tanstack create my-app --router-only --toolchain eslint --no-examples
tanstack create my-app --build-tool rsbuild -y
tanstack create my-app --framework Solid --build-tool rsbuild --router-only --blank --toolchain biome -y
tanstack create my-app --template https://example.com/template.json
tanstack create my-app --template ecommerce
tanstack create --list-add-ons --framework React --json
tanstack create --addon-details drizzle --framework React --json
```

`--blank` is the smallest useful Start project: one route, no default starter interface, examples, Tailwind, devtools, test dependencies, or TanStack Intent. Explicit add-ons and deployment adapters still add their own required files and dependencies.

Edge and Worker runtimes can generate apps programmatically with `@tanstack/create/worker`; see [programmatic generation](references/programmatic-generation.md).

## tanstack add

Add add-ons to an existing project.

```bash
tanstack add [add-on...] [options]
```

| Option | Description |
|--------|-------------|
| `--forced` | Force installation even if conflicts exist |

```bash
tanstack add clerk drizzle
tanstack add tanstack-query,tanstack-form
```

Visual setup: `https://tanstack.com/builder`.

## tanstack add-on

Create and manage custom add-ons.

```bash
tanstack add-on init      # extract from the current project into .add-on/
tanstack add-on compile   # rebuild after editing
```

`init` writes `.add-on/info.json` and `.add-on/assets/`. See [creating add-ons](https://tanstack.com/cli/latest/docs/creating-add-ons).

## tanstack template

Create reusable project templates.

```bash
tanstack template init      # writes template-info.json and template.json
tanstack template compile   # rebuild after editing
```

See [templates](https://tanstack.com/cli/latest/docs/templates).

## tanstack libraries

List TanStack libraries, optionally filtered by group.

```bash
tanstack libraries [options]
```

| Option | Description |
|--------|-------------|
| `--group <group>` | `state`, `headlessUI`, `performance`, `tooling` |
| `--json` | Machine-readable JSON |

```bash
tanstack libraries
tanstack libraries --group state --json
```

## tanstack doc

Fetch one documentation page by library and path.

```bash
tanstack doc <library> <path> [options]
```

| Option | Description |
|--------|-------------|
| `--docs-version <version>` | Docs version (default `latest`) |
| `--json` | Machine-readable JSON |

```bash
tanstack doc router framework/react/guide/data-loading
tanstack doc query framework/react/overview --docs-version v5 --json
```

## tanstack search-docs

Search TanStack documentation.

```bash
tanstack search-docs <query> [options]
```

| Option | Description |
|--------|-------------|
| `--library <id>` | Filter by library ID |
| `--framework <name>` | Filter by framework |
| `--limit <n>` | Max results (default `10`, max `50`) |
| `--json` | Machine-readable JSON |

```bash
tanstack search-docs "server functions" --library start
tanstack search-docs loaders --library router --framework react --json
```

## tanstack ecosystem

List ecosystem partner recommendations.

```bash
tanstack ecosystem [options]
```

| Option | Description |
|--------|-------------|
| `--category <category>` | Filter by category |
| `--library <id>` | Filter by TanStack library |
| `--json` | Machine-readable JSON |

```bash
tanstack ecosystem --category database
tanstack ecosystem --library router --json
```

## tanstack pin-versions

Pin TanStack package versions to avoid conflicts: removes `^` from TanStack package ranges and adds any missing peer dependencies.

```bash
tanstack pin-versions
```

## Configuration

Projects include `.cta.json`, which `add-on init` and `template init` read to detect changes:

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
