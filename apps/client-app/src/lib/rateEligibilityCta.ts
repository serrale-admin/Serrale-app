/**
 * Single source of truth for the provider-detail Rate CTA.
 *
 * Hard rules (do not regress):
 * - Guests (`sessionReady && !loggedIn`) → need_login ("Sign in to rate")
 * - Any logged-in session (customer OR provider) → never need_login
 * - While hydrating (`!sessionReady`) → eligible (do not flash Sign in)
 * - Server/soft-fail `need_login` must NOT override a live local session —
 *   callers pass alreadyRated from server; they must NOT pass API need_login
 *   as alreadyRated / must ignore API need_login when loggedIn.
 */
export type RateCtaStatus = 'need_login' | 'already_rated' | 'eligible';

export function mapRateEligibilityCta(input: {
  sessionReady: boolean;
  loggedIn: boolean;
  /** True when the user already submitted a rating (server or local). */
  alreadyRated: boolean;
}): RateCtaStatus {
  if (input.alreadyRated) return 'already_rated';
  // Hydrating or signed in → Rate. Only confirmed guests see Sign in.
  if (!input.sessionReady || input.loggedIn) return 'eligible';
  return 'need_login';
}
