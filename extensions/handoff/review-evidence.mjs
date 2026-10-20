// Parent-run evidence collection. No shell, dispatch, source edits, or cleanup.
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  constants, closeSync, fstatSync, lstatSync, mkdirSync, mkdtempSync,
  openSync, readFileSync, realpathSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRecord, safeRelative } from './validate.mjs';

const MAX_FILE = 1_000_000, MAX_BYTES = 32_000_000, MAX_FILES = 10_000;
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const inside = (root, path) => path === root || path.startsWith(`${root}${sep}`);
const inScope = (path, paths) => paths.some((p) => p === '.' || p === path || (p.endsWith('/') && path.startsWith(p)));
const protectedPath = (path) => path.split('/').some((p) =>
  p === '.git' || p === 'node_modules' || p.endsWith('.ssh') || p.endsWith('.aws')
  || (p.endsWith('.env') || p.includes('.env.')) && !p.endsWith('.env.example')
  || /\.(?:netrc|npmrc|pypirc)$/.test(p)
  || /^(?:\.env(?:\..*)?|\.netrc|\.npmrc|\.pypirc|opencode\.json.*|.*service\.json|.*id_(?:rsa|ed25519|ecdsa).*)$/.test(p) && p !== '.env.example'
  || /\.(?:pem|key|p12|pfx|ppk)$/.test(p));
const error = (code) => { throw new Error(code); };

function git(root, args, allowUnborn = false) {
  const result = spawnSync('git', ['--no-pager', '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', ...args], {
    cwd: root, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' },
    encoding: 'utf8', timeout: 15_000, maxBuffer: 4_000_000, shell: false,
  });
  if (allowUnborn && result.status === 1) return null;
  if (result.error || result.status !== 0) error('GIT_INSPECTION_FAILED');
  return result.stdout;
}

function noLinks(root, path) {
  const rel = relative(root, path);
  if (!inside(root, path)) error('PATH_ESCAPE');
  let current = root;
  for (const component of rel.split(sep).filter(Boolean)) {
    current = join(current, component);
    if (lstatSync(current).isSymbolicLink()) error('SYMLINK_REJECTED');
  }
}

function readSafe(root, path, max = MAX_FILE) {
  noLinks(root, path);
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = fstatSync(fd);
    if (!before.isFile() || before.size > max) error('FILE_UNSUPPORTED_OR_TOO_LARGE');
    const bytes = readFileSync(fd);
    const after = fstatSync(fd);
    if (bytes.length > max || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) error('FILE_CHANGED_DURING_READ');
    return { bytes, mode: before.mode & 0o777 };
  } finally { closeSync(fd); }
}

function scopeCheck(scope) {
  if (!scope || Object.keys(scope).some((k) => !['paths', 'excludes'].includes(k))
    || !Array.isArray(scope.paths) || !scope.paths.length || !Array.isArray(scope.excludes)
    || [...scope.paths, ...scope.excludes].some((p) => !safeRelative(p))) error('INVALID_SCOPE');
}

function repository(path) {
  if (!isAbsolute(path)) error('ABSOLUTE_REPOSITORY_REQUIRED');
  const root = realpathSync(path);
  if (realpathSync(git(root, ['rev-parse', '--show-toplevel']).trim()) !== root) error('REPOSITORY_ROOT_REQUIRED');
  return root;
}

function temporary(root, repo) {
  if (!isAbsolute(root)) error('ABSOLUTE_TEMP_ROOT_REQUIRED');
  const canonical = realpathSync(root);
  // Task evidence must never be created in the repository or its ancestors.
  if (inside(repo, canonical) || inside(canonical, repo)) error('TEMP_ROOT_OVERLAPS_REPOSITORY');
  noLinks(canonical, resolve(root));
  const dir = mkdtempSync(join(canonical, 'handoff-evidence-'));
  // mkdtemp uses 0700; all artifacts below are created exclusively with 0600.
  mkdirSync(join(dir, 'files'), { mode: 0o700 });
  return dir;
}

