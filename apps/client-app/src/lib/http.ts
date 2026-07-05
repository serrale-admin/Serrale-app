import Constants from 'expo-constants';
import { API_BASE_URL } from './env';
import {
  AttemptOutcome,
  RequestMethod,
  classifyRetry,
  computeBackoffDelay,
  createReadCircuit,
  defaultTimeoutFor,
  generateRequestId,
  isIdempotentRead,
  parseRetryAfter,
} from './request-policy';

/** Network failure (no response — offline, DNS, TLS, timeout). */
export class NetworkError extends Error {
  constructor(message = 'Connection problem') {
    super(message);
    this.name = 'NetworkError';
  }
}

/** Non-2xx HTTP response. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    /** Parsed Retry-After delay (ms) when the server sent one (429/503). */
    public retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** 2xx response but the API envelope reported `success: false`. */
export class ApiBusinessError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiBusinessError';
  }
}

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  /** Bearer token (verify_token or session_token) when an endpoint requires it. */
  token?: string;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  timeoutMs?: number;
  skipAuthInterceptor?: boolean;
}

/** The SERRALE API envelope: `{ success, data }` on success, `{ success:false, error }` on failure. */
interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string } | string;
  message?: string;
}

type TokenProvider = () => Promise<string | null>;
type UnauthorizedHandler = (replay: () => Promise<any>, isSafe: boolean) => Promise<any>;

let tokenProvider: TokenProvider | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

// ---------------------------------------------------------------------------
// Static, PII-free client metadata attached to every request.
// ---------------------------------------------------------------------------

/**
 * App version from expo-constants. Read once at module load — it never changes at
 * runtime. Falls back to '0.0.0' if the manifest is unavailable (e.g. under Jest).
 */
const APP_VERSION: string =
  (Constants.expoConfig?.version as string | undefined) ??
  ((Constants as any).manifest?.version as string | undefined) ??
  '0.0.0';

/**
 * `X-Serrale-Source` → backend `platform` (KNOWN_PLATFORMS). This app is the
 * native Basic mobile client, so it is always `mobile_app`. Reading this header
 * is how the backend (utils/requestContext.ts) attributes System Log / Basic
 * submission rows to the mobile app instead of a plain mobile-browser visit —
 * closing contract-matrix gap M-9.
 */
const SOURCE = 'mobile_app';

/**
 * `X-Serrale-Route` → backend `appSurface` (KNOWN_APP_SURFACES). The backend
 * validates this against a fixed enum ('basic' | 'plus' | 'admin' | ...), so it
 * MUST be the app-surface identifier, not a client route path. The live route
 * path (for our own diagnostics) rides separately in `X-Serrale-App-Route`.
 */
const APP_SURFACE = 'basic';

/**
 * Current in-app route, updated by the router layer via `setCurrentRoute`. Purely
 * diagnostic and best-effort; defaults to 'unknown'. Never contains PII (route
 * templates only — e.g. `/provider/[id]`, not the concrete id or any user data).
 */
let currentRoute = 'unknown';

/** Router layer calls this (e.g. from a usePathname effect) to tag requests. */
export function setCurrentRoute(route: string | null | undefined) {
  currentRoute = route && route.trim() ? route.trim() : 'unknown';
}

function metadataHeaders(): Record<string, string> {
  return {
    'X-Request-Id': generateRequestId(),
    'X-Serrale-Source': SOURCE,
    'X-Serrale-Route': APP_SURFACE,
    'X-Serrale-App-Version': APP_VERSION,
    // Coarse, non-PII platform hint. `app_surface=basic` lets the backend/log
    // pipeline group Basic traffic without parsing the enum header above.
    'X-Serrale-Platform': `app_surface=${APP_SURFACE}; route=${currentRoute}`,
  };
}

// ---------------------------------------------------------------------------
// Read circuit breaker + subscribable network status (single global instance).
// ---------------------------------------------------------------------------

let readCircuit = createReadCircuit();

export interface NetworkStatus {
  /** 'closed' = healthy, 'open' = degraded (reads short-circuited), 'half-open' = probing. */
  circuit: 'closed' | 'open' | 'half-open';
  degraded: boolean;
}

const statusListeners = new Set<(s: NetworkStatus) => void>();

function currentStatus(): NetworkStatus {
  const status = readCircuit.getState().status;
  return { circuit: status, degraded: status !== 'closed' };
}

function emitStatus() {
  const s = currentStatus();
  statusListeners.forEach((l) => l(s));
}

// Bridge circuit transitions to the public network-status stream.
let circuitUnsub = readCircuit.subscribe(emitStatus);

/** Snapshot of network health for UI (offline/degraded banners, retry actions). */
export function getNetworkStatus(): NetworkStatus {
  return currentStatus();
}

