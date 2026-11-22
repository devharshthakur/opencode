// Attach a command's core skill from its trailing marker.
// Attachments reset after compaction so the skill is attached again.

import { Plugin, Skill } from "@opencode/plugin"

const attached = new Set<string>()

const marker = /\n?<!--\s*opencode:skill\s+([a-z0-9-]+)\s*-->\s*$/

function clearSession(sessionID: string) {
  const prefix = `${sessionID}:`
  for (const key of attached) {
    if (key.startsWith(prefix)) attached.delete(key)
  }
}

export default Plugin.define({
  id: "command-skills",
  async setup(ctx) {
    const controller = new AbortController()

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({
          types: ["session.deleted", "session.compaction.ended"],
          signal: controller.signal,
        })) {
          clearSession(event.data.sessionID)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("command-skills: event subscription failed", error)
        }
      }
    })()

    await ctx.session.hook("prompt", async (event) => {
      const match = marker.exec(event.prompt.text)
      if (!match) return

      const skillID = match[1]
      const key = `${event.sessionID}:${skillID}`

      if (attached.has(key)) {
        event.prompt.text = event.prompt.text.slice(0, match.index).trimEnd()
        return
      }

      try {
        const skill = (await ctx.skill.list()).data.find((item) => item.id === skillID)
        if (!skill) {
          console.error("command-skills: skill not found", skillID)
          return
        }

        event.prompt.skills ??= []
        if (!event.prompt.skills.some((item) => item.id === skill.id)) {
          event.prompt.skills.push({ id: Skill.ID.make(skill.id) })
        }
        attached.add(key)
        event.prompt.text = event.prompt.text.slice(0, match.index).trimEnd()
      } catch (error) {
        console.error("command-skills: failed to attach skill", error)
      }
    })

    return () => {
      controller.abort()
      attached.clear()
    }
  },
})
