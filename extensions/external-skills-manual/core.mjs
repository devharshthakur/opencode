// External skills explicit-only core (runtime-independent, experimental).
//
// Dependency-free: uses only the Node built-in "node:path" module. This module
// does not load as a plugin, start services, or call any OpenCode API. The
// plugin in plugins/external-skills-manual.js imports these helpers and feeds
// them the live skill transform editor.
//
// Purpose: mark skills whose registered path lives under the global external
// skills directory (~/.agents/skills) as explicit-only by setting their
// `autoinvoke` to false. Matching is by absolute path, never by skill ID, so a
// project or native skill that happens to share an ID is unaffected.
//
// Honest boundaries:
// - This hides skills from the model's automatic available list. It is NOT a
//   security barrier: a caller who knows an ID can still load the skill
//   explicitly, and this never edits the publisher's files.
// - Path matching is lexical over the registry-provided absolute path. The
//   plugin also supplies the resolved real path of the root so symlinked
//   layouts are covered, but no filesystem ownership or containment proof is
//   claimed for arbitrary incoming paths.

import { join, normalize, sep } from "node:path";

export const MODULE_ID = "external-skills-manual/core";

// The global external skills directory, relative to the user's home directory.
export const EXTERNAL_SKILLS_SUFFIX = Object.freeze([".agents", "skills"]);

// Normalize a path for comparison: resolve "." and ".." lexically and drop a
// trailing separator (except for the filesystem root). Returns null for
// non-strings or empty strings.
export function normalizeSkillPath(value) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  const normalized = normalize(value);
  if (normalized.length > 1 && normalized.endsWith(sep)) {
    return normalized.slice(0, -sep.length);
  }
  return normalized;
}

// True only when `skillPath` is the root itself or a descendant of it. A
// trailing-separator boundary check rejects lookalikes such as
// "…/.agents/skills-extra" or "…/.agents/skillsfoo".
export function isSkillPathUnderRoot(skillPath, root) {
  const path = normalizeSkillPath(skillPath);
  const base = normalizeSkillPath(root);
  if (path === null || base === null) {
    return false;
  }
  if (path === base) {
    return true;
  }
  return path.startsWith(base + sep);
}

// Build the set of root paths to match against: the lexical external skills
// directory and, when it resolves differently (for example, a symlinked home
// directory), its real path. `resolveRealPath` is injected so the core stays
// pure and offline-testable; the plugin passes `fs.realpathSync`.
export function buildExternalSkillRoots(homeDirectory, resolveRealPath = (value) => value) {
  if (typeof homeDirectory !== "string" || homeDirectory.length === 0) {
    return [];
  }
  const base = normalizeSkillPath(join(homeDirectory, ...EXTERNAL_SKILLS_SUFFIX));
  if (base === null) {
    return [];
  }
  const roots = [base];
  try {
    const real = normalizeSkillPath(resolveRealPath(base));
    if (real !== null && !roots.includes(real)) {
      roots.push(real);
    }
  } catch {
    // The directory may not exist yet; the lexical root still covers future
    // installs once the registry reports a path under it.
  }
  return roots;
}

// Entries whose registered path is under any root and that are not already
// explicit-only. Pure: consumes and returns plain data, never mutates input.
export function selectExternalSkillIds(skills, roots) {
  const rootList = (Array.isArray(roots) ? roots : [roots]).filter((root) => root !== null && root !== undefined);
  const selected = [];
  if (!Array.isArray(skills)) {
    return selected;
  }
  for (const skill of skills) {
    if (!skill || typeof skill !== "object") {
      continue;
    }
    if (typeof skill.id !== "string" || skill.id.length === 0) {
      continue;
    }
    if (skill.autoinvoke === false) {
      continue;
    }
    if (typeof skill.path !== "string" || skill.path.length === 0) {
      continue;
    }
    if (rootList.some((root) => isSkillPathUnderRoot(skill.path, root))) {
      selected.push({ id: skill.id, path: skill.path });
    }
  }
  return selected;
}

// The live skill transform editor must expose list() and update(); anything
// narrower means the installed runtime cannot set autoinvoke. Fail loudly
// rather than silently doing nothing.
export function assertSkillEditor(editor) {
  if (!editor || typeof editor.list !== "function" || typeof editor.update !== "function") {
    throw new Error(
      "external-skills-manual: skill transform editor does not expose list()/update(); " +
        "cannot set autoinvoke=false and no fallback is applied",
    );
  }
}

// Apply the explicit-only policy through a skill transform editor. Returns the
// IDs whose autoinvoke was set to false. Re-run on each registry rebuild to
// cover newly discovered skills.
export function applyExplicitOnly(editor, roots) {
  assertSkillEditor(editor);
  const selected = selectExternalSkillIds(editor.list(), roots);
  for (const entry of selected) {
    editor.update(entry.id, (skill) => {
      skill.autoinvoke = false;
    });
  }
  return selected.map((entry) => entry.id);
}