/** Subscribe to network-health changes. Returns an unsubscribe fn. */
export function subscribeNetworkStatus(listener: (s: NetworkStatus) => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/**
 * Test/reset hook: rebuilds the circuit and clears the in-flight dedupe map so
 * each test starts from a clean, closed state. Not used by app code.
 */
export function __resetNetworkReliability() {
  circuitUnsub();
  readCircuit = createReadCircuit();
  circuitUnsub = readCircuit.subscribe(emitStatus);
  inFlight.clear();
  emitStatus();
}

// ---------------------------------------------------------------------------
// URL + envelope helpers (unchanged behavior).
// ---------------------------------------------------------------------------

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = path.startsWith('http') ? path : API_BASE_URL + (path.startsWith('/') ? path : '/' + path);
  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
}

function errorMessage(e: Envelope<unknown>): { message: string; code?: string } {
  if (e.error && typeof e.error === 'object') return { message: e.error.message || 'Request failed', code: e.error.code };
  if (typeof e.error === 'string') return { message: e.error };
  if (e.message) return { message: e.message };
  return { message: 'Something went wrong' };
}

/** Defensive header read — some (test) Response shapes omit `headers`. */
function readHeader(res: Response, name: string): string | null {
  try {
    return res.headers?.get?.(name) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core request (one network attempt) — preserves the 401 interceptor exactly.
// ---------------------------------------------------------------------------

/**
 * A single network attempt: builds the request (with id + metadata headers),
 * enforces the timeout, unwraps the envelope, and runs the 401 refresh
 * interceptor. This is intentionally the SAME control flow the app has always
 * relied on — the reliability wrapper (`http`) sits OUTSIDE it and only for
 * eligible reads, so single-flight refresh / replay semantics are untouched.
 *
 * The 401 replay recurses back through `http()` with `skipAuthInterceptor: true`;
 * that path skips retry/dedupe/circuit (writes and internal recursion never
 * auto-retry), so the interceptor's single-flight + replay-once guarantees hold.
 */
async function coreHttp<T>(path: string, opts: RequestOptions): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    query,
    signal,
    timeoutMs = defaultTimeoutFor(method, path),
    skipAuthInterceptor,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort);

  const activeToken = token || (tokenProvider ? await tokenProvider() : undefined);

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...metadataHeaders(),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    // Caller-initiated abort vs. timeout/offline. Only a caller abort is a
    // "cancellation"; a timeout is a network failure that reads may retry.
    const abortedByCaller = !!signal?.aborted;
    throw new NetworkError(
      (err as Error)?.name === 'AbortError' && !abortedByCaller
        ? 'The request timed out. Check your internet and try again.'
        : abortedByCaller
          ? 'Request cancelled.'
          : 'Check your internet and try again.',
    );
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }

  const text = await res.text();
  let parsed: Envelope<T> | null = null;
  try {
    parsed = text ? (JSON.parse(text) as Envelope<T>) : null;
  } catch {
    parsed = null;
  }

  if (res.status === 401 && !skipAuthInterceptor && unauthorizedHandler) {
    const isSafe = method === 'GET';
    return await unauthorizedHandler(() => http<T>(path, { ...opts, skipAuthInterceptor: true }), isSafe);
  }

  if (!res.ok) {
    const { message, code } = parsed ? errorMessage(parsed) : { message: `Request failed (${res.status})`, code: undefined };
    const retryAfterMs = parseRetryAfter(readHeader(res, 'Retry-After'));
    throw new HttpError(res.status, message, code, retryAfterMs);
  }
  if (parsed && parsed.success === false) {
    const { message, code } = errorMessage(parsed);
    throw new ApiBusinessError(message, code);
  }
  // Some endpoints may return the payload directly (no envelope) — fall back to that.
  return parsed && 'data' in parsed ? (parsed.data as T) : ((parsed as unknown) as T);
}

// ---------------------------------------------------------------------------
// In-flight GET dedupe.
// ---------------------------------------------------------------------------

/**
 * Shared in-flight reads, keyed by method+url(+query). Subscribers await the same
 * underlying promise. A deduped subscriber that passes its own AbortSignal can
 * bail WITHOUT cancelling the shared request: we race the shared promise against
 * that subscriber's abort, so the underlying fetch keeps running for the others.
 * (Ref-counting the AbortControllers was the alternative; racing is simpler and
 * has the same user-visible guarantee — a single subscriber's cancel is local.)
 */
const inFlight = new Map<string, Promise<unknown>>();

function dedupeKey(method: string, path: string, query?: Record<string, QueryValue>): string {
  return `${method} ${buildUrl(path, query)}`;
}

