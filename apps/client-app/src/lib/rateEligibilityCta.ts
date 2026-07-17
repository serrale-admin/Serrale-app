/**
 * Single source of truth for the provider-detail Rate CTA.
 *
 * Hard rules (do not regress):
 * - Guests (`sessionReady && !loggedIn`) → need_login ("Sign in to rate")
 * - Any logged-in app session (customer or provider) can rate — do NOT demand a
 *   separate "customer account". Backend accepts customer OR provider JWT and
 *   resolves a stable rater identity.
 * - Logged in, not yet contacted the provider, and the API eligibility status
 *   says so → need_contact (server-enforced contact gate; this is advisory
 *   only, the real gate is server-side on submit)
 * - Logged in, contacted, not already rated → eligible
 * - While hydrating (`!sessionReady`) → eligible (do not flash Sign in)
 * - Server/soft-fail `need_login` must NOT override a live local session —
 *   callers pass alreadyRated from server; they must NOT pass API need_login
 *   as alreadyRated / must ignore API need_login when loggedIn.
 * - `need_contact` must never override or be confused with `need_login`: a
 *   logged-in user who hasn't contacted the provider yet is a completely
 *   different state from a guest, and must only be reached once we already
 *   know sessionReady && loggedIn && !alreadyRated.
 */
export type RateCtaStatus = 'need_login' | 'need_contact' | 'already_rated' | 'eligible';

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
   * Advisory `GET .../reviews/eligibility` status for the active session.
   * Only consulted once sessionReady && loggedIn && !alreadyRated — never used
   * to derive need_login or already_rated.
   */
  apiStatus?: 'eligible' | 'need_login' | 'already_rated' | 'need_contact';
}): RateCtaStatus {
  if (input.alreadyRated) return 'already_rated';
  // Hydrating → Rate (avoid Sign in flash). Confirmed guests → Sign in.
  if (!input.sessionReady) return 'eligible';
  if (!input.loggedIn) return 'need_login';
  if (input.apiStatus === 'need_contact') return 'need_contact';
  return 'eligible';
}
