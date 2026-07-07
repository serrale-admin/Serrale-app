/**
 * Error presentation — the single place a caught error becomes user-safe copy.
 *
 * It consumes the EXISTING typed-error taxonomy (NetworkError / HttpError /
 * ApiBusinessError from `http.ts`) — it does not invent a parallel one — and
 * returns a `{ titleKey, messageKey, retryable, kind }` presentation keyed to
 * `labels.ts`. Screens and the ErrorBlock render THIS instead of ad-hoc
 * `instanceof` checks, so:
 *   - copy is localized (T7 flips language by swapping the label set), and
 *   - NOTHING internal ever reaches the user. The mapper returns KEYS, never the
 *     raw `error.message` / stack / SQL / Supabase string / provider response.
 *     `presentError()` resolves those keys against a label set; the raw error is
 *     used ONLY to pick a class, never copied into the output.
 *
 * Failure classes covered (requirement 2): offline, connection (DNS/TLS),
 * timeout, cancelled (benign), 400 validation, 401 session-expiry, 403, 404,
 * 409 conflict, 429 rate-limited (+wait), 5xx server, malformed/non-JSON,
 * 503 maintenance.
 */
import { ApiBusinessError, HttpError, NetworkError } from './http';
import type { Labels } from './labels';
import { retryInfoFromError } from './otp-retry';
import type { Breadcrumb } from './crash-reporter';

/** Coarse failure class — drives icon/tone choices and analytics/breadcrumbs. */
export type FailureKind =
  | 'offline'
  | 'connection'
  | 'timeout'
  | 'cancelled'
  | 'malformed'
  | 'validation'
  | 'session-expired'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'rate-limited'
  | 'server'
  | 'maintenance'
  | 'business'
  | 'unknown';

type ErrorKey = keyof Labels['errors'];

/** A key-only presentation — safe to hand to a breadcrumb or to localize later. */
export interface ErrorPresentation {
  kind: FailureKind;
  titleKey: ErrorKey;
  messageKey: ErrorKey;
  /** Whether offering a retry makes sense for this class. */
  retryable: boolean;
  /** The label key for the primary action (retry / sign-in). */
  actionKey: ErrorKey;
}

/** Resolved, localized copy — what a component actually renders. */
export interface ErrorView {
  kind: FailureKind;
  title: string;
  message: string;
  retryable: boolean;
  /** Localized primary-action label. */
  action: string;
}

// Error codes (case-insensitive) that mark a 503 as planned maintenance rather
// than an incidental outage. There is no fixed backend maintenance contract yet
// (documented in the release checklist), so we key off any of these signals.
const MAINTENANCE_CODES = ['maintenance', 'under_maintenance', 'service_maintenance', 'service_unavailable_maintenance'];

function isMaintenance(err: HttpError): boolean {
  if (err.status !== 503) return false;
  const code = (err.code ?? '').toLowerCase();
  if (MAINTENANCE_CODES.some((c) => code.includes(c))) return true;
  // A maintenance flag on the parsed error body (if the backend adds one later).
  const body = err.retryRaw?.body as Record<string, unknown> | undefined;
  return body?.maintenance === true;
}

/** Classify a NetworkError by inspecting only its (client-generated) message. */
function classifyNetwork(err: NetworkError): FailureKind {
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('cancel')) return 'cancelled';
  if (msg.includes('timed out') || msg.includes('timeout')) return 'timeout';
  if (msg.includes('malformed') || msg.includes('unexpected response')) return 'malformed';
  // "Check your internet", "offline", circuit-open copy — all offline-class.
  return 'offline';
}

