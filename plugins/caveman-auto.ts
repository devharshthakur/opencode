// Attach the caveman skill once per compaction cycle.

import { Plugin, Skill } from "@opencode/plugin"

const attached = new Map<string, boolean>()
const compactionRequested = new Set<string>()

function storageKey(sessionID: string) {
  return `caveman/attached/${sessionID}`
}

const COMPACTION_THRESHOLD = 180_000

export default Plugin.define({
  id: "caveman-auto",
  async setup(ctx) {
    const controller = new AbortController()

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({
          types: ["session.deleted", "session.compaction.ended", "session.compaction.failed", "session.step.ended"],
          signal: controller.signal,
        })) {
          const sessionID = event.data.sessionID

          if (event.type === "session.deleted") {
            attached.delete(sessionID)
            compactionRequested.delete(sessionID)
            try {
              await ctx.storage.remove(storageKey(sessionID))
            } catch (error) {
              console.error("caveman-auto: failed to clear session state", error)
            }
            continue
          }

          if (event.type === "session.compaction.ended") {
            attached.delete(sessionID)
            compactionRequested.delete(sessionID)
            try {
              await ctx.storage.remove(storageKey(sessionID))
            } catch (error) {
              console.error("caveman-auto: failed to reset session state after compaction", error)
            }
            continue
          }

          if (event.type === "session.compaction.failed") {
            compactionRequested.delete(sessionID)
            continue
          }

          const usage = event.data.tokens
          const contextTokens = usage.input + usage.cache.read
          if (contextTokens >= COMPACTION_THRESHOLD && !compactionRequested.has(sessionID)) {
            compactionRequested.add(sessionID)
            try {
              await ctx.session.compact({ sessionID })
            } catch (error) {
              compactionRequested.delete(sessionID)
              console.error("caveman-auto: failed to request compaction", error)
            }
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("caveman-auto: event subscription failed", error)
        }
      }
    })()

    await ctx.session.hook("prompt", async (event) => {
      const key = storageKey(event.sessionID)
      let seen = attached.get(event.sessionID)

      if (seen === undefined) {
        try {
          seen = (await ctx.storage.get(key)) === true
        } catch (error) {
          console.error("caveman-auto: failed to read session state", error)
          seen = false
        }
        if (seen) attached.set(event.sessionID, true)
      }

      if (seen) return

      try {
        const skill = (await ctx.skill.list()).data.find((item) => item.id === "caveman")
        if (!skill) return

        event.prompt.skills ??= []
        if (!event.prompt.skills.some((item) => item.id === skill.id)) {
          event.prompt.skills.push({ id: Skill.ID.make(skill.id) })
        }
        attached.set(event.sessionID, true)
        try {
          await ctx.storage.set(key, true)
        } catch (error) {
          console.error("caveman-auto: failed to save session state", error)
        }
      } catch (error) {
        console.error("caveman-auto: failed to attach skill", error)
      }
    })

    return () => {
      controller.abort()
      attached.clear()
      compactionRequested.clear()
    }
  },
})
