# TanStack CLI Reference

Source: <https://tanstack.com/cli/latest/docs/cli-reference> (fetched via
`npx @tanstack/cli doc cli cli-reference`). Commands below work as
`npx @tanstack/cli <command>` or `tanstack <command>` once installed globally.

## tanstack create

Create a new TanStack application. By default creates a TanStack Start app with
SSR.

```bash
tanstack create [project-name] [options]
```

| Option                         | Description                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `--add-ons <ids>`              | Comma-separated add-on IDs                                                                        |
| `--template <url-or-id>`       | Template URL/path or built-in template ID                                                         |
| `--blank`                      | Minimal one-route Start project without starter UI, examples, Tailwind, devtools, or a test stack |
| `--package-manager <pm>`       | `npm`, `pnpm`, `yarn`, `bun`, `deno`                                                              |
| `--framework <name>`           | `React`, `Solid`                                                                                  |
| `--router-only`                | File-based Router-only app without TanStack Start (add-ons/deployment/template disabled)          |
| `--toolchain <id>`             | Toolchain add-on (use `--list-add-ons` to see options)                                            |
| `--deployment <id>`            | Deployment add-on (use `--list-add-ons` to see options)                                           |
| `--examples` / `--no-examples` | Include or exclude demo/example pages                                                             |
| `--tailwind` / `--no-tailwind` | Deprecated compatibility flags for standard projects; blank projects omit Tailwind                |
| `--no-git`                     | Skip git init                                                                                     |
| `--no-install`                 | Skip dependency install                                                                           |
| `-y, --yes`                    | Use defaults, skip prompts                                                                        |
| `--interactive`                | Force interactive mode                                                                            |
| `--target-dir <path>`          | Custom output directory                                                                           |
| `-f, --force`                  | Overwrite existing directory                                                                      |
| `--list-add-ons`               | List all available add-ons                                                                        |
| `--addon-details <id>`         | Show details for a specific add-on                                                                |
| `--json`                       | Machine-readable JSON output for automation                                                       |
| `--add-on-config <json>`       | JSON string with add-on options                                                                   |

```bash
# Examples
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

`--blank` creates the smallest useful TanStack Start project: one route and no
default starter interface, examples, Tailwind, devtools, test dependencies, or
Intent setup. Pass `--intent` to include local skill mappings for coding agents.
Explicit add-ons and deployment adapters can add their own required files and
dependencies. `-y` uses defaults for every remaining option; a non-empty target
additionally requires `--force`.

### Programmatic generation

Use `@tanstack/create/worker` in Cloudflare Workers and other edge SSR runtimes.
It does not import the generated template manifest at module startup; provide
loaders for the framework and add-on chunks the Worker supports.

- Default `@tanstack/create` export — Node/CLI path; scans framework templates
  from disk.
- `@tanstack/create/edge` — bundled in-memory manifest; Worker-compatible at
  runtime but imports the full generated manifest (not for size-constrained
  bundles).
- `@tanstack/create/worker-manifest/catalog` — `manifestCatalog` for the worker
  loader.

```ts
import {
  createMemoryEnvironment,
  createWorkerCreate,
  createWorkerManifestLoader,
} from "@tanstack/create/worker";
import { manifestCatalog } from "@tanstack/create/worker-manifest/catalog";
import type {
  WorkerAddOnManifestModule,
  WorkerFrameworkManifestModule,
} from "@tanstack/create/worker";

const create = createWorkerCreate(
  createWorkerManifestLoader({
    loadCatalog: async () => manifestCatalog,
    loadFramework: async (
      id: string,
    ): Promise<WorkerFrameworkManifestModule> => {
      if (id !== "react") throw new Error(`Unsupported framework: ${id}`);
      return import("@tanstack/create/worker-manifest/frameworks/react");
    },
    loadAddOn: async (
      frameworkId: string,
      addOnId: string,
    ): Promise<WorkerAddOnManifestModule> => {
      if (frameworkId !== "react") throw new Error("Unsupported framework");
      return import(
        `@tanstack/create/worker-manifest/frameworks/react/add-ons/${addOnId}`
      );
    },
  }),
);

const framework = await create.getFrameworkById("react");
const chosenAddOns = await create.finalizeAddOns(framework!, "file-router", [
  "tanstack-query",
  "cloudflare",
]);
const addOnOptions = create.populateAddOnOptionsDefaults(chosenAddOns);
const { environment, output } = createMemoryEnvironment("/app");

await create.createApp(environment, {
  projectName: "app",
  targetDir: "/app",
  framework: framework!,
  mode: "file-router",
  typescript: true,
  tailwind: true,
  packageManager: "pnpm",
  git: false,
  install: false,
  intent: false,
  chosenAddOns,
  addOnOptions,
});

