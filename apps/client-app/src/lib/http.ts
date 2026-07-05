import { API_BASE_URL } from './env';

/** Network failure (no response — offline, DNS, TLS, timeout). */
export class NetworkError extends Error {
  constructor(message = 'Connection problem') {
    super(message);
    this.name = 'NetworkError';
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
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Bearer token (verify_token or session_token) when an endpoint requires it. */
  token?: string;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  timeoutMs?: number;
  skipAuthInterceptor?: boolean;
  /** Extra request headers (e.g. an Idempotency-Key for OTP sends). */
  headers?: Record<string, string>;
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

export function setTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

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

/**
 * Typed fetch against the SERRALE API. Unwraps the `{ success, data }` envelope
 * and throws typed errors (NetworkError / HttpError / ApiBusinessError) that the
 * UI maps to error states. Returns `data` as `T`.
 */
export async function http<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, query, signal, timeoutMs = 15000, skipAuthInterceptor, headers: extraHeaders } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort());

  const activeToken = token || (tokenProvider ? await tokenProvider() : undefined);

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...(extraHeaders || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new NetworkError(
      (err as Error)?.name === 'AbortError' ? 'The request timed out. Check your internet and try again.' : 'Check your internet and try again.',
    );
  } finally {
    clearTimeout(timer);
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
    return await unauthorizedHandler(
      () => http<T>(path, { ...opts, skipAuthInterceptor: true }),
      isSafe
    );
  }

  if (!res.ok) {
    const { message, code } = parsed ? errorMessage(parsed) : { message: `Request failed (${res.status})`, code: undefined };
    const error = new HttpError(res.status, message, code);
    // Additive 429 enrichment: capture the RAW cooldown signals (error-body fields
    // + Retry-After / RateLimit-Reset headers) so the OTP UI can show a specific
    // wait. No parsing here — see `retryInfoFromError` in lib/otp-retry.ts.
    if (res.status === 429) {
      error.retryRaw = {
        body:
          parsed && parsed.error && typeof parsed.error === 'object'
            ? (parsed.error as Record<string, unknown>)
            : undefined,
        retryAfter: res.headers?.get?.('Retry-After') ?? null,
        rateLimitReset: res.headers?.get?.('RateLimit-Reset') ?? null,
      };
    }
    throw error;
  }
  if (parsed && parsed.success === false) {
    const { message, code } = errorMessage(parsed);
    throw new ApiBusinessError(message, code);
  }
  // Some endpoints may return the payload directly (no envelope) — fall back to that.
  return (parsed && 'data' in parsed ? (parsed.data as T) : ((parsed as unknown) as T));
}
