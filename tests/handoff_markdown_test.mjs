// Offline documentation/guard regressions. Not a live dispatch or model-obedience test.
// Reads files and exercises pure guards only; creates no disposable resources.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parseRecord, safeRelative } from '../extensions/handoff/evidence-input.mjs';
import { captureBaseline, captureChanges, checkFreshness } from '../extensions/handoff/review-evidence.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');
const templateRoot = 'skills/shared/handoff/templates/';
const expected = {
  'implement.md': ['Identity', 'Outcome', 'Authority and boundaries', 'Relevant context',
    'Assigned plan', 'Acceptance', 'Required validation', 'Clarification and stop conditions', 'Requested return'],
  'implement-result.md': ['Identity and status', 'Outcome', 'Changes and decisions',
    'Acceptance evidence', 'Actual validation', 'Todos', 'Deviations and clarification',
    'Preservation and scope', 'Cleanup', 'Continuation'],
  'explore.md': ['Identity', 'Questions and decisions', 'Scope and boundaries',
    'Known evidence', 'Coverage and stopping condition', 'Assigned Todos', 'Requested return'],
  'explore-result.md': ['Identity and status', 'Conclusions and supporting evidence',
    'Hypotheses and counterevidence', 'Recommendations', 'Coverage and actual checks',
    'Sufficiency and gaps', 'Targeted parent reads', 'Todos, blockers, and cleanup'],
  'verify.md': ['Identity', 'Review scope and boundaries', 'Independent baseline and changes',
    'Acceptance and required checks', 'Context and risks', 'Coverage and stopping condition', 'Requested return'],
  'verify-result.md': ['Identity and review status', 'Acceptance assessments', 'Findings',
    'Supporting evidence and actual checks', 'Freshness and coverage',
    'Gaps and targeted follow-ups', 'Todos, blockers, and cleanup'],
  'continue.md': ['Identity', 'Verified checkpoint', 'Authority and boundaries',
    'Assigned remaining work', 'Evidence and clarification', 'Requested return'],
  'report.md': ['Identity', 'Requested clarification', 'Boundaries', 'Requested return'],
};

function markdownFiles(path) {
  return readdirSync(join(root, path), { withFileTypes: true }).flatMap((entry) => {
    const next = join(path, entry.name);
    return entry.isDirectory() ? markdownFiles(next) : next.endsWith('.md') ? [next] : [];
  });
}

test('reference templates cover role information and attributable identity', () => {
  assert.deepEqual(readdirSync(join(root, templateRoot)).sort(), Object.keys(expected).sort());
  for (const [name, headings] of Object.entries(expected)) {
    const body = read(templateRoot + name);
    // Check the supplied starting points, not the layout of task-adapted prompts.
    const actual = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    for (const heading of headings) assert.ok(actual.includes(heading), `${name}: ${heading}`);
    for (const label of ['Request:', 'Task:', 'Role:']) assert.ok(body.includes(label), `${name}: ${label}`);
  }
  const implementation = read(templateRoot + 'implement.md');
  for (const label of ['Approval:', 'Scope:', 'Preserve:', 'Operation limits:',
    'Approved plan revision:', 'Assigned phases:', 'Worker discretion:', 'Fixed decisions:']) {
    assert.ok(implementation.includes(label), label);
  }
});

test('templates can adapt their layout without dropping required information', () => {
  const body = read('skills/shared/handoff.md');
  assert.match(body, /rename, reorder, merge, or add sections/);
  assert.match(body, /Preserve required information with clear labels/);
  assert.match(body, /not exact heading names or order/);
  assert.match(body, /Format flexibility\ndoes not remove safeguards or authorize extra work/);
  assert.match(read(templateRoot + 'implement.md'), /Supporting execution detail:/);
});

test('human approval plans differ from detailed agent execution briefs', () => {
  const plan = read('skills/plan/SKILL.md');
  for (const pattern of [/## Human-readable approval plan/, /human deciding whether to approve or change it/,
    /shortest plan that lets the user understand the whole proposal/,
    /Omit code snippets, line-by-line edits, exhaustive file lists/,
    /## Detailed agent handoff/, /exact validation commands\/expected results/,
    /new scope or material decisions require renewed\napproval/]) assert.match(plan, pattern);
  const approval = read('skills/shared/approval-handoff.md');
  assert.match(approval, /not the full worker execution brief/);
  assert.match(approval, /Preserve that exact approved\nplan in the handoff/);
  assert.match(read('skills/fix/SKILL.md'), /human-readable plan/);
});

