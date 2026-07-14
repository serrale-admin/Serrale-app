/**
 * Post-login route restoration guard.
 *
 * The `next` param travels through the login → verify chain so a user who was
 * bounced to login lands back where they started. It is attacker-influenceable
 * (it can arrive via a deep link), so it is validated to an INTERNAL app path
 * only: never an absolute URL, protocol-relative URL, or anything that could
 * navigate out of the app (open-redirect). Anything unsafe falls back to a known
 * internal default.
 */

/** Where to send a freshly logged-in user when no valid `next` was provided. */
export const DEFAULT_POST_LOGIN_ROUTE = '/(tabs)/profile';

/** Safe fallback when the auth stack has no history (e.g. entry via `router.replace`). */
export const DEFAULT_AUTH_BACK_ROUTE = '/(tabs)/profile';

/**
 * Returns a safe internal route to navigate to after login.
 *
 * Accepts only same-app paths beginning with a single `/`. Rejects:
 *   - non-string / empty values
 *   - absolute URLs (`http://`, `https://`, any `scheme:`)
 *   - protocol-relative URLs (`//evil.com`)
 *   - backslash tricks (`/\evil.com`, `\\evil.com`)
 * On any rejection, returns `fallback` (default: DEFAULT_POST_LOGIN_ROUTE).
 */
export function safeNextRoute(
  next: unknown,
  fallback: string = DEFAULT_POST_LOGIN_ROUTE,
): string {
  if (typeof next !== 'string') return fallback;
  const value = next.trim();
  if (!value) return fallback;

  // Must be an app-internal absolute path.
  if (!value.startsWith('/')) return fallback;
  // Protocol-relative (`//host`) or backslash-smuggled (`/\host`) → external.
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  // Any explicit scheme (`http:`, `serrale:`, `javascript:`) is external.
  if (/^\/?[a-z][a-z0-9+.-]*:/i.test(value)) return fallback;
  // A backslash anywhere is never part of a legitimate internal route.
  if (value.includes('\\')) return fallback;

  return value;
}

/**
 * Auth back navigation: pop when history exists, otherwise replace to a safe internal route.
 * Needed because login entry points often use `router.replace`, leaving an empty back stack.
 */
export function navigateAuthBack(fallback: string = DEFAULT_AUTH_BACK_ROUTE): void {
  // Lazy require avoids circular imports when safe-route is loaded before expo-router in tests.
  const { router } = require('expo-router') as typeof import('expo-router');
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(safeNextRoute(fallback) as never);
}
