/**
 * Production logger — the single sanctioned logging sink for the app.
 *
 * The codebase ships ZERO stray `console.*` in feature code; everything that
 * needs to record a diagnostic goes through here. Two guarantees:
 *
 *   1. REDACTION BEFORE EMISSION. Every argument is passed through `redact()`
 *      before it can reach a console or the crash reporter, so a phone / OTP /
 *      token can never leak into a log line or a breadcrumb.
 *   2. LEVEL GATING ON __DEV__. In development the low levels print to the
 *      console (redacted). In production, verbose/debug/info are SILENCED
 *      entirely; only warn/error are forwarded — redacted — to the crash-report
 *      adapter. Nothing is printed to the release console.
 *
 * The logger also owns the release-health breadcrumb ring buffer: a bounded trail
 * (last N entries) of PII-free navigation + failed-request events that a real
 * crash reporter would attach to an exception. Breadcrumbs are redacted on entry
 * AND forwarded (redacted) to the crash reporter.
 */
import { getCrashReporter, type Breadcrumb } from './crash-reporter';
import { redact } from './redact';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** How many breadcrumbs to retain. Small: a crash only needs recent context. */
export const BREADCRUMB_LIMIT = 30;

/**
 * `__DEV__` is a RN/Expo global (true in dev, false in release). Under Jest it is
 * typically defined; guard the read so the logger is safe in any host.
 */
function isDev(): boolean {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : false;
}

// ---------------------------------------------------------------------------
// Breadcrumb ring buffer (bounded).
// ---------------------------------------------------------------------------

const breadcrumbs: Breadcrumb[] = [];

/**
 * Record a PII-free breadcrumb. The payload is redacted defensively (belt and
 * braces — callers are expected to pass only route templates / status / request
 * ids, never concrete ids or PII) and pushed to the bounded buffer, dropping the
 * oldest entry past {@link BREADCRUMB_LIMIT}. Also forwarded to the crash adapter.
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  const safe = redact({ ...breadcrumb, timestamp: breadcrumb.timestamp ?? Date.now() });
  breadcrumbs.push(safe);
  if (breadcrumbs.length > BREADCRUMB_LIMIT) {
    breadcrumbs.splice(0, breadcrumbs.length - BREADCRUMB_LIMIT);
  }
  getCrashReporter().addBreadcrumb(safe);
}

/** Snapshot of the current breadcrumb trail (already redacted). For tests/diagnostics. */
export function getBreadcrumbs(): readonly Breadcrumb[] {
  return breadcrumbs.slice();
}

/** Clear the trail (used on logout / by tests). */
export function clearBreadcrumbs(): void {
  breadcrumbs.length = 0;
}

// ---------------------------------------------------------------------------
// Level-gated logging.
// ---------------------------------------------------------------------------

function emit(level: LogLevel, args: unknown[]): void {
  const safeArgs = args.map((a) => redact(a));

  if (isDev()) {
    // Dev only: print redacted output to the console for local diagnosis.
    // eslint-disable-next-line no-console
    const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    sink('[serrale]', ...safeArgs);
    return;
  }

  // Production: debug/info are silenced. warn/error go to the crash reporter,
  // already redacted. The first arg, when an Error, is captured as the exception;
  // the rest ride as context.
  if (level === 'warn' || level === 'error') {
    const [first, ...rest] = safeArgs;
    getCrashReporter().captureException(first, rest.length ? { extra: rest, level } : { level });
  }
}

export const logger = {
  /** Verbose diagnostics. Dev console only; silenced in production. */
  debug(...args: unknown[]): void {
    emit('debug', args);
  },
  /** Informational. Dev console only; silenced in production. */
  info(...args: unknown[]): void {
    emit('info', args);
  },
  /** Recoverable problem. Dev console; production → crash reporter (redacted). */
  warn(...args: unknown[]): void {
    emit('warn', args);
  },
  /** Error. Dev console; production → crash reporter (redacted). */
  error(...args: unknown[]): void {
    emit('error', args);
  },
  addBreadcrumb,
};

export type Logger = typeof logger;
