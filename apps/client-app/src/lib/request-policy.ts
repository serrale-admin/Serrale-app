/**
 * request-policy — the pure, unit-testable reliability policy for the SERRALE
 * Basic network layer. It answers three questions with zero I/O:
 *
 *   1. Should this failed request be retried, and after how long?  (classifyRetry)
 *   2. What is the backoff delay for a given attempt?               (computeBackoffDelay)
 *   3. Is the read path healthy enough to attempt right now?        (createReadCircuit)
 *
 * It also owns request-identity/metadata helpers (generateRequestId) and the
 * per-route timeout policy (defaultTimeoutFor). `http.ts` is the only orchestrator
 * that wires these together against real `fetch`; keeping the decisions here makes
 * them trivial to test with fake timers and without touching the network.
 *
 * Design notes
 * ------------
 * - RETRY SCOPE: only idempotent reads (GET) are ever retried, and only on a pure
 *   network failure or a transient status (408/502/503/504). Writes (OTP verify,
 *   lead/request, provider contact logging, session mutations) are NEVER retried
 *   here — they have no idempotency contract, so a blind replay could duplicate a
 *   lead or burn an OTP. 429 is never retried in a tight loop: we retry it only
 *   when the server told us exactly how long to wait via Retry-After AND that wait
 *   is within a sane cap; otherwise we surface it.
 * - BACKOFF: exponential base-delay doubling per attempt, clamped to a ceiling,
 *   with FULL jitter (uniform in [0, ceiling]). Full jitter avoids retry stampedes
 *   far better than equal/decorrelated jitter for a small mobile client.
 * - CIRCUIT: one global read-circuit. This is a single-backend app, so a per-host
 *   or per-path-prefix circuit would add bookkeeping without changing behavior —
 *   every read hits the same API origin. The circuit gates READS ONLY; it is never
 *   consulted for writes or for logout/session cleanup, so connectivity trouble can
 *   never trap a user in a session they are trying to leave.
 */

// ---------------------------------------------------------------------------
// Tunables (exported so tests assert against the same constants the code uses).
// ---------------------------------------------------------------------------

/** Default timeout for idempotent reads. */
export const READ_TIMEOUT_MS = 15000;
/** Longer timeout for OTP + request-submission writes (SMS round-trips, etc). */
export const WRITE_TIMEOUT_MS = 20000;

/** Max automatic retries for an eligible read (initial try + this many retries). */
export const MAX_RETRIES = 2;
/** Base backoff unit; attempt n ceiling is BACKOFF_BASE_MS * 2^(n-1). */
export const BACKOFF_BASE_MS = 300;
/** Absolute ceiling for any single backoff delay. */
export const BACKOFF_MAX_MS = 4000;
/**
 * Upper bound we are willing to honor for a server-supplied Retry-After before we
 * give up and surface the error instead of holding the request hostage.
 */
export const RETRY_AFTER_CAP_MS = 10000;

/** Consecutive read failures that trip the circuit open. */
export const CIRCUIT_FAILURE_THRESHOLD = 5;
/** How long the circuit stays open before allowing a single half-open probe. */
export const CIRCUIT_COOLDOWN_MS = 30000;

/** Transient HTTP statuses we treat as retryable for reads. */
export const RETRYABLE_STATUSES: readonly number[] = [408, 502, 503, 504];
/** Statuses that carry a Retry-After we should honor. */
const RETRY_AFTER_STATUSES: readonly number[] = [429, 503];

// ---------------------------------------------------------------------------
// Request identity + safe metadata.
// ---------------------------------------------------------------------------

/**
 * Hermes-safe RFC-4122 v4 UUID.
 *
 * `expo-crypto` is not a dependency of this app and adding it would churn the
 * lockfile, and Hermes (Expo SDK 52 / RN 0.76) ships neither `crypto.randomUUID`
 * nor Node's `crypto`. We therefore derive a v4 UUID from `Math.random`. This is
 * NOT used for anything security-sensitive — request ids are correlation/tracing
 * ids only (no tokens, no PII), so a CSPRNG is unnecessary. Collision probability
 * across a mobile session is negligible.
 */
