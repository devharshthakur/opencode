// Local validation only: no dispatch, approval authentication, or payload execution.
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { isAbsolute, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const schema = (name) => JSON.parse(readFileSync(new URL(`./schemas/${name}.schema.json`, import.meta.url), 'utf8'));
const ajv = new Ajv({ strict: true, allErrors: true, ownProperties: true });
ajv.addSchema(schema('common'));
const validators = { request: ajv.compile(schema('request')), result: ajv.compile(schema('result')) };
const issue = (path, code) => ({ path, code });
const within = (path, scopes) => scopes.some((s) => s === '.' || path === s || (s.endsWith('/') && path.startsWith(s)));
export const safeRelative = (path) => typeof path === 'string' && path.length > 0 && !isAbsolute(path)
  && !path.includes('\\') && !path.includes('\0') && !path.startsWith('-')
  && (path === '.' || (posix.normalize(path).replace(/\/$/, '') === path.replace(/\/$/, '') && !path.split('/').includes('..')));

export function validateRecord(type, record, request = null, previous = null) {
  const validate = Object.hasOwn(validators, type) ? validators[type] : null;
  if (!validate) return { valid: false, errors: [issue('/', 'UNKNOWN_RECORD_TYPE')] };
  if (!validate(record)) return { valid: false, errors: validate.errors.slice(0, 30).map((e) => issue(e.instancePath || '/', `SCHEMA_${e.keyword.toUpperCase()}`)) };
  const errors = [];
  const fail = (path, code) => errors.push(issue(path, code));
  if (type === 'result') {
    if (!request) return { valid: false, errors: [issue('/', 'REQUEST_REQUIRED')] };
    if (!validateRecord('request', request, null, previous).valid) return { valid: false, errors: [issue('/', 'INVALID_REQUEST')] };
    if (record.request_id !== request.request_id || record.task_id !== request.task.id || record.kind !== request.kind) return { valid: false, errors: [issue('/', 'REQUEST_MISMATCH')] };
  }
  const unique = (items, path) => {
    const seen = new Set();
    for (const [i, item] of (items || []).entries()) {
      if (seen.has(item.id)) fail(`${path}/${i}/id`, 'DUPLICATE_ID');
      seen.add(item.id);
    }
    return seen;
  };
  for (const key of ['evidence', 'todos', 'acceptance', 'validation', 'checks']) unique(record[key], `/${key}`);
  for (const key of ['evidence', 'parent_reads', 'findings']) {
    for (const [i, item] of (record[key] || []).entries()) {
      if (item.start_line > item.end_line) fail(`/${key}/${i}`, 'REVERSED_LINES');
    }
  }
  const inputEvidence = type === 'result' ? (request?.operation === 'report' ? previous?.evidence : request?.evidence) || [] : [];
  const evidenceIds = new Set([...inputEvidence, ...(record.evidence || [])].map((e) => e.id));
  for (const e of record.evidence || []) if (inputEvidence.some((input) => input.id === e.id)) fail('/evidence', 'EVIDENCE_ID_REDEFINED');
  const referencedChecks = record.validation || record.checks || record.review?.validation_plan || [];
  unique(record.review?.validation_plan, '/review/validation_plan');
  if (type === 'request') for (const [i, check] of referencedChecks.entries()) {
    if (!isAbsolute(check.workdir)) fail(`/validation/${i}/workdir`, 'ABSOLUTE_PATH_REQUIRED');
  }
  const checkIds = new Set(referencedChecks.map((c) => c.id));
  const refs = (ids, known, path) => { for (const id of ids || []) if (!known.has(id)) fail(path, 'UNKNOWN_REFERENCE'); };
  for (const key of ['conclusions', 'todos', 'acceptance', 'findings']) {
    for (const [i, item] of (record[key] || []).entries()) {
      refs(item.evidence_ids, evidenceIds, `/${key}/${i}/evidence_ids`);
      refs(item.check_ids, checkIds, `/${key}/${i}/check_ids`);
    }
  }
  if (type === 'request') {
    if (!isAbsolute(record.task.repository)) fail('/task/repository', 'ABSOLUTE_PATH_REQUIRED');
    if (record.operation === 'report') {
      if (!previous) fail('/previous_request_id', 'PREVIOUS_REQUEST_REQUIRED');
      else {
        const prior = validateRecord('request', previous);
        if (!prior.valid || previous.operation !== 'work') return { valid: false, errors: [issue('/previous_request_id', 'INVALID_PREVIOUS_REQUEST')] };
        if (record.previous_request_id !== previous.request_id || record.kind !== previous.kind
          || ['id', 'title', 'repository'].some((key) => record.task[key] !== previous.task[key]) || record.request_id === previous.request_id) fail('/previous_request_id', 'CONTINUATION_MISMATCH');
      }
    } else {
      for (const key of ['paths', 'excludes']) for (const [i, path] of record.scope[key].entries()) {
        if (!safeRelative(path)) fail(`/scope/${key}/${i}`, 'UNSAFE_SCOPE_PATH');
      }
      if (record.kind === 'implement') {
        const a = record.authorization, x = record.execution;
        if (!isAbsolute(x.original_checkout)) fail('/execution/original_checkout', 'ABSOLUTE_PATH_REQUIRED');
        for (const [i, todo] of record.todos.entries()) if (!a.approved_phases.includes(todo.phase)) fail(`/todos/${i}/phase`, 'UNAPPROVED_PHASE');
        if (x.dispatch_mode === 'per-todo-worker' && record.todos.length !== 1) fail('/todos', 'ONE_TODO_REQUIRED');
        const expected = { current: [false, false], branch: [true, false], worktree: [true, true] }[x.isolation];
        if (a.create_branch !== expected[0] || a.create_worktree !== expected[1]) fail('/authorization', 'ISOLATION_MISMATCH');
        if (x.isolation !== 'current' && !record.authorized_skills.includes('git-isolation')) fail('/authorized_skills', 'ISOLATION_SKILL_REQUIRED');
        if (!record.authorized_skills.includes('build')) fail('/authorized_skills', 'BUILD_REQUIRED');
        if (record.validation.length && !a.validate) fail('/validation', 'VALIDATION_NOT_AUTHORIZED');
        if ((x.worker_state === 'not_started') !== (x.worker_session_id === null)) fail('/execution/worker_session_id', 'WORKER_STATE_MISMATCH');
      }
      if (record.kind === 'verify') {
        if (!isAbsolute(record.review.manifest_path)) fail('/review/manifest_path', 'ABSOLUTE_PATH_REQUIRED');
        const proof = record.review.freshness_proof;
        if (proof.snapshot_id !== record.review.snapshot_id || (proof.freshness === 'matched' && !Number.isFinite(Date.parse(proof.observed_at)))) fail('/review/freshness_proof', 'FRESHNESS_PROOF_MISMATCH');
        const receipt = record.review.implement_receipt;
        if (!validators.result(receipt) || receipt.kind !== 'implement' || receipt.request_id !== record.review.implement_request_id || receipt.task_id !== record.task.id) fail('/review/implement_receipt', 'RECEIPT_MISMATCH');
      }
    }
  } else {
    if (request.output?.detail !== 'detailed' && record.detailed_report) fail('/detailed_report', 'DETAIL_NOT_REQUESTED');
    if (request.output?.detail === 'detailed' && !record.detailed_report) fail('/detailed_report', 'DETAIL_REQUIRED');
    if (record.status === 'blocked' && !record.blockers.length) fail('/blockers', 'BLOCKER_REQUIRED');
    if (record.status === 'completed' && (record.blockers.length || record.cleanup.status === 'incomplete')) fail('/status', 'INCOMPLETE_WORK');
    if (record.cleanup.status === 'none_created' && record.cleanup.retained.length) fail('/cleanup', 'CLEANUP_MISMATCH');
    const work = request.operation === 'report' ? previous : request;
    if (work) {
      const assigned = new Map((work.todos || []).map((t) => [t.id, t]));
      if (record.todos.length !== assigned.size) fail('/todos', 'TODO_COVERAGE_MISMATCH');
      for (const [i, t] of record.todos.entries()) {
        const original = assigned.get(t.id);
        if (!original || original.phase !== t.phase || original.content !== t.content) fail(`/todos/${i}`, 'TODO_ASSIGNMENT_MISMATCH');
        if (original && ['completed', 'cancelled'].includes(original.status) && original.status !== t.status) fail(`/todos/${i}`, 'TERMINAL_TODO_REPLAY');
        if (t.status === 'cancelled' && original?.status !== 'cancelled') fail(`/todos/${i}`, 'CANCELLATION_NOT_AUTHORIZED');
        if (t.status === 'completed' && !t.evidence_ids.length) fail(`/todos/${i}/evidence_ids`, 'COMPLETION_PROOF_REQUIRED');
        if (record.status === 'completed' && !['completed', 'cancelled'].includes(t.status)) fail(`/todos/${i}`, 'TODO_INCOMPLETE');
      }
      const criteria = new Set((work.acceptance || []).map((c) => c.id));
      if (record.kind !== 'explore') {
        if (record.acceptance.length !== criteria.size) fail('/acceptance', 'ACCEPTANCE_COVERAGE_MISMATCH');
        for (const [i, a] of record.acceptance.entries()) {
          if (!criteria.has(a.id)) fail(`/acceptance/${i}`, 'UNKNOWN_CRITERION');
          if (a.status === 'supported' && !a.evidence_ids.length && !a.check_ids.length) fail(`/acceptance/${i}`, 'SUPPORT_REQUIRED');
          if (a.status === 'supported' && a.check_ids.some((id) => record.checks.find((c) => c.id === id)?.status !== 'passed')) fail(`/acceptance/${i}`, 'CHECK_DOES_NOT_SUPPORT_ACCEPTANCE');
          if (record.kind === 'implement' && record.status === 'completed' && a.status !== 'supported') fail('/status', 'ACCEPTANCE_NOT_PROVED');
        }
      }
      for (const [i, finding] of (record.findings || []).entries()) {
        refs(finding.criterion_ids, criteria, `/findings/${i}/criterion_ids`);
        if (!finding.evidence_ids.length) fail(`/findings/${i}`, 'FINDING_EVIDENCE_REQUIRED');
      }
      if (record.kind === 'implement') {
        for (const [i, path] of record.changed_paths.entries()) if (!safeRelative(path) || !within(path, work.scope.paths) || within(path, work.scope.excludes)) fail(`/changed_paths/${i}`, 'OUT_OF_SCOPE_CHANGE');
        if (record.changed_paths.length && !work.authorization.edit) fail('/changed_paths', 'EDITS_NOT_AUTHORIZED');
        for (const c of work.validation) {
          const actual = record.checks.find((x) => x.id === c.id);
          if (actual && actual.command !== c.command) fail('/checks', 'CHECK_COMMAND_MISMATCH');
          if (actual?.status === 'baseline_failed' && !c.baseline) fail('/checks', 'BASELINE_NOT_RECORDED');
          if (record.status === 'completed' && c.required && (!actual || !['passed', 'baseline_failed'].includes(actual.status))) fail('/checks', 'REQUIRED_CHECK_NOT_PROVED');
        }
      }
      if (record.kind === 'verify') {
        if (record.snapshot_id !== work.review.snapshot_id) fail('/snapshot_id', 'SNAPSHOT_MISMATCH');
        if (record.freshness === 'matched' && work.review.freshness_proof.freshness !== 'matched') fail('/freshness', 'PARENT_FRESHNESS_REQUIRED');
        if (record.status === 'completed' && record.freshness !== 'matched') fail('/freshness', 'FRESHNESS_NOT_PROVED');
      }
    }
    if (record.kind === 'explore') {
      if (record.sufficiency === 'sufficient' && (!record.conclusions.length || !evidenceIds.size || record.next_lookup !== null || record.status !== 'completed')) fail('/sufficiency', 'INSUFFICIENT_SUPPORT');
      if (record.sufficiency !== 'sufficient' && !record.next_lookup?.trim()) fail('/next_lookup', 'NEXT_LOOKUP_REQUIRED');
      for (const [i, c] of record.conclusions.entries()) if (!c.evidence_ids.length) fail(`/conclusions/${i}`, 'CONCLUSION_EVIDENCE_REQUIRED');
    }
  }
  return { valid: errors.length === 0, errors: errors.slice(0, 30) };
}

export function parseRecord(text) {
  if (Buffer.byteLength(text) > 2_000_000) throw new Error('PAYLOAD_TOO_LARGE');
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('INVALID_JSON'); }
  // JSON.parse accepts duplicate keys (last wins). Reject ambiguity, including
  // escaped spellings of the same key, without implementing a second JSON parser.
  const stack = [];
  for (const [token] of text.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\],:]|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) {
    const current = stack.at(-1);
    if (token === '{') stack.push({ keys: new Set(), expectingKey: true });
    else if (token === '[') stack.push({ keys: null });
    else if (token === '}' || token === ']') stack.pop();
    else if (token === ',' && current?.keys) current.expectingKey = true;
    else if (token === ':' && current?.keys) current.expectingKey = false;
    else if (token.startsWith('"') && current?.keys && current.expectingKey) {
      const key = JSON.parse(token);
      if (current.keys.has(key)) throw new Error('DUPLICATE_JSON_KEY');
      current.keys.add(key);
    }
  }
  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [type, path, linkedPath, previousPath, ...extra] = process.argv.slice(2);
    if (!['request', 'result'].includes(type) || !path || extra.length || (type === 'request' && previousPath)) throw new Error('USAGE: validate.mjs request FILE|- [PREVIOUS_REQUEST_FILE]; result FILE|- REQUEST_FILE [PREVIOUS_REQUEST_FILE]');
    const read = (p) => parseRecord(readFileSync(p === '-' ? 0 : p, 'utf8'));
    const result = validateRecord(type, read(path), type === 'result' && linkedPath ? read(linkedPath) : null,
      type === 'request' && linkedPath ? read(linkedPath) : previousPath ? read(previousPath) : null);
    console.log(JSON.stringify(result));
    process.exitCode = result.valid ? 0 : 1;
  } catch (error) {
    const code = ['INVALID_JSON', 'PAYLOAD_TOO_LARGE', 'DUPLICATE_JSON_KEY'].includes(error.message) || error.message.startsWith('USAGE:') ? error.message : 'READ_OR_VALIDATION_FAILED';
    console.log(JSON.stringify({ valid: false, errors: [issue('/', code)] }));
    process.exitCode = 2;
  }
}
