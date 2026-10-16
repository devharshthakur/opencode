import test from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../plugins/skill-policy.js';
import { homedir } from 'node:os';
import {
  CURATED_SKILLS,
  applySkillPolicy,
  buildExternalSkillRoots,
  isSkillPathUnderRoot,
  normalizeSkillPath,
} from '../extensions/skill-policy/core.mjs';

const HOME = '/Users/example';
const ROOT = `${HOME}/.agents/skills`;
const external = (id, extra = {}) => ({ id, path: `${ROOT}/${id}/SKILL.md`, ...extra });

function editorFor(skills) {
  const store = new Map(skills.map((skill) => [skill.id, { ...skill }]));
  return {
    list: () => [...store.values()].map((skill) => ({ ...skill })),
    get: (id) => store.get(id),
    update: (id, update) => update(store.get(id)),
    add: (skill) => store.set(skill.id, { ...skill }),
  };
}

test('paths must be absolute; normalization preserves directory boundaries', () => {
  assert.equal(normalizeSkillPath(`${ROOT}//a/../`), ROOT);
  assert.equal(normalizeSkillPath('/'), '/');
  for (const invalid of ['', undefined, 3, 'relative/path']) {
    assert.equal(normalizeSkillPath(invalid), null);
  }
  assert.equal(isSkillPathUnderRoot(`${ROOT}/a/SKILL.md`, ROOT), true);
  assert.equal(isSkillPathUnderRoot(ROOT, `${ROOT}/`), true);
  for (const path of [`${ROOT}-extra/a`, `${ROOT}foo/a`, `${ROOT}/../other/a`]) {
    assert.equal(isSkillPathUnderRoot(path, ROOT), false);
  }
});

test('roots include lexical and resolved homes and tolerate missing directories', () => {
  assert.deepEqual(buildExternalSkillRoots(HOME), [ROOT]);
  assert.deepEqual(buildExternalSkillRoots(HOME, () => '/real/skills'), [ROOT, '/real/skills']);
  assert.deepEqual(buildExternalSkillRoots(HOME, () => { throw new Error('missing'); }), [ROOT]);
  assert.deepEqual(buildExternalSkillRoots(null), []);
  assert.deepEqual(buildExternalSkillRoots(''), []);
});

test('curated methods remain discoverable without changing publisher fields', () => {
  const skills = CURATED_SKILLS.map((id) => external(id, { name: id, description: 'original' }));
  const editor = editorFor(skills);
  assert.deepEqual(applySkillPolicy(editor, [ROOT]), []);
  assert.deepEqual(editor.list(), skills);
});

test('curation never overrides upstream explicit-only declarations', () => {
  const editor = editorFor([external('tdd', { autoinvoke: false })]);
  applySkillPolicy(editor, [ROOT]);
  assert.equal(editor.get('tdd').autoinvoke, false);
});

test('non-curated external skills become manual but stay registered and intact', () => {
  const original = external('research', { name: 'Research', content: 'original content' });
  const editor = editorFor([original]);
  assert.deepEqual(applySkillPolicy(editor, [ROOT]), ['research']);
  assert.deepEqual(editor.get('research'), { ...original, autoinvoke: false });
  assert.equal(original.autoinvoke, undefined);
  assert.equal(editor.list().length, 1);
});

test('existing manual skills are idempotent', () => {
  const editor = editorFor([external('research'), external('handoff', { autoinvoke: false })]);
  assert.deepEqual(applySkillPolicy(editor, [ROOT]), ['research']);
  assert.deepEqual(applySkillPolicy(editor, [ROOT]), []);
});

test('same-named native/project/compatibility skills are unaffected', () => {
  const skills = [
    { id: 'research', path: '/repo/.opencode/skills/research/SKILL.md' },
    { id: 'review', path: '/repo/.agents/skills/review/SKILL.md' },
    { id: 'build', path: `${HOME}/.config/opencode/skills/build/SKILL.md` },
    { id: 'other', path: `${HOME}/.claude/skills/other/SKILL.md` },
  ];
  const editor = editorFor(skills);
  applySkillPolicy(editor, [ROOT]);
  assert.deepEqual(editor.list(), skills);
});

test('resolved root and nested external skills are covered', () => {
  const editor = editorFor([{ id: 'other', path: '/real/skills/team/other/SKILL.md' }]);
  assert.deepEqual(applySkillPolicy(editor, [ROOT, '/real/skills']), ['other']);
});

test('newly installed external skills become manual on registry refresh', () => {
  const editor = editorFor([external('tdd')]);
  applySkillPolicy(editor, [ROOT]);
  editor.add(external('new-method'));
  assert.deepEqual(applySkillPolicy(editor, [ROOT]), ['new-method']);
  assert.equal(editor.get('new-method').autoinvoke, false);
});

test('a fresh rebuild uses the current curated policy without mutating sources', () => {
  const source = external('research');
  const old = editorFor([source]);
  applySkillPolicy(old, [ROOT]);
  const fresh = editorFor([source]);
  applySkillPolicy(fresh, [ROOT], ['research']);
  assert.equal(fresh.get('research').autoinvoke, undefined);
  assert.equal(source.autoinvoke, undefined);
});

test('malformed entries do not change unrelated definitions', () => {
  const skills = [{ id: '', path: `${ROOT}/x` }, { id: 'no-path' }, { id: 'relative', path: 'x' }];
  const editor = editorFor(skills);
  assert.deepEqual(applySkillPolicy(editor, [ROOT]), []);
  assert.deepEqual(editor.list(), skills);
});

test('unsupported editors fail loudly rather than silently dropping the policy', () => {
  for (const editor of [undefined, {}, { list: () => [] }, { update() {} }]) {
    assert.throws(() => applySkillPolicy(editor, [ROOT]), /list\(\)\/update\(\)/);
  }
});

test('plugin waits for prompt admission so late filesystem skills are present', async () => {
  let admit;
  let calls = 0;
  const roots = buildExternalSkillRoots(homedir());
  const editor = editorFor([]);
  await plugin.setup({
    session: { hook: async (name, callback) => {
      assert.equal(name, 'prompt');
      admit = callback;
    } },
    skill: { transform: async (callback) => {
      calls += 1;
      callback(editor);
      return { dispose: async () => {} };
    } },
  });
  assert.equal(calls, 0);
  editor.add({ id: 'research', path: `${roots[0]}/research/SKILL.md` });
  await admit();
  assert.equal(calls, 1);
  assert.equal(editor.get('research').autoinvoke, false);
});

test('repeated/concurrent admissions replace the policy without a registration gap', async () => {
  let admit;
  let serial = 0;
  const events = [];
  await plugin.setup({
    session: { hook: async (_, callback) => { admit = callback; } },
    skill: { transform: async () => {
      const id = ++serial;
      events.push(`add:${id}`);
      return { dispose: async () => { events.push(`dispose:${id}`); } };
    } },
  });
  await Promise.all([admit(), admit(), admit()]);
  assert.deepEqual(events, ['add:1', 'add:2', 'dispose:1', 'add:3', 'dispose:2']);
});

test('missing runtime prompt hooks fail explicitly, without a fake filtering fallback', async () => {
  await assert.rejects(plugin.setup({ skill: {} }), /V2 prompt hook/);
});
