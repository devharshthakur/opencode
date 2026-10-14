// Deterministic approval/handoff core (offline pilot, experimental).
//
// Dependency-free: uses only Node built-in facilities ("node:crypto", "node:path").
// This module is runtime-independent. It does NOT load as a plugin, register
// configuration, start services, spawn processes, or call any OpenCode API.
//
// Scope and honest boundaries (see README.md and contract.json):
// - The revision digest detects change and binds an approval receipt to the full
//   frozen proposal. It does NOT authenticate a human or prove who approved.
// - Approval receipts are simulated trusted-adapter inputs in tests. Nothing here
//   performs real authorization.
// - Guarantees are in-process object-state guarantees only. There is NO documented
//   multi-process atomicity, durable storage guarantee, exactly-once dispatch,
//   permission enforcement, or sandbox claim.
// - Semantic completion requires an affirmative acceptance judgment plus evidence
//   from a future trusted adapter. A worker returning successfully is not proof,
//   and this module does not establish semantic truth.
//
// Every operation that takes a record validates the whole record first
// (assertIntegrity), so malformed or inconsistent restored state fails closed
// even outside deserialization.

import { createHash } from "node:crypto";
import { isAbsolute } from "node:path";

export const CONTRACT_VERSION = 1;
export const MODULE_ID = "workflow-pilot/core";

// Lifecycle states. Terminal states accept no further transitions.
export const STATES = Object.freeze([
  "awaiting-approval",
  "approved",
  "dispatching",
  "running",
  "completed",
  "blocked",
  "cancelled",
]);

export const TERMINAL_STATES = Object.freeze(["completed", "blocked", "cancelled"]);

// Fixed local-build policy. This pilot never performs isolation or delivery.
export const LOCAL_BUILD_POLICY = Object.freeze({
  workflow: "build",
  isolation: "current",
  base_kind: "local",
  delivery_policy: "local",
  commit_confirmation: "required",
});

// Operation-limit keys the pilot understands. All but "edit"/"validate" are
// forbidden and must be false in any accepted proposal.
export const OPERATION_LIMIT_KEYS = Object.freeze([
  "edit",
  "validate",
  "create_branch",
  "create_worktree",
  "commit",
  "push",
  "create_or_update_pr",
]);

export const FORBIDDEN_OPERATION_KEYS = Object.freeze([
  "create_branch",
  "create_worktree",
  "commit",
  "push",
  "create_or_update_pr",
]);

// Allowed target states per current state. Terminal states have none.
export const STATE_TRANSITIONS = Object.freeze({
  "awaiting-approval": Object.freeze(["approved", "blocked", "cancelled"]),
  approved: Object.freeze(["dispatching", "blocked", "cancelled"]),
  dispatching: Object.freeze(["running", "blocked", "cancelled"]),
  running: Object.freeze(["completed", "blocked", "cancelled"]),
  completed: Object.freeze([]),
  blocked: Object.freeze([]),
  cancelled: Object.freeze([]),
});

// Closed acceptance decisions. A completion judgment must carry one of these.
export const ACCEPTANCE_DECISIONS = Object.freeze(["accept"]);

export const RESERVATION_STATES = Object.freeze(["reserved", "attributed", "running"]);

// Every error code this module can raise. contract.json mirrors this list, and a
// test asserts they stay equal so the contract is not an untested second source.
export const ERROR_CODES = Object.freeze([
  "invalid-field",
  "invalid-path",
  "invalid-revision",
  "invalid-kind",
  "invalid-phases",
  "duplicate-phase",
  "missing-proposal-field",
  "unknown-proposal-field",
  "missing-operation-limit",
  "unknown-operation-limit",
  "invalid-operation-limit",
  "forbidden-operation",
  "invalid-proposal",
  "invalid-operation-limits",
  "unserializable-value",
  "invalid-record",
  "unknown-record-field",
  "missing-record-field",
  "unsupported-contract-version",
  "invalid-state",
  "invalid-record-state",
  "invalid-approval",
  "invalid-approved-phases",
  "invalid-dispatch",
  "invalid-result",
  "invalid-judgment",
  "invalid-history",
  "digest-mismatch",
  "invalid-transition",
  "invalid-receipt",
  "missing-receipt-field",
  "unknown-receipt-field",
  "stale-approval",
  "wrong-repository",
  "wrong-session",
  "no-approval",
  "revision-not-advanced",
  "revision-blocked",
  "missing-idempotency-key",
  "duplicate-dispatch",
  "dispatch-mismatch",
  "missing-worker-id",
  "conflicting-worker-id",
  "semantic-evidence-required",
  "semantic-judgment-required",
  "semantic-judgment-rejected",
  "handoff-requires-approval",
  "invalid-serialization",
]);

