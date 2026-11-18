// Inject an English-output rule into every model request.

import { Plugin } from "@opencode/plugin"

const source = "language/english-output"

const rule = [
  "Language: write every user-visible output in English.",
  "This covers replies, plans, todos, questions, handoffs, reports, session titles,",
  "commit messages, pull request text, code comments, and documentation you write.",
  "Keep code, identifiers, paths, commands, logs, and quoted error text verbatim;",
  "do not translate them.",
  "Preserve existing non-English text you did not write, and use another language",
  "only when the user explicitly asks for it in that specific output.",
].join(" ")

type SystemParts = Array<{ type: "text"; text: string; metadata?: Record<string, unknown> }>

function inject(system: SystemParts) {
  if (system.some((part) => part.metadata?.source === source)) return
  system.push({ type: "text", text: rule, metadata: { source } })
}

export default Plugin.define({
  id: "english-output",
  async setup(ctx) {
    const registrations = await Promise.all([
      ctx.session.hook("context", (event) => inject(event.system)),
      ctx.session.hook("compaction", (event) => inject(event.system)),
      ctx.session.hook("generate", (event) => inject(event.system)),
      ctx.session.hook("title", (event) => inject(event.system)),
    ])

    return async () => {
      await Promise.all(registrations.map((registration) => registration.dispose()))
    }
  },
})
