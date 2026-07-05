import { QueryClient } from '@tanstack/react-query';
import { HttpError, NetworkError } from './http';
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

export const queryClient = new QueryClient({
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