const PROPOSAL_KEYS = Object.freeze([
  "title",
  "revision",
  "kind",
  "repository",
  "original_checkout",
  "origin_session",
  "plan",
  "phases",
  "operation_limits",
]);

const RECEIPT_KEYS = Object.freeze([
  "proposal_digest",
  "approved_phases",
  "approved_by",
  "approved_at",
  "repository",
  "origin_session",
  "simulated",
]);

const RECORD_KEYS = Object.freeze([
  "contract_version",
  "state",
  "proposal",
  "digest",
  "approval",
  "dispatch",
  "result",
  "history",
  "reason",
]);

const APPROVAL_KEYS = Object.freeze([
  "proposal_digest",
  "approved_phases",
  "approved_by",
  "approved_at",
  "repository",
  "origin_session",
  "source",
  "simulated",
]);

const DISPATCH_KEYS = Object.freeze([
  "dispatch_id",
  "idempotency_key",
  "reservation_state",
  "worker_id",
  "reserved_at",
]);

const RESULT_KEYS = Object.freeze(["evidence", "judgment", "approved_phases"]);

const JUDGMENT_KEYS = Object.freeze(["decision", "rationale"]);

const HISTORY_ENTRY_KEYS = Object.freeze(["at", "from", "to", "reason"]);

export class PilotError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "PilotError";
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

// Genuine plain/JSON objects only. Rejects arrays, null, class instances, and
// objects with a custom prototype (inheritance tricks).
function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function isNullableString(value) {
  return value === null || nonEmptyString(value);
}

function requireNonEmptyString(value, field) {
  if (!nonEmptyString(value)) {
    throw new PilotError("invalid-field", `${field} must be a non-empty string`, { field });
  }
}

function requireAbsolutePath(value, field) {
  requireNonEmptyString(value, field);
  if (!isAbsolute(value)) {
    throw new PilotError("invalid-path", `${field} must be an absolute path`, { field });
  }
}

function assertNoUnknownKeys(object, allowed, code, label) {
  const unknown = Object.keys(object).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new PilotError(code, `unknown ${label}: ${unknown.join(", ")}`, { unknown });
  }
}

function deepFreeze(value) {
  if (isPlainObject(value) || Array.isArray(value)) {
    if (!Object.isFrozen(value)) {
      Object.freeze(value);
      for (const key of Object.keys(value)) {
        deepFreeze(value[key]);
      }
    }
  }
  return value;
}

// Deep-copies a JSON-compatible value into fresh plain objects/arrays so the
// caller cannot later mutate state through an alias. Rejects unsupported values.
function deepCloneJson(value) {
  if (value === null) {
    return null;
  }
  const type = typeof value;
  if (type === "string" || type === "boolean") {
    return value;
  }
  if (type === "number") {
    if (!Number.isFinite(value)) {
      throw new PilotError("unserializable-value", "non-finite numbers are not supported");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepCloneJson(item));
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = deepCloneJson(value[key]);
    }
    return out;
  }
  throw new PilotError("unserializable-value", `cannot clone value of type ${type}`);
}

// Deterministic, dependency-free canonical JSON: object keys sorted recursively.
export function stableStringify(value) {
  if (value === null || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PilotError("unserializable-value", "non-finite numbers are not supported");
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort();
    const body = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",");
    return `{${body}}`;
  }
  throw new PilotError("unserializable-value", `cannot canonicalize ${typeof value}`);
}

