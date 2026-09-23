# Add-ons, Templates, and Troubleshooting

Sources: <https://tanstack.com/cli/latest/docs/add-ons>,
`/templates`, `/creating-add-ons`, `/examples`, `/troubleshooting`.

## Add-ons

Add-ons extend a project with auth, databases, deployment, and more:

```bash
tanstack create my-app --add-ons tanstack-query,clerk,drizzle
```

Discover them:

```bash
tanstack create --list-add-ons
tanstack create --addon-details clerk
```

What add-ons provide:

- **Files** — source in `src/integrations/`, demo routes in `src/routes/demo/`
- **Dependencies** — merged into `package.json`
- **Hooks** — code injection (providers, Vite plugins, devtools)
- **Env vars** — added to `.env.example`

## Creating add-ons

```bash
# 1. Create a base project
tanstack create my-addon-dev -y

# 2. Add the code you want to distribute
#    - src/integrations/my-feature/
#    - src/routes/demo/my-feature.tsx
#    - update package.json

# 3. Extract the add-on
tanstack add-on init

# 4. Edit .add-on/info.json

# 5. Compile
tanstack add-on compile

# Optional: keep rebuilding while authoring
tanstack add-on dev

# 6. Test locally
npx serve .add-on -l 9080
tanstack create test --add-ons http://localhost:9080/info.json
```

### Structure

```
.add-on/
├── info.json        # Metadata (required)
├── package.json     # Dependencies (optional)
└── assets/          # Files to copy
    └── src/
        ├── integrations/my-feature/
        └── routes/demo/my-feature.tsx
```

Generated source-of-truth files in the project root:

- `.add-on/info.json` — add-on metadata and integration config
- `.add-on/package.json` — dependency/script additions merged into generated apps
- `.add-on/assets/**` — template files copied into target apps

### info.json

Required fields:

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

| Field      | Values                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `version`  | Semantic version for the add-on metadata (e.g. `0.0.1`)                                                 |
| `type`     | `add-on`, `toolchain`, `deployment`, `example`                                                          |
| `phase`    | `setup`, `add-on`, `example`                                                                            |
| `category` | `tanstack`, `auth`, `database`, `orm`, `deploy`, `tooling`, `monitoring`, `api`, `i18n`, `cms`, `other` |

Optional fields:

```json
{
  "dependsOn": ["tanstack-query"],
  "conflicts": ["other-feature"],
  "envVars": [{ "name": "API_KEY", "description": "...", "required": true }],
  "gitignorePatterns": ["*.cache"]
}
```

### Hooks (integrations)

Inject code into generated projects:

```json
{
  "integrations": [
    {
      "type": "root-provider",
      "jsName": "MyProvider",
      "path": "src/integrations/my-feature/provider.tsx"
    }
  ]
}
```

| Type            | Location                  | Use                |
| --------------- | ------------------------- | ------------------ |
| `root-provider` | Wraps app in `__root.tsx` | Context providers  |
| `provider`      | Same, but simpler         | Basic providers    |
| `vite-plugin`   | `vite.config.ts`          | Vite plugins       |
| `devtools`      | After app in `__root.tsx` | Devtools           |
| `header-user`   | Header component          | User menu, auth UI |
| `layout`        | Layout wrapper            | Dashboard layouts  |

### Demo routes

```json
{
  "routes": [
    {
      "url": "/demo/my-feature",
      "name": "My Feature Demo",
      "path": "src/routes/demo/my-feature.tsx",
      "jsName": "MyFeatureDemo"
    }
  ]
}
```

### Add-on options

Let users configure the add-on:

```json
{
  "options": {
    "database": {
      "type": "select",
      "label": "Database",
      "options": [
        { "value": "postgres", "label": "PostgreSQL" },
        { "value": "sqlite", "label": "SQLite" }
      ],
      "default": "postgres"
    }
  }
}
```

Read them in EJS templates:

```ejs
<% if (addOnOption['my-feature']?.database === 'postgres') { %>
// PostgreSQL code
<% } %>
```

### EJS templates

Files ending in `.ejs` are processed. Available variables:

| Variable       | Type    | Description         |
| -------------- | ------- | ------------------- |
| `projectName`  | string  | Project name        |
| `typescript`   | boolean | TS enabled          |
| `tailwind`     | boolean | Tailwind enabled    |
| `addOnEnabled` | object  | `{ [id]: boolean }` |
| `addOnOption`  | object  | `{ [id]: options }` |

File patterns:

| Pattern          | Result                    |
| ---------------- | ------------------------- |
| `file.ts`        | Copied as-is              |
| `file.ts.ejs`    | EJS processed             |
| `_dot_gitignore` | Becomes `.gitignore`      |
| `file.ts.append` | Appended to existing file |

### Distribution

Host on GitHub, npm, or any URL:

```bash
tanstack create my-app --add-ons https://example.com/my-addon/info.json
```

Local iteration loop:

```bash
# in the add-on project
tanstack add-on compile
npx serve .add-on -l 9080

# in another terminal
tanstack create test-app --add-ons http://localhost:9080/info.json
```

Run `tanstack add-on dev` to auto-refresh `.add-on` and `add-on.json` on file
changes.

Publishing tips:

- Keep add-on source in git (not just compiled output).
- Re-run `tanstack add-on compile` after each metadata/template change.
- Publish `.add-on` contents to a stable URL; prefer immutable/versioned URLs.

Maintenance checklist:

1. Update templates or metadata in the source project.
2. Re-run `tanstack add-on compile`.
3. Test with a clean scaffold (`tanstack create ... --add-ons <url>`).
4. Verify install/build/lint in the generated app.
5. Publish updated `.add-on` assets.

## Templates

Templates are reusable starting points; they can declare add-on dependencies.

```bash
tanstack create my-app --template ecommerce
tanstack create my-app --template https://example.com/template.json
tanstack create my-app --template ./template.json
```

Create a template:

```bash
tanstack create my-template --add-ons clerk,drizzle,sentry
cd my-template
tanstack template init      # template-info.json + template.json
tanstack template compile
tanstack create new-app --template ./template.json
```

Maintain: edit the source project, re-run `tanstack template compile`, and
publish the updated `template.json` to the URL the team uses.

Registry format: registry entries can expose templates under `templates` or
`starters`.

## Examples and CI recipes

```bash
# TanStack Start app (default, with SSR)
tanstack create my-app -y

# Router-only SPA (no SSR)
tanstack create my-app --router-only -y

# Interactive add-on selection
tanstack create my-app --interactive

# Full-stack recipe
tanstack create my-app
cd my-app
cp .env.example .env    # edit API keys
pnpm dev
```

GitHub Actions:

```yaml
name: Create Project
on:
  workflow_dispatch:
    inputs:
      name:
        required: true
jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - run: npx @tanstack/cli create ${{ inputs.name }} -y
```

Docker:

```dockerfile
FROM node:20-slim
RUN npm install -g @tanstack/cli pnpm
RUN tanstack create app -y
WORKDIR /app
RUN pnpm install && pnpm build
CMD ["pnpm", "start"]
```

## Troubleshooting

### Installation

- **Command not found** — use `npx @tanstack/cli <command>` or reinstall with
  `npm install -g @tanstack/cli`.
- **Permission denied** — install Node through a version manager (e.g. nvm).
- **Node too old** — requires Node.js 18+.

### Project creation

- **Directory exists** — use a different name, `--target-dir ./new/path`, or
  `-f` to force overwrite.
- **Add-on fetch failed** — check connectivity, or clone
  `https://github.com/TanStack/cli`, build it, and run
  `node packages/cli/dist/index.js create my-app`.
- **Conflicting add-ons** — some add-ons conflict (multiple ORMs, multiple auth
  providers). Inspect with `tanstack create --addon-details <id>`.

### Runtime

- **Missing env vars** — `cp .env.example .env`, edit, then restart `pnpm dev`.
- **Tailwind not working** — confirm the project config has Tailwind enabled and
  `styles.css` imports `@import 'tailwindcss'`.

### Getting help

Include `npx @tanstack/cli --version`, `node --version`, OS, package manager,
and the full error message.

- GitHub Issues: <https://github.com/TanStack/cli/issues>
- Discord: <https://tlinz.com/discord>