// output.files contains generated files for ZIP creation.
```

The official page shows explicit per-add-on loader maps; the dynamic import
above is equivalent for a single framework and keeps the snippet short.

## tanstack add

Add add-ons to an existing project.

```bash
tanstack add [add-on...] [options]
```

| Option     | Description                                       |
| ---------- | ------------------------------------------------- |
| `--forced` | Force add-on installation even if conflicts exist |

```bash
tanstack add clerk drizzle
tanstack add tanstack-query,tanstack-form
```

Visual setup: <https://tanstack.com/builder>.

## tanstack add-on

Create and manage custom add-ons.

### init

```bash
tanstack add-on init
```

Extracts an add-on from the current project: creates `.add-on/` with
`info.json` and `assets/`.

### compile

```bash
tanstack add-on compile
```

Rebuilds `.add-on` after changes. `tanstack add-on dev` watches and rebuilds
continuously while authoring.

See [add-ons-and-templates.md](add-ons-and-templates.md) for the full guide.

## tanstack template

Create reusable project templates.

### init

```bash
tanstack template init
```

Creates `template-info.json` and `template.json`.

### compile

```bash
tanstack template compile
```

See [add-ons-and-templates.md](add-ons-and-templates.md).

## tanstack libraries

List TanStack libraries with optional group filtering.

```bash
tanstack libraries [options]
```

| Option            | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `--group <group>` | Filter by group: `state`, `headlessUI`, `performance`, `tooling` |
| `--json`          | Machine-readable JSON output                                     |

```bash
tanstack libraries
tanstack libraries --group state --json
```

Observed JSON shape:

```json
{
  "group": "All Libraries",
  "count": 18,
  "libraries": [
    {
      "id": "start",
      "name": "TanStack Start",
      "tagline": "...",
      "description": "...",
      "frameworks": ["react", "solid"],
      "latestVersion": "v0",
      "docsUrl": "https://tanstack.com/start/latest/docs/framework/react/overview",
      "githubUrl": "https://github.com/TanStack/router"
    }
  ]
}
```

## tanstack doc

Fetch a TanStack documentation page by library and path.

```bash
tanstack doc <library> <path> [options]
```

| Option                     | Description                      |
| -------------------------- | -------------------------------- |
| `--docs-version <version>` | Docs version (default: `latest`) |
| `--json`                   | Machine-readable JSON output     |

```bash
tanstack doc router framework/react/guide/data-loading
tanstack doc query framework/react/overview --docs-version v5 --json
tanstack doc cli cli-reference
```

`<library>` is a catalog id (`start`, `router`, `query`, `form`, `table`,
`markdown`, `highlight`, `cli`, `intent`, ...). `<path>` is the docs URL
segment after `/docs/`, without the anchor.

## tanstack search-docs

Search TanStack documentation.

```bash
tanstack search-docs <query> [options]
```

| Option               | Description                          |
| -------------------- | ------------------------------------ |
| `--library <id>`     | Filter by library ID                 |
| `--framework <name>` | Filter by framework                  |
| `--limit <n>`        | Max results (default `10`, max `50`) |
| `--json`             | Machine-readable JSON output         |

```bash
tanstack search-docs "server functions" --library start
tanstack search-docs loaders --library router --framework react --json
```

Text output rows read `Title [library]`, then the page URL, then a snippet.
Use the URL path after `/docs/` as the `doc` path.

## tanstack ecosystem

List ecosystem partner recommendations.

```bash
tanstack ecosystem [options]
```

| Option                  | Description                  |
| ----------------------- | ---------------------------- |
| `--category <category>` | Filter by category           |
| `--library <id>`        | Filter by TanStack library   |
| `--json`                | Machine-readable JSON output |

```bash
tanstack ecosystem --category database
tanstack ecosystem --library router --json
```

## tanstack pin-versions

```bash
tanstack pin-versions
```

Removes `^` from TanStack package version ranges and adds any missing peer
dependencies, to avoid version conflicts in a project.

## Configuration (.cta.json)

Generated projects contain `.cta.json`:

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

Used by `add-on init` and `template init` to detect changes. Real projects may
carry extra keys (`projectPreset`, `addOnOptions`, `includeExamples`, `intent`,
`routerOnly`, `git`, `install`).

## MCP migration

`tanstack mcp` has been removed; the MCP server will not be restored. Existing
MCP client configs pointing at `@tanstack/cli mcp` should be removed. The
app-level `mcp` add-on still scaffolds MCP endpoints into generated projects.

| Old MCP tool                | CLI replacement                                                    |
| --------------------------- | ------------------------------------------------------------------ |
| `listTanStackAddOns`        | `tanstack create --list-add-ons --framework React --json`          |
| `getAddOnDetails`           | `tanstack create --addon-details drizzle --framework React --json` |
| `createTanStackApplication` | `tanstack create my-app --framework React --add-ons drizzle,clerk` |
| `tanstack_list_libraries`   | `tanstack libraries --json`                                        |
| `tanstack_doc`              | `tanstack doc query framework/react/overview --json`               |
| `tanstack_search_docs`      | `tanstack search-docs "server functions" --library start --json`   |
| `tanstack_ecosystem`        | `tanstack ecosystem --category database --json`                    |

Recommended agent workflow: use `--json` output for deterministic parsing.