export function computeDigest(proposal) {
  const canonical = stableStringify(proposal);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function validateOperationLimits(limits) {
  if (!isPlainObject(limits)) {
    throw new PilotError("invalid-operation-limits", "operation_limits must be an object");
  }
  assertNoUnknownKeys(limits, OPERATION_LIMIT_KEYS, "unknown-operation-limit", "operation limit key");
  const missing = OPERATION_LIMIT_KEYS.filter((key) => !(key in limits));
  if (missing.length > 0) {
    throw new PilotError("missing-operation-limit", `missing operation limit(s): ${missing.join(", ")}`, {
      missing,
    });
  }
  for (const key of OPERATION_LIMIT_KEYS) {
    if (typeof limits[key] !== "boolean") {
      throw new PilotError("invalid-operation-limit", `operation limit ${key} must be a boolean`, { key });
    }
  }
  for (const key of FORBIDDEN_OPERATION_KEYS) {
    if (limits[key] === true) {
      throw new PilotError("forbidden-operation", `operation ${key} is never permitted by this pilot`, { key });
    }
  }
  return true;
}

export function validateProposal(proposal) {
  if (!isPlainObject(proposal)) {
    throw new PilotError("invalid-proposal", "proposal must be an object");
  }
  assertNoUnknownKeys(proposal, PROPOSAL_KEYS, "unknown-proposal-field", "proposal field");
  const missing = PROPOSAL_KEYS.filter((key) => !(key in proposal));
  if (missing.length > 0) {
    throw new PilotError("missing-proposal-field", `missing proposal field(s): ${missing.join(", ")}`, {
      missing,
    });
  }
  requireNonEmptyString(proposal.title, "title");
  if (!Number.isSafeInteger(proposal.revision) || proposal.revision < 1) {
    throw new PilotError("invalid-revision", "revision must be a positive safe integer");
  }
  if (proposal.kind !== "implementation" && proposal.kind !== "repair") {
    throw new PilotError("invalid-kind", 'kind must be "implementation" or "repair"');
  }
  requireAbsolutePath(proposal.repository, "repository");
  requireAbsolutePath(proposal.original_checkout, "original_checkout");
  requireNonEmptyString(proposal.origin_session, "origin_session");
  requireNonEmptyString(proposal.plan, "plan");
  if (!Array.isArray(proposal.phases) || proposal.phases.length === 0) {
    throw new PilotError("invalid-phases", "phases must be a non-empty array");
  }
  const seen = new Set();
  for (const phase of proposal.phases) {
    requireNonEmptyString(phase, "phases[]");
    if (seen.has(phase)) {
      throw new PilotError("duplicate-phase", `duplicate phase: ${phase}`, { phase });
    }
    seen.add(phase);
  }
  validateOperationLimits(proposal.operation_limits);
  return true;
}

function normalizeProposal(proposal) {
  return deepFreeze({
    title: proposal.title,
    revision: proposal.revision,
    kind: proposal.kind,
    repository: proposal.repository,
    original_checkout: proposal.original_checkout,
    origin_session: proposal.origin_session,
    plan: proposal.plan,
    phases: proposal.phases.slice(),
    operation_limits: { ...proposal.operation_limits },
  });
}

// ---------------------------------------------------------------------------
// Record construction and full structural validation
// ---------------------------------------------------------------------------

function assertApprovedPhases(phases, proposal, code) {
  if (!Array.isArray(phases) || phases.length === 0) {
    throw new PilotError(code, "approved phases must be a non-empty array");
  }
  const allowed = new Set(proposal.phases);
  const seen = new Set();
  for (const phase of phases) {
    if (!nonEmptyString(phase) || !allowed.has(phase)) {
      throw new PilotError(code, `approved phase is not in the proposal: ${String(phase)}`, { phase });
    }
    if (seen.has(phase)) {
      throw new PilotError(code, `duplicate approved phase: ${phase}`, { phase });
    }
    seen.add(phase);
  }
  return true;
}

function assertApprovalShape(approval, record) {
  if (!isPlainObject(approval)) {
    throw new PilotError("invalid-approval", "approval must be an object");
  }
  assertNoUnknownKeys(approval, APPROVAL_KEYS, "invalid-approval", "approval field");
  const missing = APPROVAL_KEYS.filter((key) => !(key in approval));
  if (missing.length > 0) {
    throw new PilotError("invalid-approval", `missing approval field(s): ${missing.join(", ")}`, { missing });
  }
  if (!nonEmptyString(approval.proposal_digest)) {
    throw new PilotError("invalid-approval", "approval.proposal_digest must be a non-empty string");
  }
  if (approval.proposal_digest !== record.digest) {
    throw new PilotError("stale-approval", "approval digest does not match the current proposal digest");
  }
  if (approval.repository !== record.proposal.repository) {
    throw new PilotError("wrong-repository", "approval repository does not match the proposal");
  }
  if (approval.origin_session !== record.proposal.origin_session) {
    throw new PilotError("wrong-session", "approval origin session does not match the proposal");
  }
  requireNonEmptyString(approval.approved_by, "approval.approved_by");
  requireNonEmptyString(approval.approved_at, "approval.approved_at");
  if (approval.source !== "trusted-adapter") {
    throw new PilotError("invalid-approval", "approval.source must be trusted-adapter");
  }
  if (typeof approval.simulated !== "boolean") {
    throw new PilotError("invalid-approval", "approval.simulated must be a boolean");
  }
  assertApprovedPhases(approval.approved_phases, record.proposal, "invalid-approved-phases");
  return true;
}

function assertDispatchShape(dispatch, record) {
  if (!isPlainObject(dispatch)) {
    throw new PilotError("invalid-dispatch", "dispatch must be an object");
  }
  assertNoUnknownKeys(dispatch, DISPATCH_KEYS, "invalid-dispatch", "dispatch field");
  const missing = DISPATCH_KEYS.filter((key) => !(key in dispatch));
  if (missing.length > 0) {
    throw new PilotError("invalid-dispatch", `missing dispatch field(s): ${missing.join(", ")}`, { missing });
  }
  if (!nonEmptyString(dispatch.idempotency_key)) {
    throw new PilotError("invalid-dispatch", "dispatch.idempotency_key must be a non-empty string");
  }
  if (!RESERVATION_STATES.includes(dispatch.reservation_state)) {
    throw new PilotError("invalid-dispatch", `unknown reservation_state: ${String(dispatch.reservation_state)}`);
  }
  if (!isNullableString(dispatch.worker_id)) {
    throw new PilotError("invalid-dispatch", "dispatch.worker_id must be null or a non-empty string");
  }
  if (!isNullableString(dispatch.reserved_at)) {
    throw new PilotError("invalid-dispatch", "dispatch.reserved_at must be null or a non-empty string");
  }
  const expectedId = deterministicDispatchId(record.digest, dispatch.idempotency_key);
  if (dispatch.dispatch_id !== expectedId) {
    throw new PilotError("invalid-dispatch", "dispatch id does not match the digest and idempotency key", {
      stored: dispatch.dispatch_id,
      expected: expectedId,
    });
  }
  return true;
}

function normalizeAcceptanceJudgment(judgment) {
  if (!isPlainObject(judgment)) {
    throw new PilotError("semantic-judgment-required", "completion requires a closed acceptance judgment object");
  }
  assertNoUnknownKeys(judgment, JUDGMENT_KEYS, "invalid-judgment", "judgment field");
  if (!("decision" in judgment)) {
    throw new PilotError("semantic-judgment-required", "judgment.decision is required");
  }
  if (!ACCEPTANCE_DECISIONS.includes(judgment.decision)) {
    throw new PilotError(
      "semantic-judgment-rejected",
      `judgment.decision must be affirmative (${ACCEPTANCE_DECISIONS.join(", ")}), got ${String(judgment.decision)}`,
    );
  }
  if ("rationale" in judgment && !nonEmptyString(judgment.rationale)) {
    throw new PilotError("invalid-judgment", "judgment.rationale must be a non-empty string when present");
  }
  return deepFreeze(deepCloneJson(judgment));
}

function assertResultShape(result, record) {
  if (!isPlainObject(result)) {
    throw new PilotError("invalid-result", "result must be an object");
  }
  assertNoUnknownKeys(result, RESULT_KEYS, "invalid-result", "result field");
  const missing = RESULT_KEYS.filter((key) => !(key in result));
  if (missing.length > 0) {
    throw new PilotError("invalid-result", `missing result field(s): ${missing.join(", ")}`, { missing });
  }
  if (!nonEmptyString(result.evidence)) {
    throw new PilotError("invalid-result", "result.evidence must be a non-empty string");
  }
  normalizeAcceptanceJudgment(result.judgment);
  assertApprovedPhases(result.approved_phases, record.proposal, "invalid-result");
  return true;
}

function assertHistory(history, state) {
  if (!Array.isArray(history) || history.length === 0) {
    throw new PilotError("invalid-history", "history must be a non-empty array");
  }
  history.forEach((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new PilotError("invalid-history", `history[${index}] must be an object`);
    }
    assertNoUnknownKeys(entry, HISTORY_ENTRY_KEYS, "invalid-history", `history[${index}] field`);
    if (!isNullableString(entry.at)) {
      throw new PilotError("invalid-history", `history[${index}].at must be null or a non-empty string`);
    }
    if (!isNullableString(entry.reason)) {
      throw new PilotError("invalid-history", `history[${index}].reason must be null or a non-empty string`);
    }
    if (entry.to !== undefined && !STATES.includes(entry.to)) {
      throw new PilotError("invalid-history", `history[${index}].to is not a known state`);
    }
    if (index === 0) {
      if (entry.from !== null || entry.to !== "awaiting-approval") {
        throw new PilotError("invalid-history", "history must begin at awaiting-approval");
      }
      return;
    }
    const previous = history[index - 1];
    if (entry.from !== previous.to) {
      throw new PilotError("invalid-history", `history[${index}].from does not continue from the previous state`);
    }
    const allowed = STATE_TRANSITIONS[entry.from] ?? [];
    if (!allowed.includes(entry.to)) {
      throw new PilotError("invalid-history", `history transition ${entry.from} -> ${entry.to} is not allowed`);
    }
  });
  if (history[history.length - 1].to !== state) {
    throw new PilotError("invalid-history", "history does not end at the record state");
  }
  return true;
}

