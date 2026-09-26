---
description: Create or improve a concise, task-oriented project AGENTS.md
agent: edit
---

Create or improve the `AGENTS.md` for the project in the current workspace. Do not change the global `~/.config/opencode/AGENTS.md` unless that file is explicitly the requested target. Treat `$ARGUMENTS` as additional requirements, not permission to guess facts.

1. Identify the project root and check whether it already has `AGENTS.md`. If the target project is unclear, ask before editing. Check worktree status; preserve unrelated changes. Improve an existing project file in place rather than replacing it wholesale or creating a duplicate.
2. Discover only what is needed: use `glob` for filenames, `grep` for entry points or commands, and `read` for relevant files and narrow ranges. Read the README/PROJECT docs, build and test manifests, and applicable existing instructions (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md`) if present. Follow referenced files only when relevant. Inspect implementation across boundaries to confirm ownership and non-obvious architecture; do not read the whole repository or ignored dependency/build directories.
3. Write a small, actionable project guide. Start the file with this exact line, followed by a blank line:

   This file provides guidance to AI coding agents like Claude Code (claude.ai/code), Cursor AI, Codex, Gemini CLI, GitHub Copilot, and other AI coding assistants when working with code in this repository.

   Include only verified build/lint/test/development commands that exist in this project, including the exact way to run a single test when supported. Explain important command ordering or setup requirements if verified. Give a compact **task → starting path** map for the kinds of changes agents will make, identifying where to follow an entry point across layers when ownership is not obvious. Summarize only architecture or conventions that require reading multiple files to understand. Carry over important, nonduplicated instructions from existing rule files; link to detailed documents rather than copying them if they are useful only for particular tasks.
4. Do not invent commands, paths, architecture, or headings to fill a template. Omit sections that have no verified content. Avoid a file inventory, general coding advice, OpenCode tool documentation, and repeated global rules. Keep the result as short as the project permits (well under 500 lines unless genuinely necessary); optimize for fewer future file reads, not fewer useful facts.
5. Review the final `AGENTS.md` against the files inspected and its diff: exact prefix, valid paths and commands, useful task routing, no lost project-specific rules, and no unrelated changes. Report the target path, what was added or improved, what was verified, and any unresolved commands or ownership questions. Do not commit.
