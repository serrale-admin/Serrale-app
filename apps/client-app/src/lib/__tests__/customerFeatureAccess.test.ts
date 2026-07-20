import { resolveCustomerFeatureAccess } from '../customerFeatureAccess';

describe('resolveCustomerFeatureAccess', () => {
  it('shows loading while session bootstrap is in flight', () => {
    expect(resolveCustomerFeatureAccess({ sessionReady: false, loggedIn: false })).toBe('loading');
    expect(resolveCustomerFeatureAccess({ sessionReady: false, loggedIn: true })).toBe('loading');
  });

  it('allows any logged-in session', () => {
    expect(resolveCustomerFeatureAccess({ sessionReady: true, loggedIn: true })).toBe('allowed');
  });

  it('allows provider sessions even when loggedIn flag is false', () => {
    expect(
      resolveCustomerFeatureAccess({
        sessionReady: true,
        loggedIn: false,
        activeSession: 'provider',
      }),
    ).toBe('allowed');
    expect(
      resolveCustomerFeatureAccess({
        sessionReady: true,
        loggedIn: false,
        hasProviderProfile: true,
      }),
    ).toBe('allowed');
  });

  it('requires login when signed out with no provider session', () => {
    expect(resolveCustomerFeatureAccess({ sessionReady: true, loggedIn: false })).toBe('need_login');
  });
});