function assertStateConsistency(record) {
  const hasApproval = record.approval !== null;
  const hasDispatch = record.dispatch !== null;
  const hasResult = record.result !== null;
  const fail = (message) => {
    throw new PilotError("invalid-record-state", message);
  };
  switch (record.state) {
    case "awaiting-approval":
      if (hasApproval || hasDispatch || hasResult) fail("awaiting-approval must not carry approval, dispatch, or result");
      break;
    case "approved":
      if (!hasApproval || hasDispatch || hasResult) fail("approved requires approval and no dispatch or result");
      break;
    case "dispatching":
      if (!hasApproval || !hasDispatch || hasResult) fail("dispatching requires approval and a dispatch, and no result");
      break;
    case "running":
      if (!hasApproval || !hasDispatch || !nonEmptyString(record.dispatch.worker_id) || hasResult) {
        fail("running requires approval, a worker-attributed dispatch, and no result");
      }
      break;
    case "completed":
      if (!hasApproval || !hasDispatch || !nonEmptyString(record.dispatch.worker_id) || !hasResult) {
        fail("completed requires approval, a worker-attributed dispatch, and a result");
      }
      break;
    case "blocked":
    case "cancelled":
      if (hasResult) fail(`${record.state} must not carry a result`);
      break;
    default:
      fail(`unknown state: ${String(record.state)}`);
  }
  if (record.reason !== null && !nonEmptyString(record.reason)) {
    throw new PilotError("invalid-record", "reason must be null or a non-empty string");
  }
  return true;
}

