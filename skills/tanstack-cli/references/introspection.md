# Introspection: libraries, docs, search, ecosystem, pinning

Agent-facing discovery commands.

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
