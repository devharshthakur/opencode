// Attach the caveman skill to the first prompt of every session.

import { Plugin, Skill } from "@opencode/plugin"

const attached = new Map<string, boolean>()

function storageKey(sessionID: string) {
  return `caveman/attached/${sessionID}`
}

export default Plugin.define({
  id: "caveman-auto",
  async setup(ctx) {
    const controller = new AbortController()

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({
          types: ["session.deleted"],
          signal: controller.signal,
        })) {
          const sessionID = event.data.sessionID
          attached.delete(sessionID)
          try {
            await ctx.storage.remove(storageKey(sessionID))
          } catch (error) {
            console.error("caveman-auto: failed to clear session state", error)
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
    }
  },
})