function rejectOnAbort(signal: AbortSignal): Promise<never> {
  return new Promise<never>((_resolve, reject) => {
    const fire = () => reject(new NetworkError('Request cancelled.'));
    if (signal.aborted) return fire();
    signal.addEventListener('abort', fire, { once: true });
  });
}

// ---------------------------------------------------------------------------
// Public entrypoint: reliability wrapper around coreHttp.
// ---------------------------------------------------------------------------

/**
 * Typed fetch against the SERRALE API. Unwraps the `{ success, data }` envelope
 * and throws typed errors (NetworkError / HttpError / ApiBusinessError).
 *
 * For eligible idempotent reads (GET, not skipping the auth interceptor) this adds
 * three reliability behaviors, all delegating decisions to `request-policy`:
 *   - in-flight dedupe (identical concurrent GETs share one network call),
 *   - a read circuit breaker (short-circuits reads while the backend looks down),
 *   - bounded retries with full-jitter backoff / Retry-After honoring.
 *
 * Writes, the 401-replay recursion, and any `skipAuthInterceptor` call bypass all
 * of the above and go straight through `coreHttp` — so nothing here can duplicate
 * a lead, replay a write, or block logout/session cleanup.
 */
export async function http<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? 'GET';

  // Writes and internal recursion (refresh/replay/logout) never get dedupe,
  // circuit gating, or retries. This is the single guard that keeps the 401
  // interceptor's semantics and write-safety intact.
  const eligible = isIdempotentRead(method) && !opts.skipAuthInterceptor;
  if (!eligible) {
    return coreHttp<T>(path, opts);
  }

  const key = dedupeKey(method, path, opts.query);

  // Join an identical in-flight read rather than starting a new one.
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) {
    // If this subscriber can be cancelled, let it bail locally without killing
    // the shared request for everyone else.
    if (opts.signal) return Promise.race([existing, rejectOnAbort(opts.signal)]);
    return existing;
  }

  const shared = runWithReliability<T>(path, opts, method).finally(() => {
    // Only clear if we're still the owner (a later identical read may have
    // replaced us after we settled — Map.delete is keyed, so this is safe).
    if (inFlight.get(key) === shared) inFlight.delete(key);
  });
  inFlight.set(key, shared as Promise<unknown>);

  // The initiating caller also honors its own abort signal locally.
  if (opts.signal) return Promise.race([shared, rejectOnAbort(opts.signal)]);
  return shared;
}

/**
 * Circuit-gated, retrying execution of an eligible read. Kept separate from the
 * dedupe bookkeeping so the shared promise stored in `inFlight` already includes
 * retries — deduped subscribers transparently share the retried outcome.
 */
async function runWithReliability<T>(path: string, opts: RequestOptions, method: RequestMethod): Promise<T> {
  // Circuit gate: if reads are currently short-circuited, fail fast without
  // touching the network. `canRequest()` also reserves the half-open probe slot.
  // The gate is checked once per *read* (not per attempt): a permitted read may
  // still exhaust its small retry budget below even if a mid-read failure trips
  // the circuit — that keeps the circuit boundary aligned with the dedupe/read
  // boundary and bounds worst-case attempts at MAX_RETRIES.
  if (!readCircuit.canRequest()) {
    throw new NetworkError("You're offline or the service is busy. Pull to retry.");
  }

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      const result = await coreHttp<T>(path, opts);
      readCircuit.onSuccess();
      return result;
    } catch (err) {
      const outcome = toOutcome(err, opts.signal);

      // Circuit accounting: network + 5xx failures count against read health;
      // a caller abort or a 4xx does not indicate the backend is unhealthy.
      if (outcome.kind === 'network' || (outcome.kind === 'http' && outcome.status >= 500)) {
        readCircuit.onFailure();
      } else if (outcome.kind !== 'aborted') {
        // A definitive non-5xx response means the backend answered → healthy.
        readCircuit.onSuccess();
      }

      const decision = classifyRetry(method, path, outcome, attempt);
      if (!decision.retry) throw err;

      const delay = decision.delayMs ?? computeBackoffDelay(attempt);
      if (delay > 0) await sleep(delay);
      // loop for the next attempt
    }
  }
}

/** Map a thrown error + the caller's signal to a policy AttemptOutcome. */
function toOutcome(err: unknown, signal?: AbortSignal): AttemptOutcome {
  if (signal?.aborted) return { kind: 'aborted' };
  if (err instanceof HttpError) return { kind: 'http', status: err.status, retryAfterMs: err.retryAfterMs };
  if (err instanceof ApiBusinessError) {
    // A 2xx envelope with success:false is an application error, not a transport
    // failure — never retried, never counted against the circuit.
    return { kind: 'http', status: 200 };
  }
  // NetworkError (offline/timeout) or anything unexpected → network failure.
  return { kind: 'network' };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