function collect(repo, scope, artifactDir = null) {
  scopeCheck(scope);
  const names = [...new Set(git(repo, ['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean))].sort();
  const files = Object.create(null), skipped = [];
  let bytesRead = 0;
  for (const [index, path] of names.entries()) {
    if (inScope(path, scope.excludes)) continue;
    if (index >= MAX_FILES) { skipped.push({ path: '(remaining files)', reason: 'FILE_COUNT_LIMIT' }); break; }
    if (!safeRelative(path) || protectedPath(path)) { skipped.push({ path, reason: 'PROTECTED_OR_UNSAFE_PATH' }); continue; }
    try {
      if (bytesRead >= MAX_BYTES) error('BYTE_LIMIT');
      const { bytes, mode } = readSafe(repo, join(repo, path));
      bytesRead += bytes.length;
      if (bytesRead > MAX_BYTES) error('BYTE_LIMIT');
      const entry = { sha256: digest(bytes), bytes: bytes.length, mode };
      if (inScope(path, scope.paths)) {
        if (bytes.includes(0)) error('BINARY_FILE_UNSUPPORTED');
        // Reject invalid UTF-8 rather than silently replacing source bytes.
        try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { error('NON_UTF8_FILE_UNSUPPORTED'); }
        if (artifactDir) {
          entry.artifact = `files/${index}.txt`;
          writeFileSync(join(artifactDir, entry.artifact), bytes, { mode: 0o600, flag: 'wx' });
        }
      }
      files[path] = entry;
    } catch (e) {
      // A tracked deletion is evidence, not an unsupported-file failure.
      if (e.code !== 'ENOENT') skipped.push({ path, reason: ['BYTE_LIMIT', 'BINARY_FILE_UNSUPPORTED', 'NON_UTF8_FILE_UNSUPPORTED', 'SYMLINK_REJECTED', 'FILE_CHANGED_DURING_READ', 'FILE_UNSUPPORTED_OR_TOO_LARGE'].includes(e.message) ? e.message : 'FILE_UNREADABLE' });
    }
  }
  return {
    head: git(repo, ['rev-parse', '--verify', '--quiet', 'HEAD'], true)?.trim() || null,
    index_sha256: digest(git(repo, ['ls-files', '--stage', '-z'])),
    status: git(repo, ['status', '--porcelain=v1', '-z', '--untracked-files=all']),
    files, skipped,
  };
}

function fingerprint(entry) { return entry ? `${entry.sha256}:${entry.mode}` : null; }
function entryAt(state, path) { return Object.hasOwn(state.files, path) ? state.files[path] : null; }
function changes(before, after) {
  return [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].sort()
    .filter((p) => fingerprint(entryAt(before, p)) !== fingerprint(entryAt(after, p)));
}
function finish(dir, manifest) {
  const bytes = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
  const path = join(dir, 'manifest.json');
  writeFileSync(path, bytes, { mode: 0o600, flag: 'wx' });
  return { manifest_path: path, manifest_sha256: digest(bytes), id: manifest.id,
    baseline_id: manifest.baseline_id || manifest.id, changed_paths: manifest.changed_paths || [],
    unexpected_paths: manifest.unexpected_paths || [], limitations: manifest.limitations,
    cleanup_owned_directory: dir };
}
function load(path, sha256) {
  if (!isAbsolute(path) || !/^[a-f0-9]{64}$/.test(sha256)) error('INVALID_MANIFEST_REFERENCE');
  const root = realpathSync(dirname(path));
  const { bytes } = readSafe(root, path, 8_000_000);
  if (digest(bytes) !== sha256) error('MANIFEST_DIGEST_MISMATCH');
  const data = JSON.parse(bytes.toString('utf8'));
  if (data.protocol !== 'review-evidence/v1' || !data.id || !data.repository || !data.state?.files) error('INVALID_MANIFEST');
  return { data, root };
}

export function captureBaseline({ repository: path, scope, temp_root }) {
  const repo = repository(path);
  scopeCheck(scope);
  const dir = temporary(temp_root, repo);
  try {
    const state = collect(repo, scope, dir);
    return finish(dir, { protocol: 'review-evidence/v1', kind: 'baseline', id: randomUUID(), repository: repo, scope, state,
      limitations: state.skipped.length ? ['Some repository paths could not be inspected; see state.skipped.'] : [] });
  } catch (e) {
    // Preserve partial evidence for attributable parent cleanup; never sweep temp roots.
    e.owned_directory = dir;
    throw e;
  }
}

export function captureChanges({ baseline_path, baseline_sha256, temp_root }) {
  const { data: baseline, root: baselineRoot } = load(baseline_path, baseline_sha256);
  if (baseline.kind !== 'baseline') error('BASELINE_REQUIRED');
  const repo = repository(baseline.repository);
  scopeCheck(baseline.scope);
  const dir = temporary(temp_root, repo);
  try {
    const state = collect(repo, baseline.scope, dir);
    const changed = changes(baseline.state, state);
    const scoped = changed.filter((p) => inScope(p, baseline.scope.paths));
    const unexpected = changed.filter((p) => !inScope(p, baseline.scope.paths));
    const limitations = [];
    if (baseline.state.skipped.length || state.skipped.length) limitations.push('Inspection coverage is incomplete; inspect baseline/state skipped entries.');
    if (unexpected.length) limitations.push('Out-of-scope changes require parent reconciliation.');
    if (baseline.state.head !== state.head) limitations.push('HEAD changed; ownership/base requires reconciliation.');
    if (baseline.state.index_sha256 !== state.index_sha256) limitations.push('Index changed; staging ownership requires reconciliation.');
    return finish(dir, {
      protocol: 'review-evidence/v1', kind: 'snapshot', id: randomUUID(), baseline_id: baseline.id,
      repository: repo, scope: baseline.scope, baseline_path, baseline_sha256, baseline_root: baselineRoot,
      state, changed_paths: scoped, unexpected_paths: unexpected, limitations,
      changes: scoped.map((path) => ({ path, before: entryAt(baseline.state, path), after: entryAt(state, path) })),
    });
  } catch (e) { e.owned_directory = dir; throw e; }
}

export function checkFreshness({ manifest_path, manifest_sha256 }) {
  const { data: snapshot, root } = load(manifest_path, manifest_sha256);
  if (snapshot.kind !== 'snapshot') error('SNAPSHOT_REQUIRED');
  const { data: baseline, root: baselineRoot } = load(snapshot.baseline_path, snapshot.baseline_sha256);
  if (baseline.kind !== 'baseline' || baseline.id !== snapshot.baseline_id || baseline.repository !== snapshot.repository || baselineRoot !== snapshot.baseline_root) error('BASELINE_MISMATCH');
  const repo = repository(snapshot.repository);
  const current = collect(repo, snapshot.scope);
  const drifted = changes(snapshot.state, current);
  const stateChanged = snapshot.state.head !== current.head || snapshot.state.index_sha256 !== current.index_sha256 || snapshot.state.status !== current.status;
  let artifactsValid = true;
  for (const [state, dir] of [[baseline.state, baselineRoot], [snapshot.state, root]]) {
    for (const entry of Object.values(state.files)) if (entry.artifact) {
      if (!safeRelative(entry.artifact)) error('UNSAFE_ARTIFACT');
      try { if (digest(readSafe(dir, join(dir, entry.artifact)).bytes) !== entry.sha256) artifactsValid = false; }
      catch { artifactsValid = false; }
    }
  }
  const freshness = drifted.length || stateChanged || !artifactsValid ? 'drifted'
    : snapshot.limitations.length || current.skipped.length ? 'unverified' : 'matched';
  return { snapshot_id: snapshot.id, freshness, observed_at: new Date().toISOString(), drifted_paths: drifted, artifacts_valid: artifactsValid,
    limitations: snapshot.limitations, cleanup_owned_directory: null };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [operation, path, ...extra] = process.argv.slice(2);
    if (!['baseline', 'changes', 'freshness'].includes(operation) || !path || extra.length) error('USAGE');
    const input = parseRecord(readFileSync(path === '-' ? 0 : path, 'utf8'));
    const fields = { baseline: ['repository', 'scope', 'temp_root'], changes: ['baseline_path', 'baseline_sha256', 'temp_root'], freshness: ['manifest_path', 'manifest_sha256'] }[operation];
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some((k) => !fields.includes(k)) || fields.some((k) => !(k in input))) error('INVALID_INPUT');
    const result = { baseline: captureBaseline, changes: captureChanges, freshness: checkFreshness }[operation](input);
    console.log(JSON.stringify(result));
    if (operation === 'freshness' && result.freshness !== 'matched') process.exitCode = 1;
  } catch (e) {
    const known = /^(?:[A-Z_]+)$/;
    console.log(JSON.stringify({ error: known.test(e.message) ? e.message : 'INSPECTION_FAILED', cleanup_owned_directory: e.owned_directory || null }));
    process.exitCode = 2;
  }
}