export function assertRecordShape(record) {
  if (!isPlainObject(record)) {
    throw new PilotError("invalid-record", "record must be an object");
  }
  assertNoUnknownKeys(record, RECORD_KEYS, "unknown-record-field", "record field");
  const missing = RECORD_KEYS.filter((key) => !(key in record));
  if (missing.length > 0) {
    throw new PilotError("missing-record-field", `missing record field(s): ${missing.join(", ")}`, { missing });
  }
  if (record.contract_version !== CONTRACT_VERSION) {
    throw new PilotError("unsupported-contract-version", `unsupported contract version: ${record.contract_version}`);
  }
  if (!STATES.includes(record.state)) {
    throw new PilotError("invalid-state", `unknown state: ${record.state}`);
  }
  validateProposal(record.proposal);
  if (!nonEmptyString(record.digest)) {
    throw new PilotError("invalid-record", "digest must be a non-empty string");
  }
  return true;
}

// Restored-state validation: every nested contract level, the digest, approval
// binding, dispatch structure, result, history chain, and final-state consistency.
export function assertIntegrity(record) {
  assertRecordShape(record);
  const recomputed = computeDigest(record.proposal);
  if (recomputed !== record.digest) {
    throw new PilotError("digest-mismatch", "stored digest does not match the frozen proposal", {
      stored: record.digest,
      recomputed,
    });
  }
  if (record.approval !== null) {
    assertApprovalShape(record.approval, record);
  }
  if (record.dispatch !== null) {
    assertDispatchShape(record.dispatch, record);
  }
  if (record.result !== null) {
    assertResultShape(record.result, record);
  }
  assertHistory(record.history, record.state);
  assertStateConsistency(record);
  return true;
}

function nextRecord(record, patch) {
  return {
    contract_version: record.contract_version,
    state: record.state,
    proposal: record.proposal,
    digest: record.digest,
    approval: record.approval,
    dispatch: record.dispatch,
    result: record.result,
    history: record.history,
    reason: record.reason,
    ...patch,
  };
}

function transitionRecord(record, to, reason, at) {
  const allowed = STATE_TRANSITIONS[record.state] ?? [];
  if (!allowed.includes(to)) {
    throw new PilotError("invalid-transition", `cannot transition ${record.state} -> ${to}`);
  }
  const entry = Object.freeze({ at: at ?? null, from: record.state, to, reason: reason ?? null });
  return nextRecord(record, { state: to, history: Object.freeze([...record.history, entry]) });
}

