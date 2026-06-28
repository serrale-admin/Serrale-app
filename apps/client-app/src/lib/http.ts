import { API_BASE_URL } from './env';

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
}

/** The SERRALE API envelope: `{ success, data }` on success, `{ success:false, error }` on failure. */
interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string } | string;
  message?: string;
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
  const { method = 'GET', body, token, query, signal, timeoutMs = 15000 } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort());

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  if (!res.ok) {
    const { message, code } = parsed ? errorMessage(parsed) : { message: `Request failed (${res.status})`, code: undefined };
    throw new HttpError(res.status, message, code);
  }
  if (parsed && parsed.success === false) {
    const { message, code } = errorMessage(parsed);
    throw new ApiBusinessError(message, code);
  }
  // Some endpoints may return the payload directly (no envelope) — fall back to that.
  return (parsed && 'data' in parsed ? (parsed.data as T) : ((parsed as unknown) as T));
}
