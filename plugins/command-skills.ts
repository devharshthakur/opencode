// Attach a command's core skill from its trailing marker.

import { Plugin, Skill } from "@opencode/plugin"

const attached = new Set<string>()

const marker = /\n?<!--\s*opencode:skill\s+([a-z0-9-]+)\s*-->\s*$/

export default Plugin.define({
  id: "command-skills",
  async setup(ctx) {
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
      attached.clear()
    }
  },
})