function assertState(record, expected) {
  if (record.state !== expected) {
    throw new PilotError("invalid-transition", `expected state ${expected}, got ${record.state}`);
  }
}

export function isTerminal(state) {
  return TERMINAL_STATES.includes(state);
}

export function createRecord(proposalInput) {
  validateProposal(proposalInput);
  const proposal = normalizeProposal(proposalInput);
  const digest = computeDigest(proposal);
  return deepFreeze({
    contract_version: CONTRACT_VERSION,
    state: "awaiting-approval",
    proposal,
    digest,
    approval: null,
    dispatch: null,
    result: null,
    history: Object.freeze([
      Object.freeze({ at: null, from: null, to: "awaiting-approval", reason: "created" }),
    ]),
    reason: null,
  });
}

// ---------------------------------------------------------------------------
// Approval
// ---------------------------------------------------------------------------

function validateReceipt(receipt, record) {
  if (!isPlainObject(receipt)) {
    throw new PilotError("invalid-receipt", "approval receipt must be an object");
  }
  assertNoUnknownKeys(receipt, RECEIPT_KEYS, "unknown-receipt-field", "receipt field");
  const missing = RECEIPT_KEYS.filter((key) => key !== "simulated" && !(key in receipt));
  if (missing.length > 0) {
    throw new PilotError("missing-receipt-field", `missing receipt field(s): ${missing.join(", ")}`, { missing });
  }
  requireNonEmptyString(receipt.proposal_digest, "proposal_digest");
  requireNonEmptyString(receipt.approved_by, "approved_by");
  requireNonEmptyString(receipt.approved_at, "approved_at");
  requireNonEmptyString(receipt.repository, "repository");
  requireNonEmptyString(receipt.origin_session, "origin_session");
  if ("simulated" in receipt && typeof receipt.simulated !== "boolean") {
    throw new PilotError("invalid-receipt", "simulated must be a boolean when present");
  }
  if (receipt.proposal_digest !== record.digest) {
    throw new PilotError("stale-approval", "approval receipt digest does not match the current proposal digest", {
      expected: record.digest,
      received: receipt.proposal_digest,
    });
  }
  if (receipt.repository !== record.proposal.repository) {
    throw new PilotError("wrong-repository", "approval receipt repository does not match the proposal");
  }
  if (receipt.origin_session !== record.proposal.origin_session) {
    throw new PilotError("wrong-session", "approval receipt origin session does not match the proposal");
  }
  assertApprovedPhases(receipt.approved_phases, record.proposal, "invalid-approved-phases");
  return true;
}

// Receipts are supplied by a trusted adapter. In this pilot they are simulated
// test inputs; this function does not and cannot authenticate a human.
export function applyApproval(record, receipt) {
  assertIntegrity(record);
  if (record.state !== "awaiting-approval") {
    throw new PilotError("invalid-transition", `approval requires awaiting-approval, got ${record.state}`);
  }
  validateReceipt(receipt, record);
  const approval = Object.freeze({
    proposal_digest: receipt.proposal_digest,
    approved_phases: Object.freeze([...receipt.approved_phases]),
    approved_by: receipt.approved_by,
    approved_at: receipt.approved_at,
    repository: receipt.repository,
    origin_session: receipt.origin_session,
    source: "trusted-adapter",
    simulated: receipt.simulated === true,
  });
  const approved = transitionRecord(record, "approved", "approved");
  return deepFreeze(nextRecord(approved, { approval }));
}

export function isApprovalCurrent(record) {
  return Boolean(record.approval) && record.approval.proposal_digest === record.digest;
}

export function assertApprovalCurrent(record) {
  if (!record.approval) {
    throw new PilotError("no-approval", "record has no approval bound to it");
  }
  if (!isApprovalCurrent(record)) {
    throw new PilotError("stale-approval", "approval digest does not match the current proposal digest");
  }
  return true;
}

// Revising is only allowed when there is no active or unresolved dispatch. An
// uncertain blocked record (a reservation without an attributable worker id)
// must not be revised away: that would discard dispatch tracking. The original
// record is never mutated.
export function revise(record, nextProposal) {
  assertIntegrity(record);
  if (record.state === "dispatching" || record.state === "running") {
    throw new PilotError("revision-blocked", `cannot revise during active dispatch (state ${record.state})`);
  }
  if (record.dispatch !== null && !nonEmptyString(record.dispatch.worker_id)) {
    throw new PilotError("revision-blocked", "cannot revise with an unresolved dispatch reservation");
  }
  validateProposal(nextProposal);
  if (nextProposal.revision <= record.proposal.revision) {
    throw new PilotError("revision-not-advanced", "revised proposal must increase the revision number");
  }
  return createRecord(nextProposal);
}

