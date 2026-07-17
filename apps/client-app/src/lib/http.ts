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

export type NetworkFailureKind = 'offline' | 'connection' | 'timeout' | 'cancelled';

function inferNetworkFailureKind(message: string): NetworkFailureKind {
  const lower = message.toLowerCase();
  if (lower.includes('cancel')) return 'cancelled';
  if (lower.includes('timed out') || lower.includes('timeout')) return 'timeout';
  if (lower.includes('connection') || lower.includes('dns') || lower.includes('tls')) return 'connection';
  return 'offline';
}

/** Network failure (no response), classified without exposing raw system text. */
export class NetworkError extends Error {
  public readonly failureKind: NetworkFailureKind;

  constructor(
    message = 'Connection problem',
    failureKind?: NetworkFailureKind,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'NetworkError';
    this.failureKind = failureKind ?? inferNetworkFailureKind(message);
  }
}

/** A 2xx response whose body violates the declared JSON/empty-body contract. */
export class MalformedResponseError extends Error {
  constructor(
    message = 'Malformed response',
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'MalformedResponseError';
  }
}

/**
 * Raw retry signals captured off a 429 response (additive; no parsing here).
 * Interpretation — precedence, stricter-wins, HTTP-date rejection — lives in
 * `lib/otp-retry.ts` (`retryInfoFromError`), keeping this module free of any
 * OTP-specific logic.
 */
export interface HttpRetryRaw {
  /** The envelope's error object (may carry `retry_after_seconds` / `next_allowed_at`). */
  body?: Record<string, unknown>;
  /** Raw `Retry-After` header value, or null when absent. */
  retryAfter: string | null;
  /** Raw `RateLimit-Reset` header value (express standardHeaders), or null. */
  rateLimitReset: string | null;
}

