# MCP migration (legacy)

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
