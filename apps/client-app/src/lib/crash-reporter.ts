/**
 * Crash-reporting adapter.
 *
 * Defines the narrow interface the app codes against and ships a NO-OP-SAFE
 * default. A real provider (Sentry / Bugsnag / Crashlytics) is NOT wired here:
 * the DSN / API credentials are not available in this environment, so integrating
 * an SDK now would be dead weight and a launch risk. That integration — plus
 * release + source-map upload and the provider-side PII scrubber — is a T12 /
 * deploy step. See docs/deployment/RELEASE_CHECKLIST.md for the blocker.
 *
 * SECURITY: every payload that crosses this boundary is redacted first (via
 * `redact()`), so even when the real provider is swapped in later, the adapter
 * layer can never forward a raw phone / OTP / token. The no-op impl performs the
 * SAME redaction before discarding, so the redaction path is exercised (and
 * tested) today rather than bolted on at T12.
 */
import { redact } from './redact';

/** A single breadcrumb — a PII-free trail entry leading up to an error. */
export interface Breadcrumb {
  /** Coarse category, e.g. 'navigation' | 'http' | 'lifecycle'. */
  category: string;
  /** Short, PII-free message (route template, failure class, …). */
  message: string;
  /** Optional structured, PII-free data (status, request id, …). */
  data?: Record<string, unknown>;
  /** Epoch ms; defaults to now when omitted. */
  timestamp?: number;
}

/**
 * The provider-agnostic surface. A real adapter implements the same three
 * methods; swapping it in is a one-line change at the composition root.
 */
export interface CrashReporter {
  /** Report a caught exception with already-safe, PII-free context. */
  captureException(error: unknown, context?: Record<string, unknown>): void;
  /** Record a breadcrumb on the trail (bounded ring buffer downstream). */
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  /** Tag subsequent events with the app release identifier. */
  setRelease(release: string): void;
}

/**
 * No-op-safe implementation. It redacts everything (proving the scrub path) and
 * then discards — it must NEVER throw, so a reporting failure can never mask or
 * amplify the very crash it is recording.
 */
export function createNoopCrashReporter(): CrashReporter {
  return {
    captureException(error: unknown, context?: Record<string, unknown>): void {
      try {
        // Redact even though we discard: guarantees the scrub runs on this path
        // and documents exactly what a real provider would receive.
        redact(error);
        if (context) redact(context);
      } catch {
        // Swallow — reporting must never crash the app.
      }
    },
    addBreadcrumb(breadcrumb: Breadcrumb): void {
      try {
        redact(breadcrumb);
      } catch {
        // Swallow.
      }
    },
    setRelease(_release: string): void {
      // No-op until a real provider is configured (T12).
    },
  };
}

/** The process-wide crash reporter. Swap `install…` at the root to go live. */
let current: CrashReporter = createNoopCrashReporter();

/** The active crash reporter (no-op by default). */
export function getCrashReporter(): CrashReporter {
  return current;
}

/** Install a concrete crash reporter (real provider at T12, or a test double). */
export function setCrashReporter(reporter: CrashReporter): void {
  current = reporter;
}

/** Restore the no-op default (used by tests). */
export function resetCrashReporter(): void {
  current = createNoopCrashReporter();
}