// ---------------------------------------------------------------------------
// Dispatch reservation (idempotent within one process/serialized writer)
// ---------------------------------------------------------------------------

export function deterministicDispatchId(digest, idempotencyKey) {
  return createHash("sha256").update(`${digest}\n${idempotencyKey}`, "utf8").digest("hex").slice(0, 16);
}

export function reserveDispatch(record, input = {}) {
  assertIntegrity(record);
  const key = input.idempotency_key;
  if (!nonEmptyString(key)) {
    throw new PilotError("missing-idempotency-key", "idempotency_key is required");
  }
  if (record.state === "dispatching") {
    if (record.dispatch.idempotency_key === key) {
      // Idempotent: an identical reservation does not create a second dispatch.
      return record;
    }
    throw new PilotError("duplicate-dispatch", "a different dispatch is already reserved", {
      existing: record.dispatch.idempotency_key,
      requested: key,
    });
  }
  assertState(record, "approved");
  // Reserving a dispatch requires a current, valid approval bound to this record.
  assertApprovalCurrent(record);
  const reserved = transitionRecord(record, "dispatching", "dispatch-reserved", input.at);
  const dispatch = Object.freeze({
    dispatch_id: deterministicDispatchId(record.digest, key),
    idempotency_key: key,
    reservation_state: "reserved",
    worker_id: null,
    reserved_at: input.at ?? null,
  });
  return deepFreeze(nextRecord(reserved, { dispatch }));
}

function assertDispatchMatches(record, dispatchId) {
  if (dispatchId !== undefined && dispatchId !== record.dispatch?.dispatch_id) {
    throw new PilotError("dispatch-mismatch", "dispatch_id does not match the active reservation");
  }
}

export function recordWorkerId(record, input = {}) {
  assertIntegrity(record);
  assertState(record, "dispatching");
  requireNonEmptyString(input.worker_id, "worker_id");
  assertDispatchMatches(record, input.dispatch_id);
  const existing = record.dispatch.worker_id;
  if (nonEmptyString(existing)) {
    if (existing === input.worker_id) {
      // Idempotent: the same worker id is not a conflict.
      return record;
    }
    throw new PilotError("conflicting-worker-id", "dispatch is already attributed to a different worker id", {
      existing,
      requested: input.worker_id,
    });
  }
  const dispatch = Object.freeze({
    ...record.dispatch,
    worker_id: input.worker_id,
    reservation_state: "attributed",
  });
  return deepFreeze(nextRecord(record, { dispatch }));
}

export function startRunning(record, input = {}) {
  assertIntegrity(record);
  assertState(record, "dispatching");
  if (!record.dispatch || !nonEmptyString(record.dispatch.worker_id)) {
    throw new PilotError("missing-worker-id", "cannot run without an attributable worker id");
  }
  assertDispatchMatches(record, input.dispatch_id);
  const running = transitionRecord(record, "running", "running", input.at);
  return deepFreeze(nextRecord(running, {
    dispatch: Object.freeze({ ...record.dispatch, reservation_state: "running" }),
  }));
}

// ---------------------------------------------------------------------------
// Terminal transitions
// ---------------------------------------------------------------------------

// Semantic completion needs trusted evidence and an affirmative acceptance
// judgment. Worker success alone is not proof; this function does not establish
// semantic truth and rejects negative, unknown, or malformed judgments.
export function complete(record, input = {}) {
  assertIntegrity(record);
  assertState(record, "running");
  if (!record.dispatch || !nonEmptyString(record.dispatch.worker_id)) {
    throw new PilotError("missing-worker-id", "completion requires an attributable worker id");
  }
  assertDispatchMatches(record, input.dispatch_id);
  if (!nonEmptyString(input.evidence)) {
    throw new PilotError("semantic-evidence-required", "completion requires non-empty evidence from the trusted adapter");
  }
  const judgment = normalizeAcceptanceJudgment(input.judgment);
  const result = Object.freeze({
    evidence: input.evidence,
    judgment,
    approved_phases: Object.freeze([...(record.approval?.approved_phases ?? [])]),
  });
  const completed = transitionRecord(record, "completed", "completed", input.at);
  return deepFreeze(nextRecord(completed, { result }));
}