/** Non-2xx HTTP response. */
export class HttpError extends Error {
  /** Populated on 429 responses only — see `retryInfoFromError` in lib/otp-retry.ts. */
  retryRaw?: HttpRetryRaw;
  constructor(
    public status: number,
    message: string,
    public code?: string,
    /** Parsed Retry-After delay (ms) when the server sent one (429/503). */
    public retryAfterMs?: number,
    public readonly requestId?: string,
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
    public readonly requestId?: string,
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
  /** Extra request headers (e.g. an Idempotency-Key for OTP sends). */
  headers?: Record<string, string>;
  /** Explicit contract opt-in for endpoints that legitimately return no body. */
  allowEmptyResponse?: boolean;
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
export const APP_VERSION: string =
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
 * diagnostic and best-effort; defaults to 'unknown'.
 *
 * MUST be a route TEMPLATE only — e.g. `/provider/[id]`, `/(tabs)/home` — built
 * from expo-router's `useSegments()` (unresolved file-path segments), never a
 * concrete resolved path from `usePathname()`/`useUnstableGlobalHref()`. Concrete
 * paths can embed dynamic-segment values (ids, phone numbers, etc.) and would leak
 * that data into request metadata / server-side logs. See `_layout.tsx`, which is
 * the sole caller and owns the segments→template join.
 */
let currentRoute = 'unknown';

/**
 * Joins expo-router `useSegments()` output into a route TEMPLATE string, e.g.
 * `['provider', '[id]'] → '/provider/[id]'`. Segments are unresolved file-path
 * pieces (dynamic segments stay as literal `[id]`, group segments stay as
 * literal `(tabs)`), so the result is always PII-free by construction — there is
 * no concrete param value to accidentally include. Root route (`[]`) → `'/'`.
 */
export function segmentsToRouteTemplate(segments: readonly string[]): string {
  if (!segments || segments.length === 0) return '/';
  return `/${segments.join('/')}`;
}

/**
 * Router layer calls this (from a `useSegments()` effect in `_layout.tsx`) to tag
 * requests with the current route TEMPLATE. Callers must never pass a concrete
 * path (e.g. from `usePathname()`) — see the `currentRoute` doc comment above.
 */
export function setCurrentRoute(route: string | null | undefined) {
  currentRoute = route && route.trim() ? route.trim() : 'unknown';
}

function metadataHeaders(requestId: string): Record<string, string> {
  return {
    'X-Request-Id': requestId,
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

/**
 * Basic catalog GETs that the backend serves without auth. Never attach a
 * customer session Bearer here — an expired token would otherwise poison the
 * global 401 interceptor and blank Home/Search after login.
 */
export function isUnauthenticatedPublicRead(method: string, path: string): boolean {
  if (method.toUpperCase() !== 'GET') return false;
  const normalized = path.split('?')[0].replace(/\/+$/, '');
  const marker = '/public-directory';
  const idx = normalized.indexOf(marker);
  const route = idx >= 0 ? normalized.slice(idx + marker.length) || '/' : normalized;

  if (route === '/categories' || route.startsWith('/categories/')) return true;
  if (route === '/search' || route.startsWith('/search/')) return true;
  if (route === '/providers') return true;
  // /providers/:id is public; /providers/me* is authenticated.
  // Rating eligibility needs the customer Bearer when present — do not strip it.
  if (route.includes('/reviews/eligibility')) return false;
  // Published review lists are public reads.
  if (/\/providers\/[^/]+\/reviews$/.test(route)) return true;
  if (route.startsWith('/providers/')) {
    const rest = route.slice('/providers/'.length);
    const segment = rest.split('/')[0];
    return !!segment && segment !== 'me';
  }
  return false;
}

/**
 * Unwrap API error payloads. Supports both the standard envelope
 * `{ success:false, error:{ code, message } }` and the catch-all 404 shape
 * `{ error:"NOT_FOUND", message:"Endpoint … does not exist…" }` from app.ts.
 */
export function errorMessage(e: Envelope<unknown>): { message: string; code?: string } {
  if (e.error && typeof e.error === 'object') {
    return {
      message: e.error.message || e.message || 'Request failed',
      code: e.error.code,
    };
  }
  if (typeof e.error === 'string') {
    // Catch-all routes put the code in `error` and the human text in `message`.
    return { message: e.message || e.error, code: e.error };
  }
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
    // T3: per-call extra headers (e.g. Idempotency-Key on OTP sends). Spread into
    // the fetch headers below, AFTER metadataHeaders(), so a per-call header wins
    // a name collision (there are none today) but can never clobber metadata.
    headers: extraHeaders,
    allowEmptyResponse = false,
  } = opts;

  const requestId = generateRequestId();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort);

  const activeToken = token || (tokenProvider ? await tokenProvider() : undefined);
  // Public catalog reads must not send a customer Bearer. A stale/expired token
  // attached to /providers or /categories can trip the 401 refresh interceptor
  // and wipe the Home/Search rails even though those routes are unauthenticated.
  const attachCustomerToken =
    !!token || (!!activeToken && !isUnauthenticatedPublicRead(method, path));
  const authorizationToken = attachCustomerToken ? activeToken : undefined;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...metadataHeaders(requestId),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authorizationToken ? { Authorization: `Bearer ${authorizationToken}` } : {}),
        ...(extraHeaders || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    // Caller-initiated abort vs. timeout/offline. Only a caller abort is a
    // "cancellation"; a timeout is a network failure that reads may retry.
    const abortedByCaller = !!signal?.aborted;
    const kind = classifyTransportFailure(err, abortedByCaller);
    const message =
      kind === 'timeout'
        ? 'The request timed out.'
        : kind === 'cancelled'
          ? 'Request cancelled.'
          : kind === 'connection'
            ? 'Connection problem.'
            : 'Device offline.';
    throw new NetworkError(message, kind, requestId);
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }

  const text = await res.text();
  let parsed: unknown = null;
  let parseFailed = false;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parseFailed = true;
    }
  }

  if (res.status === 401 && !skipAuthInterceptor && unauthorizedHandler && authorizationToken) {
    const isSafe = method === 'GET';
    return await unauthorizedHandler(() => http<T>(path, { ...opts, skipAuthInterceptor: true }), isSafe);
  }

  if (!res.ok) {
    const envelope = isEnvelope(parsed) ? parsed : null;
    const { message, code } = envelope ? errorMessage(envelope) : { message: `Request failed (${res.status})`, code: undefined };
    // T4: parsed Retry-After (ms) feeds the retry POLICY (GET 429/503 backoff via
    // classifyRetry → `outcome.retryAfterMs`). Writes are never retried, so this is
    // only ever consulted for eligible reads.
    const retryAfterMs = parseRetryAfter(readHeader(res, 'Retry-After'));
    const error = new HttpError(res.status, message, code, retryAfterMs, requestId);
    // T3: additive 429 enrichment — capture the RAW cooldown signals (error-body
    // fields + Retry-After / RateLimit-Reset headers) so the OTP UI can show a
    // specific wait. This rides on the thrown error and is a SEPARATE consumer of
    // the same headers from T4's retryAfterMs above (no shared mutable state; the
    // two never interfere). No parsing here — see `retryInfoFromError` in
    // lib/otp-retry.ts. Uses the defensive `readHeader` helper for test-shape safety.
    if (res.status === 429) {
      error.retryRaw = {
        body:
          envelope && envelope.error && typeof envelope.error === 'object'
            ? (envelope.error as Record<string, unknown>)
            : undefined,
        retryAfter: readHeader(res, 'Retry-After'),
        rateLimitReset: readHeader(res, 'RateLimit-Reset'),
      };
    }
    throw error;
  }
  if (!text && allowEmptyResponse) return undefined as T;
  if (parseFailed || !text || parsed === null) {
    throw new MalformedResponseError('Malformed response', requestId);
  }
  if (isEnvelope(parsed) && parsed.success === false) {
    const { message, code } = errorMessage(parsed);
    throw new ApiBusinessError(message, code, requestId);
  }
  // Some endpoints may return the payload directly (no envelope) — fall back to that.
  return isEnvelope(parsed) && 'data' in parsed ? (parsed.data as T) : (parsed as T);
}

function isEnvelope(value: unknown): value is Envelope<unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Convert raw transport diagnostics to a coarse safe class; raw text is never displayed. */
function classifyTransportFailure(error: unknown, abortedByCaller: boolean): NetworkFailureKind {
  if (abortedByCaller) return 'cancelled';
  const candidate = error as { name?: unknown; code?: unknown; message?: unknown } | null;
  if (candidate?.name === 'AbortError') return 'timeout';
  const signal = `${String(candidate?.code ?? '')} ${String(candidate?.message ?? '')}`.toLowerCase();
  if (
    /enotfound|eai_again|dns|tls|ssl|certificate|cert_|econnrefused|econnreset|connection refused|network connection was lost/.test(
      signal,
    )
  ) {
    return 'connection';
  }
  return 'offline';
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
    const fire = () => reject(new NetworkError('Request cancelled.', 'cancelled'));
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
    throw new NetworkError('Device offline or service busy.', 'offline', generateRequestId());
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
  if (err instanceof MalformedResponseError) return { kind: 'http', status: 200 };
  // NetworkError (offline/timeout) or anything unexpected → network failure.
  return { kind: 'network' };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
