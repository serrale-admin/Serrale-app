import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { breadcrumbForError } from './error-presentation';
import { HttpError, NetworkError } from './http';
import { logger } from './logger';
import { classifyRetry, computeBackoffDelay } from './request-policy';

/**
 * React Query client tuned to the SERRALE network policy (see request-policy.ts).
 *
 * The transport layer in `http.ts` already retries eligible GETs itself (with the
 * circuit breaker, dedupe, and Retry-After honoring). React Query's own retry is
 * therefore a THIN outer safety net that reuses the exact same classification so
 * the two layers never disagree:
 *   - queries: retry only what the policy says is retryable, capped identically;
 *   - mutations: never auto-retry (writes have no idempotency contract — a blind
 *     replay could duplicate a lead or burn an OTP).
 */

/** Reuse the policy classifier so query-level retries match transport-level ones. */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  // failureCount is the number of failures so far (1 after the first failure).
  if (error instanceof HttpError) {
    return classifyRetry('GET', '', { kind: 'http', status: error.status, retryAfterMs: error.retryAfterMs }, failureCount)
      .retry;
  }
  if (error instanceof NetworkError) {
    // A cancellation surfaces as a NetworkError with this message — never retry it.
    if (/cancelled/i.test(error.message)) return false;
    return classifyRetry('GET', '', { kind: 'network' }, failureCount).retry;
  }
  // Unknown error types (e.g. ApiBusinessError) are application-level → no retry.
  return false;
}

/**
 * Failed-request breadcrumb seam (release-health, requirement 6). Every failed
 * query/mutation drops ONE PII-free breadcrumb (failure class + HTTP status) —
 * the natural, centralized place to observe request failures without dusting
 * `logger` calls across feature code. A cancellation is not a failure worth a
 * breadcrumb, so it is skipped.
 */
function recordFailure(error: unknown): void {
  if (error instanceof NetworkError && /cancelled/i.test(error.message)) return;
  logger.addBreadcrumb(breadcrumbForError(error));
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => recordFailure(error) }),
  mutationCache: new MutationCache({ onError: (error) => recordFailure(error) }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: shouldRetryQuery,
      retryDelay: (attempt) => computeBackoffDelay(attempt + 1),
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Writes are never auto-retried; double-submit protection lives at the
      // Button primitive (disabled/loading) and per-endpoint idempotency.
      retry: false,
    },
  },
});
