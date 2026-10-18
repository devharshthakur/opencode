// Offline instruction contracts, not a runtime router or model-obedience test.
// No services, API calls, temporary files, or external skill installation required.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('shared evidence protocol covers sufficient, incomplete, and conflicting packets', () => {
  const protocol = read('skills/plan/references/exploration.md');
  // These synthetic cases select the written policy row, not simulated agent behavior.
  const cases = [
    ['Cited source and decisive excerpt answer the question', 'Sufficient evidence', 'synthesize'],
    ['Line citation exists but SDK behavior is unverified', 'Missing evidence', 'targeted follow-up'],
    ['Two reports disagree about an access-control invariant', 'High-risk or conflicting evidence', 'independent bounded verification'],
  ];
  for (const [scenario, condition, action] of cases) {
    const row = protocol.split('\n').find((line) => line.startsWith(`| ${condition} |`));
    assert.ok(row, `${scenario}: missing policy row`);
    assert.ok(row.includes(action), `${scenario}: missing action ${action}`);
  }
  for (const phrase of ['decisive excerpts', 'counterevidence', 'named unresolved question', 'sufficient for decision', 'external-library assumptions']) {
    assert.ok(protocol.includes(phrase), `missing evidence requirement: ${phrase}`);
  }
  assert.ok(read('AGENTS.md').includes('Evidence-first'));
  assert.ok(read('agents/explore.md').includes('evidence packet'));
});

const modes = {
  improve: ['standard', 'all'],
  'improve:quick': ['quick', 'all'],
  'improve:deep': ['deep', 'all'],
  'improve:bugs': ['standard', 'bugs'],
  'improve:security': ['standard', 'security'],
  'improve:perf': ['standard', 'perf'],
  'improve:tests': ['standard', 'tests'],
  'improve:debt': ['standard', 'debt'],
  'improve:deps': ['standard', 'deps'],
  'improve:dx': ['standard', 'dx'],
  'improve:docs': ['standard', 'docs'],
  'improve:next': ['standard', 'next'],
};

for (const [command, [depth, focus]] of Object.entries(modes)) {
  test(`/${command} routes without model overrides, shell interpolation, or worker execution`, () => {
    const text = read(`commands/${command}.md`);
    const [, frontmatter, body] = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) || [];
    assert.ok(frontmatter);
    assert.match(frontmatter, /^subagent: false$/m);
    assert.doesNotMatch(frontmatter, /^(model|agent|subtask):/m);
    assert.ok(body.includes('Load `codebase-improve` using the skill tool'));
    assert.ok(body.includes(`Depth: ${depth}. Focus: ${focus}.`));
    assert.ok(body.includes('$ARGUMENTS'));
    assert.ok(body.includes('Preserve the selected session model and agent'));
    assert.ok(body.includes('`dev`, not `chat`'));
    assert.ok(body.includes('Selection is not implementation approval'));
    assert.doesNotMatch(body, /!`/);
    assert.ok(body.split(/\s+/).length <= 150);
  });
}

test('native audit is standalone, explicit-only, and reuses staged plan approval', () => {
  const skill = read('skills/codebase-improve/SKILL.md');
  assert.match(skill, /^name: codebase-improve$/m);
  assert.match(skill, /opencode\/autoinvoke: false/);
  assert.match(skill, /- `plan`: after finding selection/);
  assert.match(skill, /- `build`: execution only, after direct approval/);
  assert.ok(skill.replace(/\s+/g, ' ').includes(
    'Approve and implement this plan locally, without isolation, commits, or publishing?',
  ));
  for (const phrase of ['## Dependencies', 'Selection is not implementation approval',
    'plan/references/exploration.md', 'under `plan`\'s shell boundary',
    'one `implement` worker', 'no plan files', 'specific missing evidence']) {
    assert.ok(skill.includes(phrase), `missing contract: ${phrase}`);
  }
  assert.doesNotMatch(skill, /Load `improve`|\.agents\/skills\/improve|open the cited code yourself|open every cited file yourself|Excerpts come from your own reads/);
  for (const focus of ['bugs', 'security', 'perf', 'tests', 'debt', 'deps', 'dx', 'docs', 'next']) {
    assert.ok(skill.includes(`| ${focus} |`), `missing focus: ${focus}`);
  }
  assert.ok(existsSync(new URL('../skills/codebase-improve/references/audit-checklist.md', import.meta.url)));
  const checklist = read('skills/codebase-improve/references/audit-checklist.md');
  assert.ok(checklist.includes('Verification'));
  assert.ok(checklist.includes('counterevidence'));
  assert.doesNotMatch(checklist, /\.agents\/skills\/improve/);
});

test('local audit references resolve without the external skill and explore stays concise', () => {
  for (const path of ['skills/codebase-improve/SKILL.md', 'skills/codebase-improve/references/audit-checklist.md']) {
    const base = dirname(fileURLToPath(new URL(`../${path}`, import.meta.url)));
    for (const [, target] of read(path).matchAll(/\]\(([^)]+\.md)\)/g)) {
      assert.ok(existsSync(resolve(base, target)), `${path}: broken reference ${target}`);
    }
  }
  const role = read('agents/explore.md').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  assert.ok(role.split(/\s+/).length <= 70);
});
