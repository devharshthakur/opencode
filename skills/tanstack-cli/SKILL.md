---
name: tanstack-cli
description: Use for any task involving the TanStack CLI (tanstack / @tanstack/cli) — creating TanStack Start and Router projects, working with add-ons, templates, or the agent introspection commands (create, add, add-on, template, libraries, doc, search-docs, ecosystem, pin-versions).
---

# TanStack CLI

Scaffold TanStack Start & Router applications with add-ons for auth, databases, deployment, and more. Run via `tanstack` or `npx @tanstack/cli`.

## Before you run anything

1. Check the installed CLI, then the subcommand: `tanstack --version` and `tanstack <command> --help`. Read the actual flags from `--help`; they differ between versions.
2. Prefer `--json` on every command that supports it for deterministic parsing. Do not scrape websites to discover add-ons, docs, libraries, or ecosystem data — use these commands.
3. Use the repository's package manager and local executable; default to `pnpm` when unspecified. Ask before installing a missing CLI globally.
4. `--force` overwrites an existing directory. Pass it only with explicit authority for that target; otherwise choose a fresh path or ask.

## Route by task

Each reference holds the full technical detail; open only what the task needs.

| Task | Reference |
|------|-----------|
| Create a project, `add` add-ons, read/write `.cta.json`, browse the add-on catalog | [references/scaffolding.md](references/scaffolding.md) |
| Look up libraries, fetch docs, search docs, browse the ecosystem, pin versions | [references/introspection.md](references/introspection.md) |
| Author add-ons and templates, programmatic generation, env/config schema | [references/authoring.md](references/authoring.md) |
| Migrate off the removed `tanstack mcp` (legacy only) | [references/mcp-migration.md](references/mcp-migration.md) |
