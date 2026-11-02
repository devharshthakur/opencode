# Programmatic generation

Use `@tanstack/create/worker` in Cloudflare Workers and other edge SSR runtimes. It does not import the generated template manifest at module startup; instead you provide a loader for the framework and add-on chunks the Worker supports.

The three entry points differ by what they load:

| Import | Loads | Fits |
|--------|-------|------|
| `@tanstack/create/worker` | Only the chunks your loaders return | Size-constrained Workers and edge runtimes |
| `@tanstack/create` | Framework templates scanned from disk | Node and the CLI |
| `@tanstack/create/edge` | The full bundled in-memory manifest | Workers at runtime, but too large for size-constrained bundles |

```ts
import {
  createMemoryEnvironment,
  createWorkerCreate,
  createWorkerManifestLoader,
} from '@tanstack/create/worker'
import { manifestCatalog } from '@tanstack/create/worker-manifest/catalog'

import type {
  WorkerAddOnManifestModule,
  WorkerFrameworkManifestModule,
} from '@tanstack/create/worker'

const frameworkLoaders: Record<
  string,
  () => Promise<WorkerFrameworkManifestModule>
> = {
  react: () => import('@tanstack/create/worker-manifest/frameworks/react'),
}

const addOnLoaders: Record<
  string,
  Record<string, () => Promise<WorkerAddOnManifestModule>>
> = {
  react: {
    'tanstack-query': () =>
      import(
        '@tanstack/create/worker-manifest/frameworks/react/add-ons/tanstack-query'
      ),
    cloudflare: () =>
      import(
        '@tanstack/create/worker-manifest/frameworks/react/add-ons/cloudflare'
      ),
  },
}

const create = createWorkerCreate(
  createWorkerManifestLoader({
    loadCatalog: async () => manifestCatalog,
    async loadFramework(frameworkId) {
      const load = frameworkLoaders[frameworkId]
      if (!load) throw new Error(`Unsupported framework: ${frameworkId}`)
      return load()
    },
    async loadAddOn(frameworkId, addOnId) {
      const load = addOnLoaders[frameworkId]?.[addOnId]
      if (!load) throw new Error(`Unsupported add-on: ${addOnId}`)
      return load()
    },
  }),
)

const framework = await create.getFrameworkById('react')
const chosenAddOns = await create.finalizeAddOns(framework!, 'file-router', [
  'tanstack-query',
  'cloudflare',
])
const addOnOptions = create.populateAddOnOptionsDefaults(chosenAddOns)
const { environment, output } = createMemoryEnvironment('/app')

await create.createApp(environment, {
  projectName: 'app',
  targetDir: '/app',
  framework: framework!,
  mode: 'file-router',
  bundler: 'vite',
  typescript: true,
  tailwind: true,
  packageManager: 'pnpm',
  git: false,
  install: false,
  intent: false,
  chosenAddOns,
  addOnOptions,
})

// output.files contains generated files for ZIP creation.
```