test('active instructions use Markdown without stale JSON dispatch machinery', () => {
  const files = ['AGENTS.md', 'README.md', ...markdownFiles('agents'),
    ...markdownFiles('commands'), ...markdownFiles('skills')];
  const obsolete = /JSON (?:handoff|brief|assignment|exploration result|verify receipt)|validated JSON|compact JSON|detail: detailed|detailed_report|handoff\/v1|handoff\/validate\.mjs|handoff\/schemas\/|templates\/[^\s)]+\.json/;
  for (const path of files) {
    // The contract explicitly describes safe completion of attributable legacy sessions.
    const body = read(path).replace('Existing attributable JSON sessions', 'Existing attributable legacy sessions');
    assert.doesNotMatch(body, obsolete, path);
  }
  for (const name of ['dev', 'implement', 'explore', 'verify']) {
    assert.match(read(`agents/${name}.md`), /Markdown/, name);
  }
});

test('contract preserves authority, clarification, evidence, and completion safeguards', () => {
  const body = read('skills/shared/handoff.md');
  for (const pattern of [/checklist preflight/i, /actual approval/, /Never replay uncertain work/,
    /ordinary local\nimplementation choices/i, /unresolved\nrequirements/,
    /before implementing that choice/, /satisfied required checks/, /verified cleanup/,
    /contradicted\/unverified criteria/, /parent owns acceptance/i,
    /targeted reads/, /not runtime\nenforcement/]) assert.match(body, pattern);
  assert.match(read('skills/shared/approval-handoff.md'), /prohibit staging, commits, push, and PR creation/);
});

test('parent reports and user summaries have separate detail policies', () => {
  const reporting = read('skills/shared/reporting.md');
  assert.match(reporting, /detailed, self-contained reports for the parent/);
  assert.match(reporting, /concise summary rather than reproducing the worker report/);
  assert.match(reporting, /risk-based targeted reads/);
  assert.match(reporting, /No token savings are\nassumed without measurement/);
  assert.match(read(templateRoot + 'implement-result.md'), /satisfied \| contradicted \| unverified/);
  assert.match(read(templateRoot + 'implement-result.md'), /passed \| failed \| blocked \| unrun/);
});

test('report-only cannot silently become continuation or new execution', () => {
  const report = read(templateRoot + 'report.md');
  for (const pattern of [/Original request:/, /Worker session:/, /existing observations only/,
    /No edits, new commands\/checks/, /resources, dispatch, or execution/,
    /Preserve prior outcomes and unknowns/]) assert.match(report, pattern);
  const continuation = read(templateRoot + 'continue.md');
  assert.match(continuation, /Missing or conflicting state blocks execution/);
  assert.match(continuation, /completed steps are\ncontext, not assignments/);
});

test('contract/template links resolve and worked example is explicitly fictional', () => {
  const paths = ['skills/shared/handoff.md', 'skills/shared/handoff/example.md',
    ...Object.keys(expected).map((name) => templateRoot + name)];
  for (const path of paths) {
    for (const [, target] of read(path).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^https?:/.test(target)) continue;
      assert.ok(existsSync(resolve(root, dirname(path), target.split('#')[0])), `${path}: ${target}`);
    }
  }
  assert.match(read('skills/shared/handoff/example.md'), /fictional/);
});

test('obsolete validator/schema dependencies are removed; evidence utility imports work', () => {
  for (const path of ['extensions/handoff/validate.mjs',
    ...['common', 'request', 'result'].map((name) => `extensions/handoff/schemas/${name}.schema.json`)]) {
    assert.equal(existsSync(join(root, path)), false, path);
  }
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.dependencies.ajv, undefined);
  assert.deepEqual(pkg.dependencies, lock.packages[''].dependencies);
  for (const name of ['ajv', 'fast-deep-equal', 'fast-uri', 'json-schema-traverse', 'require-from-string']) {
    assert.equal(lock.packages[`node_modules/${name}`], undefined, name);
    for (const entry of Object.values(lock.packages)) assert.equal(entry.dependencies?.[name], undefined, name);
  }
  for (const fn of [captureBaseline, captureChanges, checkFreshness]) assert.equal(typeof fn, 'function');
});

test('retained evidence input guards reject ambiguous JSON and unsafe paths', () => {
  assert.deepEqual(parseRecord('{"a":[{"b":1},{"b":2}],"text":"{},:"}'),
    { a: [{ b: 1 }, { b: 2 }], text: '{},:' });
  for (const text of ['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '{"nested":{"x":1,"x":2}}']) {
    assert.throws(() => parseRecord(text), /DUPLICATE_JSON_KEY/);
  }
  assert.throws(() => parseRecord('{'), /INVALID_JSON/);
  assert.throws(() => parseRecord(' '.repeat(2_000_001)), /PAYLOAD_TOO_LARGE/);
  for (const path of ['.', 'src/', 'src/file.ts']) assert.equal(safeRelative(path), true, path);
  for (const path of ['', '/absolute', '../outside', 'src/../outside', 'src//file', '-flag', 'a\\b', 'a\0b']) {
    assert.equal(safeRelative(path), false, path);
  }
});
