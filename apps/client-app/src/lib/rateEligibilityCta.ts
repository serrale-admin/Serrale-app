/**
 * Single source of truth for the provider-detail Rate CTA.
 *
 * Hard rules (do not regress):
 * - Guests (`sessionReady && !loggedIn`) → need_login ("Sign in to rate")
 * - Provider-only session (logged in, no customer Bearer) → need_customer
 * - Customer session (or dual-account with customer tokens) → eligible
 * - While hydrating (`!sessionReady`) → eligible (do not flash Sign in)
 * - Server/soft-fail `need_login` must NOT override a live local session —
 *   callers pass alreadyRated from server; they must NOT pass API need_login
 *   as alreadyRated / must ignore API need_login when loggedIn.
 */
export type RateCtaStatus = 'need_login' | 'need_customer' | 'already_rated' | 'eligible';

export function mapRateEligibilityCta(input: {
  sessionReady: boolean;
  loggedIn: boolean;
  /** True when the user already submitted a rating (server or local). */
  alreadyRated: boolean;
  /**
   * Provider JWT active with no customer access token in SecureStore.
   * Ratings POST requires a customer Bearer — do not open the sheet.
   */
  providerOnlySession?: boolean;
}): RateCtaStatus {
  if (input.alreadyRated) return 'already_rated';
  // Hydrating → Rate (avoid Sign in flash). Confirmed guests → Sign in.
  if (!input.sessionReady) return 'eligible';
  if (!input.loggedIn) return 'need_login';
  if (input.providerOnlySession) return 'need_customer';
  return 'eligible';
}
