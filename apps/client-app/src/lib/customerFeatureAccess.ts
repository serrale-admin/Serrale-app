/**
 * Gate for service-request features (submit request, activity history).
 *
 * Hybrid accounts: providers may use the same request/history surfaces as
 * customers. Match Profile's notion of "signed in" — either a customer login
 * OR an active provider session / provider profile on device.
 *
 * While session bootstrap is running, return `loading` so screens show a
 * skeleton instead of flashing the guest login gate.
 */
export type CustomerFeatureAccess = 'loading' | 'allowed' | 'need_login';

export function resolveCustomerFeatureAccess(input: {
  sessionReady: boolean;
  loggedIn: boolean;
  activeSession?: 'customer' | 'provider' | null;
  /** True when a provider listing profile is loaded in the store. */
  hasProviderProfile?: boolean;
}): CustomerFeatureAccess {
  if (!input.sessionReady) return 'loading';
  if (input.loggedIn) return 'allowed';
  // Profile shows provider accounts as signed in via activeSession/providerProfile
  // even if the loggedIn flag lagged — keep request history consistent.
  if (input.activeSession === 'provider' || input.hasProviderProfile) return 'allowed';
  return 'need_login';
}
