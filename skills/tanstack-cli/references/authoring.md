# Authoring: add-ons, templates, programmatic generation

Create custom add-ons and reusable templates. Project config (`.cta.json`) is documented in [scaffolding.md](scaffolding.md).

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

## Authoring custom add-ons

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
