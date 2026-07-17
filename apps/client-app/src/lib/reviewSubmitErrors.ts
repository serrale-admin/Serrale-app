import { ApiBusinessError, HttpError, MalformedResponseError, NetworkError } from './http';

export type ReviewErrorLabels = {
  ctaSignIn: string;
  errorGeneric: string;
  errorVelocity: string;
  errorComment: string;
  errorRateLimited: string;
  errorAlready: string;
  errorUnavailable: string;
  errorSelfRating: string;
  connectionMessage: string;
};

/**
 * Map submit-review failures to actionable copy.
 * Prefer known business codes; fall back to a safe server message; never leave
 * users with only a generic toast when we know the cause (401 / 404).
 * Never tell a logged-in user they need a separate "customer account".
 * Contact-before-rate codes from old backends map to generic (gate removed).
 */
export function reviewErrorMessage(
  err: unknown,
  labels: ReviewErrorLabels,
  _opts?: { activeSession?: 'customer' | 'provider' | null },
): string {
  const code =
    err instanceof HttpError || err instanceof ApiBusinessError ? String(err.code || '') : '';
  const status = err instanceof HttpError ? err.status : 0;
  const serverMessage =
    err instanceof HttpError || err instanceof ApiBusinessError || err instanceof Error
      ? String(err.message || '').trim()
      : '';

  if (code === 'ALREADY_RATED') return labels.errorAlready;
  if (code === 'REVIEW_VELOCITY_LIMITED') return labels.errorVelocity;
  if (code === 'COMMENT_REJECTED') return labels.errorComment;
  if (code === 'SELF_RATING_FORBIDDEN') return labels.errorSelfRating;
  if (status === 429 || code.includes('RATE_LIMITED')) return labels.errorRateLimited;

  if (status === 401 || code === 'UNAUTHORIZED' || code === 'SESSION_EXPIRED') {
    return labels.ctaSignIn;
  }

  // Production catch-all when ratings routes are not deployed yet, or unknown provider.
  if (
    status === 404 ||
    status === 501 ||
    code === 'NOT_FOUND' ||
    code === 'PROVIDER_NOT_FOUND'
  ) {
    return labels.errorUnavailable;
  }

  if (err instanceof NetworkError) return labels.connectionMessage;

  if (err instanceof MalformedResponseError) {
    return labels.errorGeneric;
  }

  // Prefer a short, human server message over a blind generic (e.g. REVIEW_CREATE_FAILED).
  if (serverMessage && isUsefulServerMessage(serverMessage)) {
    return serverMessage;
  }

  if (status >= 500 || code === 'REVIEW_CREATE_FAILED' || code === 'VALIDATION_ERROR') {
    return labels.errorGeneric;
  }

  return labels.errorGeneric;
}

function isUsefulServerMessage(message: string): boolean {
  if (message.length < 8 || message.length > 160) return false;
  if (/^request failed/i.test(message)) return false;
  if (/^not_found$/i.test(message)) return false;
  // Stack traces / SQL / internal identifiers
  if (
    /[{};]|select\s|from\s|error:|exception|ECONN|PGRST|\.ts:\d+|column\s|relation\s|violates\s|duplicate key/i.test(
      message,
    )
  ) {
    return false;
  }
  return true;
}
