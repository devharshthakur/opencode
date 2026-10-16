// Pure, offline-testable discovery policy. This is not an authorization boundary.
import { isAbsolute, join, normalize, sep } from 'node:path';

// Built-in OpenCode guidance is outside these external roots and stays discoverable.
export const CURATED_SKILLS = Object.freeze([
  'codebase-design',
  'diagnosing-bugs',
  'domain-modeling',
  'tdd',
  'writing-for-agents',
]);

export function normalizeSkillPath(value) {
  if (typeof value !== 'string' || !isAbsolute(value)) return null;
  const path = normalize(value);
  return path.length > 1 && path.endsWith(sep) ? path.slice(0, -sep.length) : path;
}

export function isSkillPathUnderRoot(value, root) {
  const path = normalizeSkillPath(value);
  const base = normalizeSkillPath(root);
  return path !== null && base !== null && (path === base || path.startsWith(base + sep));
}

export function buildExternalSkillRoots(home, resolveRealPath = (path) => path) {
  const base = normalizeSkillPath(typeof home === 'string' ? join(home, '.agents', 'skills') : null);
  if (!base) return [];
  const roots = [base];
  try {
    const real = normalizeSkillPath(resolveRealPath(base));
    if (real && !roots.includes(real)) roots.push(real);
  } catch {
    // The directory may not exist yet; registry refresh can discover later installs.
  }
  return roots;
}

export function applySkillPolicy(editor, roots, curated = CURATED_SKILLS) {
  if (!editor || typeof editor.list !== 'function' || typeof editor.update !== 'function') {
    throw new Error('skill-policy requires the V2 skill editor list()/update(); no fallback applied');
  }
  const allowed = new Set(curated);
  const changed = [];
  for (const skill of editor.list()) {
    if (!skill || typeof skill.id !== 'string' || !skill.id || allowed.has(skill.id)) continue;
    if (!roots.some((root) => isSkillPathUnderRoot(skill.path, root))) continue;
    if (skill.autoinvoke === false) continue;
    editor.update(skill.id, (draft) => {
      draft.autoinvoke = false;
    });
    changed.push(skill.id);
  }
  // Curated skills retain the publisher's original setting, including explicit-only.
  return changed;
}
