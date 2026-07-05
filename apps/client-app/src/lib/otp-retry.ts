/**
 * OTP retry / cooldown parsing.
 *
 * The backend (`backend/src/routes/publicDirectory.ts`) returns 429s for OTP
 * requests in three shapes, and the client must honour whichever is stricter:
 *
 *   - OTP_COOLDOWN        → body `retry_after_seconds` + `Retry-After` header
 *   - OTP_PHONE_RATE_LIMITED / OTP_DAILY_LIMIT
 *                         → body `retry_after_seconds` + `next_allowed_at` + header
 *   - OTP_IP_RATE_LIMITED (express-rate-limit, standardHeaders)
 *                         → `RateLimit-Reset` (delta seconds); may lack a body field
 *
 * `parseRetryInfo` distills all of these into a single seconds value. When both a
 * `retry_after_seconds` and a `next_allowed_at` are present we take the LARGER —
 * a stricter server response must never be shortened by the client.
 *
 * On a plain OTP request *success* the backend returns `{ challenge_id,
 * expires_at }` but NO cooldown/next-allowed field (expires_at is the 5-minute
 * challenge lifetime, not the resend gate). So the resend countdown is seeded
 * from DEFAULT_RESEND_COOLDOWN_SECONDS, which mirrors the backend
 * OTP_COOLDOWN_SECONDS constant. This is the one contract gap: there is no
 * server-provided resend-cooldown on the happy path.
 */

/** Mirrors backend `OTP_COOLDOWN_SECONDS` (otp.service.ts) — the resend gate. */
export const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;

/**
 * A per-send-action idempotency key for the `Idempotency-Key` header on
 * `otp/request`. It only needs to be unique per logical user send within the
 * backend's 60s replay window, so a timestamp + random suffix is sufficient
 * (Hermes ships no `crypto.randomUUID`, and we avoid adding a dependency). One
 * key is minted per user action so a retried request replays the same challenge
 * instead of sending a second SMS.
 */
export function newIdempotencyKey(): string {
  return `otp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export interface RetryInfo {
  /** Seconds the caller must wait, or null when the server gave us nothing usable. */
  seconds: number | null;
  /** ISO timestamp from `next_allowed_at`, when the server provided one. */
  nextAllowedAt: string | null;
}

/** The subset of a 429 error body we read. Everything is optional/defensive. */
interface RetryBody {
  code?: string;
  retry_after_seconds?: unknown;
  next_allowed_at?: unknown;
}

/** A minimal headers shape so this stays testable with a plain object or `Headers`. */
export interface HeaderReader {
  get(name: string): string | null;
}

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return rounded >= 0 ? rounded : null;
}

/** Numeric header value only; an HTTP-date Retry-After is ignored (returns null). */
function numericHeader(headers: HeaderReader | null | undefined, name: string): number | null {
  if (!headers) return null;
  const raw = headers.get(name);
  if (raw == null || raw.trim() === '') return null;
  // Retry-After may be an HTTP-date; we deliberately only accept a bare delta.
  if (!/^\d+$/.test(raw.trim())) return null;
  return toPositiveInt(raw.trim());
}

/**
 * Distill a 429 (body + headers) into a single wait. Precedence:
 *   max(retry_after_seconds, delta(next_allowed_at))  [body — richest, stricter wins]
 *   → Retry-After header (numeric only)
 *   → RateLimit-Reset header (express standardHeaders)
 */
export function parseRetryInfo(
  body: RetryBody | null | undefined,
  headers?: HeaderReader | null,
  now: number = Date.now(),
): RetryInfo {
  const b = body || {};

  const fromSeconds = toPositiveInt(b.retry_after_seconds);

  let nextAllowedAt: string | null = null;
  let fromNextAllowed: number | null = null;
  if (typeof b.next_allowed_at === 'string' && b.next_allowed_at.trim() !== '') {
    const ts = Date.parse(b.next_allowed_at);
    if (Number.isFinite(ts)) {
      nextAllowedAt = b.next_allowed_at;
      // Clamp to 0 so a stale timestamp never yields a negative countdown.
      fromNextAllowed = Math.max(0, Math.ceil((ts - now) / 1000));
    }
  }

  // Stricter (larger) of the two body signals wins.
  const bodySeconds =
    fromSeconds != null && fromNextAllowed != null
      ? Math.max(fromSeconds, fromNextAllowed)
      : fromSeconds ?? fromNextAllowed;

  const headerSeconds = numericHeader(headers, 'Retry-After') ?? numericHeader(headers, 'RateLimit-Reset');

  const seconds = bodySeconds ?? headerSeconds ?? null;

  return { seconds, nextAllowedAt };
}

/**
 * Distill the raw 429 signals captured on an `HttpError` (`retryRaw` — see
 * lib/http.ts `HttpRetryRaw`) into a `RetryInfo`. Returns the empty info for
 * anything not carrying retry data, so 429 branches can call it unconditionally.
 *
 * Deliberately duck-typed rather than `instanceof HttpError`: http.ts is being
 * reworked on a parallel branch, and keeping this module free of an http.ts
 * import keeps that merge trivial.
 */
export function retryInfoFromError(e: unknown, now: number = Date.now()): RetryInfo {
  const raw = (
    e as { retryRaw?: { body?: Record<string, unknown>; retryAfter?: string | null; rateLimitReset?: string | null } } | null
  )?.retryRaw;
  if (!raw || typeof raw !== 'object') return { seconds: null, nextAllowedAt: null };
  const headers: HeaderReader = {
    get: (name: string) => {
      const n = name.toLowerCase();
      if (n === 'retry-after') return raw.retryAfter ?? null;
      if (n === 'ratelimit-reset') return raw.rateLimitReset ?? null;
      return null;
    },
  };
  return parseRetryInfo(raw.body, headers, now);
}

/** Human-readable retry text for the countdown/error copy. */
export function formatRetryMessage(info: Pick<RetryInfo, 'seconds' | 'nextAllowedAt'>): string {
  const seconds = info.seconds;
  if (seconds == null) return 'Too many attempts. Please wait a moment and try again.';
  if (seconds <= 0) return 'You can try again now.';
  if (seconds < 60) {
    return `Too many attempts. Please wait ${seconds} second${seconds === 1 ? '' : 's'} and try again.`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `Too many attempts. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`;
}
