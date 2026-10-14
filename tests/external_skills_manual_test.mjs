// Offline tests for the external-skills explicit-only core.
//
// Dependency-free: Node built-in test runner and assertions only. These tests
// do NOT load the plugin, start OpenCode, or touch ~/.agents. They exercise the
// pure path-filtering and transform logic that the plugin applies at runtime.
//
// Run:
//   node --test tests/external_skills_manual_test.mjs

import test from "node:test";
import assert from "node:assert/strict";

import {
  applyExplicitOnly,
  assertSkillEditor,
  buildExternalSkillRoots,
  isSkillPathUnderRoot,
  normalizeSkillPath,
  selectExternalSkillIds,
} from "../extensions/external-skills-manual/core.mjs";

const HOME = "/Users/example";
const ROOT = `${HOME}/.agents/skills`;

// A minimal stand-in for the runtime skill transform editor. `list()` returns
// copies, `update()` mutates the stored draft, matching the real editor.
function makeEditor(skills) {
  const store = new Map(skills.map((skill) => [skill.id, { ...skill }]));
  return {
    list: () => [...store.values()].map((skill) => ({ ...skill })),
    get: (id) => store.get(id),
    update: (id, update) => {
      const skill = store.get(id);
      if (!skill) {
        throw new Error(`unknown skill: ${id}`);
      }
      update(skill);
    },
    add: (skill) => {
      store.set(skill.id, { ...skill });
    },
    snapshot: () => [...store.values()].map((skill) => ({ ...skill })),
  };
}

test("normalizeSkillPath resolves and strips trailing separators", () => {
  assert.equal(normalizeSkillPath(`${ROOT}/`), ROOT);
  assert.equal(normalizeSkillPath(`${ROOT}//`), ROOT);
  assert.equal(normalizeSkillPath(`${ROOT}/review/../review/SKILL.md`), `${ROOT}/review/SKILL.md`);
  assert.equal(normalizeSkillPath("/"), "/");
  assert.equal(normalizeSkillPath(""), null);
  assert.equal(normalizeSkillPath(undefined), null);
  assert.equal(normalizeSkillPath(42), null);
});

test("isSkillPathUnderRoot matches real external skill layouts", () => {
  assert.equal(isSkillPathUnderRoot(`${ROOT}/review/SKILL.md`, ROOT), true);
  assert.equal(isSkillPathUnderRoot(`${ROOT}/review.md`, ROOT), true);
  assert.equal(isSkillPathUnderRoot(`${ROOT}/a/b/c/SKILL.md`, ROOT), true);
  // Trailing separator on the root is tolerated.
  assert.equal(isSkillPathUnderRoot(`${ROOT}/review/SKILL.md`, `${ROOT}/`), true);
  // The root itself is treated as contained (defensive edge case).
  assert.equal(isSkillPathUnderRoot(ROOT, ROOT), true);
});

test("isSkillPathUnderRoot rejects directory-boundary lookalikes", () => {
  assert.equal(isSkillPathUnderRoot(`${ROOT}-extra/review/SKILL.md`, ROOT), false);
  assert.equal(isSkillPathUnderRoot(`${ROOT}foo/SKILL.md`, ROOT), false);
  assert.equal(isSkillPathUnderRoot(`${HOME}/.agents/skill/review/SKILL.md`, ROOT), false);
  assert.equal(isSkillPathUnderRoot(`${HOME}/.agents/skills2/review/SKILL.md`, ROOT), false);
});

test("isSkillPathUnderRoot rejects lexically escaping paths", () => {
  assert.equal(isSkillPathUnderRoot(`${ROOT}/../evil/SKILL.md`, ROOT), false);
  assert.equal(isSkillPathUnderRoot(`/Users/ht/.agents/skills-other/SKILL.md`, ROOT), false);
});

test("isSkillPathUnderRoot rejects unrelated skill sources", () => {
  assert.equal(isSkillPathUnderRoot("/Users/ht/.config/opencode/skills/build/SKILL.md", ROOT), false);
  assert.equal(isSkillPathUnderRoot("/Users/ht/.claude/skills/review/SKILL.md", ROOT), false);
  assert.equal(isSkillPathUnderRoot("/repo/.agents/skills/review/SKILL.md", ROOT), false);
  assert.equal(isSkillPathUnderRoot("", ROOT), false);
  assert.equal(isSkillPathUnderRoot(`${ROOT}/review/SKILL.md`, ""), false);
});

test("buildExternalSkillRoots includes lexical and resolved roots", () => {
  assert.deepEqual(buildExternalSkillRoots(HOME), [ROOT]);
  const withReal = buildExternalSkillRoots(HOME, () => "/System/Volumes/Data/Users/example/.agents/skills");
  assert.deepEqual(withReal, [ROOT, "/System/Volumes/Data/Users/example/.agents/skills"]);
  // A real path identical to the lexical path is not duplicated.
  assert.deepEqual(buildExternalSkillRoots(HOME, (value) => value), [ROOT]);
  // A throwing resolver falls back to the lexical root only.
  assert.deepEqual(
    buildExternalSkillRoots(HOME, () => {
      throw new Error("ENOENT");
    }),
    [ROOT],
  );
  assert.deepEqual(buildExternalSkillRoots(""), []);
});

