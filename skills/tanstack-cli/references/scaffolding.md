# Scaffolding: projects, add-ons, and `.cta.json`

Create a TanStack application and extend it with add-ons.

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

Discover with `tanstack create --list-add-ons` and `tanstack create --addon-details <id>`. Authoring a custom add-on is covered in [authoring.md](authoring.md).