export function generateRequestId(): string {
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += '-';
    } else if (i === 14) {
      out += '4'; // version
    } else {
      const r = (Math.random() * 16) | 0;
      out += (i === 19 ? (r & 0x3) | 0x8 : r).toString(16); // variant on the 19th nibble
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Timeout policy.
// ---------------------------------------------------------------------------

/** Endpoints (by path suffix) that warrant the longer write timeout. */
const LONG_WRITE_PATHS = ['/otp/request', '/otp/verify', '/leads/request', '/leads/provider'];

/**
 * Default timeout for a call, absent an explicit per-call override. Reads get the
 * short read budget; OTP/lead writes get the longer write budget because they can
 * involve an SMS provider round-trip or heavier server work.
 */
export function defaultTimeoutFor(method: string, path: string): number {
  if (method === 'GET') return READ_TIMEOUT_MS;
  if (LONG_WRITE_PATHS.some((p) => path.includes(p))) return WRITE_TIMEOUT_MS;
  // Other writes still get the longer, safer budget by default.
  return WRITE_TIMEOUT_MS;
}

// ---------------------------------------------------------------------------
// Retry classification.
// ---------------------------------------------------------------------------

export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Normalized outcome of a single attempt, handed to the classifier. */
export type AttemptOutcome =
  | { kind: 'network' }
  | { kind: 'aborted' }
  | { kind: 'http'; status: number; retryAfterMs?: number };

export interface RetryDecision {
  retry: boolean;
  /**
   * When set, the caller MUST wait exactly this long (server-directed via
   * Retry-After). When undefined and `retry` is true, the caller uses
   * `computeBackoffDelay(attempt)` for a jittered backoff.
   */
  delayMs?: number;
  reason: string;
}

/** GET is the only method we treat as safe to replay automatically. */
export function isIdempotentRead(method: string): boolean {
  return method === 'GET';
}

/**
 * Decide whether a just-failed attempt should be retried.
 *
 * @param method   HTTP method of the request.
 * @param _path    Request path (reserved for future per-path tuning; unused today).
 * @param outcome  What went wrong.
 * @param attempt  How many attempts have already been made (1 = the first try
 *                 that just failed). Retries stop once this reaches MAX_RETRIES.
 */
export function classifyRetry(
  method: string,
  _path: string,
  outcome: AttemptOutcome,
  attempt = 1,
): RetryDecision {
  // A caller-initiated cancellation is never retried, regardless of method.
  if (outcome.kind === 'aborted') return { retry: false, reason: 'aborted' };

  // Only idempotent reads are ever auto-retried.
  if (!isIdempotentRead(method)) return { retry: false, reason: 'non-idempotent-method' };

  // Strict attempt cap.
  if (attempt >= MAX_RETRIES) return { retry: false, reason: 'attempt-cap' };

  if (outcome.kind === 'network') return { retry: true, reason: 'network-error' };

  const { status } = outcome;

  // Retry-After-bearing statuses (429 always, 503 sometimes): honor the server's
  // instruction, but never loop tightly and never wait longer than the cap.
  if (RETRY_AFTER_STATUSES.includes(status)) {
    const ra = outcome.retryAfterMs;
    if (status === 429) {
      // 429 is ONLY retried when the server gave an explicit, sane Retry-After.
      if (ra === undefined) return { retry: false, reason: 'rate-limited-no-retry-after' };
      if (ra > RETRY_AFTER_CAP_MS) return { retry: false, reason: 'retry-after-too-long' };
      return { retry: true, delayMs: ra, reason: 'rate-limited-honored' };
    }
    // status === 503 with a Retry-After: honor it if sane; otherwise fall through
    // to the plain retryable-status path (jittered backoff).
    if (ra !== undefined) {
      if (ra > RETRY_AFTER_CAP_MS) return { retry: false, reason: 'retry-after-too-long' };
      return { retry: true, delayMs: ra, reason: 'unavailable-honored' };
    }
  }

  if (RETRYABLE_STATUSES.includes(status)) {
    return { retry: true, reason: `retryable-status-${status}` };
  }

  return { retry: false, reason: `non-retryable-status-${status}` };
}

/**
 * Full-jitter exponential backoff. Attempt n (1-based) has ceiling
 * min(BACKOFF_BASE_MS * 2^(n-1), BACKOFF_MAX_MS); the actual delay is uniform in
 * [0, ceiling]. Returns an integer millisecond delay.
 */
export function computeBackoffDelay(attempt: number): number {
  const exp = Math.max(0, attempt - 1);
  const ceiling = Math.min(BACKOFF_BASE_MS * 2 ** exp, BACKOFF_MAX_MS);
  // `Math.random()` is [0, 1); the extra Math.min guards the degenerate case so
  // the ceiling is always a hard upper bound on the returned delay.
  return Math.min(ceiling, Math.floor(Math.random() * (ceiling + 1)));
}

/**
 * Parse a Retry-After header value (delta-seconds OR HTTP-date) to a millisecond
 * delay from now. Returns undefined when absent/unparseable, and clamps a past
 * date to 0.
 */
export function parseRetryAfter(value: string | null | undefined): number | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (trimmed === '') return undefined;

  // delta-seconds form
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10) * 1000;

  // HTTP-date form
  const dateMs = Date.parse(trimmed);
  if (Number.isNaN(dateMs)) return undefined;
  return Math.max(0, dateMs - Date.now());
}