test("selectExternalSkillIds picks only advertised external skills", () => {
  const skills = [
    { id: "code-review", path: `${ROOT}/code-review/SKILL.md` },
    { id: "handoff", path: `${ROOT}/handoff/SKILL.md`, autoinvoke: false },
    { id: "build", path: "/Users/ht/.config/opencode/skills/build/SKILL.md", autoinvoke: false },
    { id: "review", path: "/Users/ht/.config/opencode/skills/review/SKILL.md" },
    { id: "typed", path: `${ROOT}/typed.md` },
    { id: "no-path" },
    { path: `${ROOT}/anon/SKILL.md` },
    null,
  ];
  assert.deepEqual(selectExternalSkillIds(skills, [ROOT]), [
    { id: "code-review", path: `${ROOT}/code-review/SKILL.md` },
    { id: "typed", path: `${ROOT}/typed.md` },
  ]);
});

test("selectExternalSkillIds honors multiple roots (symlinked home)", () => {
  const realRoot = "/System/Volumes/Data/Users/example/.agents/skills";
  const skills = [{ id: "grilling", path: `${realRoot}/grilling/SKILL.md` }];
  assert.deepEqual(selectExternalSkillIds(skills, [ROOT, realRoot]), [
    { id: "grilling", path: `${realRoot}/grilling/SKILL.md` },
  ]);
});

test("applyExplicitOnly hides external skills and leaves everything else untouched", () => {
  const editor = makeEditor([
    { id: "code-review", path: `${ROOT}/code-review/SKILL.md`, name: "Code Review" },
    { id: "wizard", path: `${ROOT}/wizard/SKILL.md`, name: "Wizard" },
    { id: "build", path: "/Users/ht/.config/opencode/skills/build/SKILL.md", autoinvoke: false },
    { id: "review", path: "/Users/ht/.config/opencode/skills/review/SKILL.md", name: "Project Review" },
  ]);

  const applied = applyExplicitOnly(editor, [ROOT]);

  assert.deepEqual(applied, ["code-review", "wizard"]);
  assert.equal(editor.get("code-review").autoinvoke, false);
  assert.equal(editor.get("wizard").autoinvoke, false);
  // Name and path are preserved; only autoinvoke changes.
  assert.equal(editor.get("code-review").name, "Code Review");
  assert.equal(editor.get("code-review").path, `${ROOT}/code-review/SKILL.md`);
  // Non-external skills never gain an autoinvoke field.
  assert.equal("autoinvoke" in editor.get("review"), false);
  assert.equal(editor.get("build").autoinvoke, false);
});

test("applyExplicitOnly is idempotent across repeated transforms", () => {
  const editor = makeEditor([{ id: "tdd", path: `${ROOT}/tdd/SKILL.md` }]);
  assert.deepEqual(applyExplicitOnly(editor, [ROOT]), ["tdd"]);
  // Second replay: already explicit-only, so nothing to change.
  assert.deepEqual(applyExplicitOnly(editor, [ROOT]), []);
  assert.equal(editor.get("tdd").autoinvoke, false);
});

test("applyExplicitOnly covers newly discovered external skills on refresh", () => {
  const editor = makeEditor([{ id: "tdd", path: `${ROOT}/tdd/SKILL.md` }]);
  applyExplicitOnly(editor, [ROOT]);

  // Simulate the registry gaining a newly installed external skill.
  editor.add({ id: "research", path: `${ROOT}/research/SKILL.md` });
  assert.deepEqual(applyExplicitOnly(editor, [ROOT]), ["research"]);
  assert.equal(editor.get("research").autoinvoke, false);
});

test("path, not ID, decides: a same-named project skill is unaffected", () => {
  const editor = makeEditor([{ id: "review", path: "/repo/.opencode/skills/review/SKILL.md" }]);
  assert.deepEqual(applyExplicitOnly(editor, [ROOT]), []);
  assert.equal("autoinvoke" in editor.get("review"), false);
});

test("narrow editors fail loudly instead of silently doing nothing", () => {
  assert.throws(() => assertSkillEditor({ list: () => [] }), /list\(\)\/update\(\)/);
  assert.throws(() => assertSkillEditor(undefined), /list\(\)\/update\(\)/);
  // The source/list draft shape from the pinned plugin typings is not enough.
  assert.throws(() => applyExplicitOnly({ source() {}, list: () => [] }, [ROOT]), /list\(\)\/update\(\)/);
  assert.throws(
    () =>
      applyExplicitOnly(
        {
          list: () => [{ id: "x", path: `${ROOT}/x/SKILL.md` }],
          update: undefined,
        },
        [ROOT],
      ),
    /list\(\)\/update\(\)/,
  );
});
