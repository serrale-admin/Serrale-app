/**
 * PII / secret redaction — the security core of the observability layer.
 *
 * `redact()` is the single gate every value passes through before it can reach a
 * log sink or a crash-report breadcrumb. It removes personal data (Ethiopian
 * phone numbers) and secrets (OTP codes, access/refresh/verify tokens, raw JWTs,
 * Authorization headers) from ANY shape — a bare string, an Error, or a deeply
 * nested object/array — so nothing sensitive can leave the device.
 *
 * Design stance: DEFAULT TO OVER-REDACTION. Two independent layers run together
 * so a value is scrubbed even if only one layer recognises it:
 *   1. KEY-based — any field whose name looks sensitive (token/otp/phone/auth/…)
 *      has its value replaced wholesale, whatever the value contains.
 *   2. VALUE-based — free-text strings are pattern-scrubbed (phones, JWTs, Bearer
 *      tokens, long token-like blobs), because secrets frequently ride inside a
 *      benign-looking `message`/`trail`/`note` string, not a nicely-named field.
 *
 * This module is pure and dependency-free so it can be unit-tested against a
 * fixture of realistic leaky payloads without any RN/Expo surface.
 */

/** The sentinel that replaces every redacted value. */
export const REDACTED = '[REDACTED]';

/** Cap on recursion depth — defends against pathological nesting. */
const MAX_DEPTH = 8;

/**
 * Object keys whose VALUE must always be dropped, matched case-insensitively as a
 * substring (so `accessToken`, `access_token`, `X-Access-Token` all match `token`
 * / `access`). Kept deliberately broad — a benign field caught here is acceptable
 * collateral; a leaked secret is not.
 */
const SENSITIVE_KEY_PATTERNS: readonly string[] = [
  'token',
  'authorization',
  'auth',
  'password',
  'passwd',
  'secret',
  'otp',
  'code', // OTP codes ride under `code`
  'pin',
  'phone',
  'msisdn',
  'cookie',
  'session',
  'apikey',
  'api_key',
  'credential',
];

/**
 * Keys that CONTAIN a sensitive substring but are known-safe correlation fields —
 * they must survive so breadcrumbs stay useful. Matched as an exact
 * (case-insensitive) key name.
 */
const KEY_ALLOWLIST: ReadonlySet<string> = new Set(
  ['statuscode', 'status_code', 'errorcode', 'error_code', 'httpstatus'].map((k) => k),
);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (KEY_ALLOWLIST.has(lower)) return false;
  return SENSITIVE_KEY_PATTERNS.some((p) => lower.includes(p));
}

// ---------------------------------------------------------------------------
// Free-text value scrubbing.
// ---------------------------------------------------------------------------

/**
 * Ethiopian phone numbers in every accepted shape:
 *   +251912345678 | 251912345678 | 0912345678 | 912345678 (leading-9 mobile)
 * Ordered longest-first via alternation so the international forms are consumed
 * before the shorter local form can partially match. Word-ish boundaries keep it
 * from chewing unrelated digit runs (e.g. a 20-digit id).
 */
const PHONE_RE = /(?<![0-9])(?:\+?251|0)?9\d{8}(?![0-9])/g;

/** A JWT: three base64url segments separated by dots. */
const JWT_RE = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

/** `Bearer <token>` (Authorization header value). */
const BEARER_RE = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;

/**
 * Prefixed opaque tokens the backend mints — refresh (`rt_`), verify (`vt_`),
 * generic (`tok_`/`sess_`). A long alphanumeric tail is required so ordinary
 * words are untouched.
 */
const PREFIXED_TOKEN_RE = /\b(?:rt|vt|tok|sess|otp)_[A-Za-z0-9._-]{6,}/gi;

/** Scrub secrets embedded in a free-text string. Order matters (JWT before generic). */
function scrubString(input: string): string {
  return input
    .replace(BEARER_RE, REDACTED)
    .replace(JWT_RE, REDACTED)
    .replace(PREFIXED_TOKEN_RE, REDACTED)
    .replace(PHONE_RE, REDACTED);
}

// ---------------------------------------------------------------------------
// Recursive redaction.
// ---------------------------------------------------------------------------

function redactInner(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value == null) return value; // null / undefined
  const t = typeof value;

  if (t === 'string') return scrubString(value as string);
  if (t === 'number' || t === 'boolean' || t === 'bigint') return value;
  if (t === 'function' || t === 'symbol') return REDACTED;

  if (depth >= MAX_DEPTH) return REDACTED;

  // Errors: preserve the name but scrub message + stack (they routinely leak
  // interpolated phones/tokens). Return a plain object so it serialises safely.
  if (value instanceof Error) {
    return {
      name: value.name,
      message: scrubString(value.message ?? ''),
      stack: value.stack ? scrubString(value.stack) : undefined,
    };
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) return REDACTED;
    seen.add(value);
    return value.map((v) => redactInner(v, depth + 1, seen));
  }

  if (t === 'object') {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) return REDACTED;
    seen.add(obj);
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      out[key] = isSensitiveKey(key) ? REDACTED : redactInner(obj[key], depth + 1, seen);
    }
    return out;
  }

  // Unknown exotic type — drop it rather than risk leaking.
  return REDACTED;
}

/**
 * Redact any value for safe logging / crash reporting. Returns a NEW value of the
 * same broad shape (string→string, object→object) with all PII/secrets replaced
 * by {@link REDACTED}. Never throws; circular structures are broken, not chased.
 */
export function redact<T = unknown>(value: T): T {
  return redactInner(value, 0, new WeakSet<object>()) as T;
}
