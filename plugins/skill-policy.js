// Filter discovery only; publisher files and explicit skill loading stay intact.
import { realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { applySkillPolicy, buildExternalSkillRoots } from '../extensions/skill-policy/core.mjs';

export default {
  id: 'local.skill-policy',
  async setup(ctx) {
    if (typeof ctx.session?.hook !== 'function') {
      throw new Error('skill-policy requires the documented V2 prompt hook; no fallback applied');
    }
    const roots = buildExternalSkillRoots(homedir(), realpathSync);
    let registration;
    let pending = Promise.resolve();
    // Filesystem skill sources can register after local-plugin setup. Install
    // the policy at prompt admission, when location plugins are ready, so its
    // transform runs after those sources and before skill/model preparation.
    await ctx.session.hook('prompt', () => {
      pending = pending.then(async () => {
        const next = await ctx.skill.transform((editor) => applySkillPolicy(editor, roots));
        const previous = registration;
        registration = next;
        // Register the replacement first: never open an unfiltered gap.
        if (previous) await previous.dispose();
      });
      return pending;
    });
  },
};