function presentationFor(kind: FailureKind): ErrorPresentation {
  switch (kind) {
    case 'offline':
      return { kind, titleKey: 'offlineTitle', messageKey: 'offlineMessage', retryable: true, actionKey: 'retry' };
    case 'connection':
      return { kind, titleKey: 'connectionTitle', messageKey: 'connectionMessage', retryable: true, actionKey: 'retry' };
    case 'timeout':
      return { kind, titleKey: 'timeoutTitle', messageKey: 'timeoutMessage', retryable: true, actionKey: 'retry' };
    case 'cancelled':
      // A caller-initiated cancel is not a user-facing failure; present benignly
      // and never offer a retry (there is nothing to retry).
      return { kind, titleKey: 'unknownTitle', messageKey: 'unknownMessage', retryable: false, actionKey: 'dismiss' };
    case 'malformed':
      return { kind, titleKey: 'malformedTitle', messageKey: 'malformedMessage', retryable: true, actionKey: 'retry' };
    case 'validation':
      return { kind, titleKey: 'validationTitle', messageKey: 'validationMessage', retryable: false, actionKey: 'dismiss' };
    case 'session-expired':
      return { kind, titleKey: 'sessionExpiredTitle', messageKey: 'sessionExpiredMessage', retryable: false, actionKey: 'signIn' };
    case 'forbidden':
      return { kind, titleKey: 'forbiddenTitle', messageKey: 'forbiddenMessage', retryable: false, actionKey: 'dismiss' };
    case 'not-found':
      return { kind, titleKey: 'notFoundTitle', messageKey: 'notFoundMessage', retryable: false, actionKey: 'goHome' };
    case 'conflict':
      return { kind, titleKey: 'conflictTitle', messageKey: 'conflictMessage', retryable: false, actionKey: 'dismiss' };
    case 'rate-limited':
      return { kind, titleKey: 'rateLimitedTitle', messageKey: 'rateLimitedMessage', retryable: true, actionKey: 'retry' };
    case 'server':
      return { kind, titleKey: 'serverTitle', messageKey: 'serverMessage', retryable: true, actionKey: 'retry' };
    case 'maintenance':
      return { kind, titleKey: 'maintenanceTitle', messageKey: 'maintenanceMessage', retryable: true, actionKey: 'retry' };
    case 'business':
      // A 2xx envelope with success:false and no recognised code. We deliberately
      // do NOT surface the server-provided message (it could carry internals);
      // show a safe generic instead.
      return { kind, titleKey: 'unknownTitle', messageKey: 'unknownMessage', retryable: false, actionKey: 'dismiss' };
    case 'unknown':
    default:
      return { kind: 'unknown', titleKey: 'unknownTitle', messageKey: 'unknownMessage', retryable: false, actionKey: 'retry' };
  }
}

/** Map an HTTP status (+ error) to a failure class. */
function classifyHttp(err: HttpError): FailureKind {
  const { status } = err;
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'session-expired';
  if (status === 403) return 'forbidden';
  if (status === 404 || status === 410) return 'not-found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate-limited';
  if (status === 503 && isMaintenance(err)) return 'maintenance';
  if (status >= 500) return 'server';
  // Any other 4xx we don't specifically handle → generic client error surfaced
  // as unknown (never leak the server message).
  return 'unknown';
}

/**
 * Resolve a caught error to a KEY-ONLY presentation. Pure: it reads the error's
 * TYPE/STATUS/CODE only, never copies its text into the result.
 */
export function resolvePresentation(error: unknown): ErrorPresentation {
  if (error instanceof NetworkError) return presentationFor(classifyNetwork(error));
  if (error instanceof HttpError) return presentationFor(classifyHttp(error));
  if (error instanceof ApiBusinessError) return presentationFor('business');
  return presentationFor('unknown');
}

/** Substitute a human wait ("45 seconds", "2 minutes") into a template. */
function humanWait(error: unknown): string | null {
  const info = retryInfoFromError(error);
  const seconds = info.seconds;
  if (seconds == null || seconds <= 0) return null;
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/**
 * Resolve a caught error to LOCALIZED, user-safe copy. This is the function
 * screens/ErrorBlock and the boundary call. The raw error is consulted only to
 * choose a class and (for 429) a wait duration — never rendered.
 */
export function presentError(error: unknown, labels: Labels): ErrorView {
  const p = resolvePresentation(error);
  const e = labels.errors;

  let message = e[p.messageKey];

  // 429: prefer the specific "wait N" copy when the server told us how long.
  if (p.kind === 'rate-limited') {
    const wait = humanWait(error);
    message = wait ? e.rateLimitedMessageWait.replace('{wait}', wait) : e.rateLimitedMessage;
  }

  return {
    kind: p.kind,
    title: e[p.titleKey],
    message,
    retryable: p.retryable,
    action: e[p.actionKey],
  };
}

/**
 * Build a PII-FREE breadcrumb for a failed request. It records the failure CLASS
 * and, for HTTP errors, the numeric status only — no route, id, phone, token, or
 * server message. (The route template rides on a separate navigation breadcrumb;
 * concrete ids never appear here.) Callers hand this to `logger.addBreadcrumb`.
 */
export function breadcrumbForError(error: unknown): Breadcrumb {
  const kind = resolvePresentation(error).kind;
  const data: Record<string, unknown> = { kind };
  if (error instanceof HttpError) data.status = error.status;
  return { category: 'http', message: `request-failed:${kind}`, data };
}
