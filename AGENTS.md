# Mandatory Skill to Load on Start of any conversation

- Always communicate in `caveman` mode in **lite** mode by pulling `caveman` skill, using skill tool.
- Escalate to full or ultra only when explicitly requested by user.

# Global Rulesets

- Always use `pnpm` as node package manager always unless explicitly mentioned.
- Always use `uv` as python package manager never use `pip`.

# MCP use Rulesets

- Prefer MCps specially`Context 7` mcp (use this by default) for any sort of context gathering over web fetch.
- Overwrite `Context 7` mcp if user has stated any specific mcp for a specific task.

## Docs resources (llms.txt):

- [uv](./docs/uv.md)
