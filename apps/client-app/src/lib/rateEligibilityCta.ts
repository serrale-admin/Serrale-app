/**
 * Single source of truth for the provider-detail Rate CTA.
 *
 * Hard rules (do not regress):
 * - Guests (`sessionReady && !loggedIn`) → need_login ("Sign in to rate")
 * - Any logged-in app session (customer or provider) → eligible / already_rated
 * - NEVER require call/WhatsApp contact before rating (no need_contact)
 * - While hydrating (`!sessionReady`) → eligible (do not flash Sign in)
 * - Server/soft-fail `need_login` must NOT override a live local session
 * - Stale API `need_contact` (if an old deploy returns it) is ignored when logged in
 */
export type RateCtaStatus = 'need_login' | 'already_rated' | 'eligible';

export function mapRateEligibilityCta(input: {
  sessionReady: boolean;
  loggedIn: boolean;
  /** True when the user already submitted a rating (server or local). */
  alreadyRated: boolean;
  /**
   * @deprecated Ignored — provider sessions can rate. Kept optional so older
   * call sites compile until cleaned up.
   */
  providerOnlySession?: boolean;
  /**
   * Advisory `GET .../reviews/eligibility` status. Only used for already_rated
   * via the alreadyRated flag at call sites — never drives need_login.
   * Stale `need_contact` from old backends is ignored.
   */
  apiStatus?: 'eligible' | 'need_login' | 'already_rated' | 'need_contact' | string;
}): RateCtaStatus {
  if (input.alreadyRated) return 'already_rated';
  // Hydrating → Rate (avoid Sign in flash). Confirmed guests → Sign in.
  if (!input.sessionReady) return 'eligible';
  if (!input.loggedIn) return 'need_login';
  return 'eligible';
}