// ---------------------------------------------------------------------------
// Read circuit breaker (single global instance for this single-backend app).
// ---------------------------------------------------------------------------

export type CircuitStatus = 'closed' | 'open' | 'half-open';

export interface CircuitState {
  status: CircuitStatus;
  consecutiveFailures: number;
  /** Epoch ms at which the open circuit becomes eligible for a probe (open only). */
  openUntil: number | null;
}

export interface ReadCircuit {
  /** Whether a read may proceed now. Reserves the single probe slot in half-open. */
  canRequest(): boolean;
  /** Record a successful read (closes the circuit / resets the failure counter). */
  onSuccess(): void;
  /** Record a failed read (may trip open, or re-open from a failed probe). */
  onFailure(): void;
  getState(): CircuitState;
  subscribe(listener: (s: CircuitState) => void): () => void;
  /** Force closed and clear internal timing (used by session cleanup on logout). */
  reset(): void;
}

/**
 * Factory for an isolated circuit (the app uses one global instance, but tests
 * create fresh ones). The half-open state permits exactly ONE probe: the first
 * `canRequest()` after cool-down flips to half-open and consumes the probe slot;
 * concurrent callers see `false` until that probe resolves via onSuccess/onFailure.
 */
export function createReadCircuit(): ReadCircuit {
  let status: CircuitStatus = 'closed';
  let consecutiveFailures = 0;
  let openUntil: number | null = null;
  let probeInFlight = false;
  const listeners = new Set<(s: CircuitState) => void>();

  const snapshot = (): CircuitState => ({ status, consecutiveFailures, openUntil });

  const emit = () => {
    const s = snapshot();
    listeners.forEach((l) => l(s));
  };

  const open = () => {
    status = 'open';
    openUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    probeInFlight = false;
    emit();
  };

  const close = () => {
    const was = status;
    status = 'closed';
    consecutiveFailures = 0;
    openUntil = null;
    probeInFlight = false;
    if (was !== 'closed') emit();
  };

  return {
    canRequest() {
      if (status === 'closed') return true;
      if (status === 'open') {
        // Cool-down elapsed? Promote to half-open and hand out the single probe.
        if (openUntil !== null && Date.now() >= openUntil) {
          status = 'half-open';
          probeInFlight = true;
          emit();
          return true;
        }
        return false;
      }
      // half-open: allow only if the probe slot is free.
      if (!probeInFlight) {
        probeInFlight = true;
        return true;
      }
      return false;
    },

    onSuccess() {
      if (status === 'closed') {
        if (consecutiveFailures !== 0) {
          consecutiveFailures = 0;
          // no status change; no emit needed for a counter reset while closed
        }
        return;
      }
      // half-open probe (or a late success while open) succeeded → close.
      close();
    },

    onFailure() {
      if (status === 'half-open') {
        // Probe failed → straight back to open with a fresh cool-down.
        consecutiveFailures += 1;
        open();
        return;
      }
      if (status === 'open') {
        // Already open; keep counting but don't reset the cool-down.
        consecutiveFailures += 1;
        return;
      }
      // closed
      consecutiveFailures += 1;
      if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) open();
    },

    getState: snapshot,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    reset() {
      close();
    },
  };
}
