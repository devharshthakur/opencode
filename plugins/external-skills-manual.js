// Make globally installed external skills explicit-only in OpenCode.
//
// Auto-discovered from the global plugins directory (~/.config/opencode/plugins).
// Dependency-free: a plain V2 plugin object using only Node built-ins plus the
// local, runtime-independent core. It does not import @opencode-ai/plugin and
// does not edit any skill files.
//
// On load it registers a skill transform that sets `autoinvoke` to false on
// registered skills whose path is under ~/.agents/skills. The transform is
// replayed whenever OpenCode rebuilds its skill registry, so newly installed
// external skills are covered on the next refresh. Skills remain registered and
// loadable by exact ID; only the model's automatic available list changes.
//
// Matching is by registered absolute path, not by skill ID, so same-named
// project or native skills are untouched. Publisher files under ~/.agents are
// never modified.

import { realpathSync } from "node:fs";
import { homedir } from "node:os";
import {
  applyExplicitOnly,
  buildExternalSkillRoots,
} from "../extensions/external-skills-manual/core.mjs";

const PLUGIN_ID = "local.external-skills-manual";

function externalSkillRoots() {
  return buildExternalSkillRoots(homedir(), realpathSync);
}

export default {
  id: PLUGIN_ID,
  async setup(ctx) {
    await ctx.skill.transform((editor) => {
      applyExplicitOnly(editor, externalSkillRoots());
    });
  },
};