export function block(record, input = {}) {
  assertIntegrity(record);
  if (isTerminal(record.state)) {
    throw new PilotError("invalid-transition", `cannot block from terminal state ${record.state}`);
  }
  requireNonEmptyString(input.reason, "reason");
  const blocked = transitionRecord(record, "blocked", input.reason, input.at);
  return deepFreeze(nextRecord(blocked, { reason: input.reason }));
}

export function cancel(record, input = {}) {
  assertIntegrity(record);
  if (isTerminal(record.state)) {
    throw new PilotError("invalid-transition", `cannot cancel from terminal state ${record.state}`);
  }
  const reason = nonEmptyString(input.reason) ? input.reason : "cancelled";
  const cancelled = transitionRecord(record, "cancelled", reason, input.at);
  return deepFreeze(nextRecord(cancelled, { reason }));
}

// ---------------------------------------------------------------------------
// Crash recovery: fail closed, never auto-replay
// ---------------------------------------------------------------------------

// A reservation in dispatch/running without an attributable worker id is
// uncertain. This blocks and requires reconciliation. It never replays, and it
// validates the whole record first, so malformed state is rejected, not trusted.
export function recover(record) {
  assertIntegrity(record);
  const inFlight = record.state === "dispatching" || record.state === "running";
  const hasWorkerId = Boolean(record.dispatch && nonEmptyString(record.dispatch.worker_id));
  if (inFlight && !hasWorkerId) {
    const blocked = block(record, {
      reason: "crash-uncertain: in-flight work has no attributable worker id; reconcile, do not replay",
    });
    return deepFreeze({ decision: "block-and-reconcile", replay: false, record: blocked });
  }
  return deepFreeze({ decision: "consistent", replay: false, record });
}

// ---------------------------------------------------------------------------
// Deterministic handoff generation
// ---------------------------------------------------------------------------

export function handoffFromRecord(record) {
  assertIntegrity(record);
  if (!["approved", "dispatching", "running"].includes(record.state)) {
    throw new PilotError("handoff-requires-approval", "handoff requires an approved, dispatching, or running record");
  }
  assertApprovalCurrent(record);
  const p = record.proposal;
  const limits = p.operation_limits;
  return deepFreeze({
    task: {
      title: p.title,
      revision: p.revision,
      kind: p.kind,
      repository: p.repository,
      original_checkout: p.original_checkout,
    },
    authorization: {
      source: "explicit approval",
      approved_phases: record.approval.approved_phases.slice(),
      approved_by: record.approval.approved_by,
      approved_at: record.approval.approved_at,
      edit: limits.edit,
      validate: limits.validate,
      create_branch: limits.create_branch,
      create_worktree: limits.create_worktree,
      commit: limits.commit,
      push: limits.push,
      create_or_update_pr: limits.create_or_update_pr,
    },
    execution: {
      workflow: LOCAL_BUILD_POLICY.workflow,
      isolation: LOCAL_BUILD_POLICY.isolation,
      base_kind: LOCAL_BUILD_POLICY.base_kind,
      delivery_policy: LOCAL_BUILD_POLICY.delivery_policy,
      commit_confirmation: LOCAL_BUILD_POLICY.commit_confirmation,
      origin_session: p.origin_session,
    },
    plan: p.plan,
    digests: { proposal: record.digest },
  });
}

// Renders the structured handoff as stable JSON, not hand-built YAML. Free text
// (title, paths, phases, approver, session, plan) is JSON-escaped, so delimiters
// cannot alter the envelope or fabricate operation flags. Callers read authority
// fields from the parsed object, never by string matching.
//
// This is an inactive, offline envelope. A live handoff still needs future
// adapter fields and verified runtime facts (host confirmation, real session and
// worker identity, permissions); this is not dispatch-ready authorization.
export function renderHandoff(record) {
  return `${JSON.stringify(handoffFromRecord(record), null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Serialization / rehydration
// ---------------------------------------------------------------------------

export function serialize(record) {
  assertIntegrity(record);
  return `${JSON.stringify(record, null, 2)}\n`;
}

export function restoreRecord(parsed) {
  assertIntegrity(parsed);
  return deepFreeze(parsed);
}

export function deserialize(text) {
  if (typeof text !== "string") {
    throw new PilotError("invalid-serialization", "serialized record must be a string");
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new PilotError("invalid-serialization", "record is not valid JSON");
  }
  return restoreRecord(parsed);
}
