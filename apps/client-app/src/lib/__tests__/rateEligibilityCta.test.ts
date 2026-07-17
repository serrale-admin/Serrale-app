import { mapRateEligibilityCta } from '../rateEligibilityCta';

describe('mapRateEligibilityCta', () => {
  it('shows Sign in only for confirmed guests', () => {
    expect(
      mapRateEligibilityCta({ sessionReady: true, loggedIn: false, alreadyRated: false }),
    ).toBe('need_login');
  });

  it('shows Rate when a customer session is logged in', () => {
    expect(
      mapRateEligibilityCta({ sessionReady: true, loggedIn: true, alreadyRated: false }),
    ).toBe('eligible');
  });

  it('asks for customer login when only a provider session exists', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: true,
        alreadyRated: false,
        providerOnlySession: true,
      }),
    ).toBe('need_customer');
  });

  it('does not flash Sign in while session hydrates', () => {
    expect(
      mapRateEligibilityCta({ sessionReady: false, loggedIn: false, alreadyRated: false }),
    ).toBe('eligible');
    expect(
      mapRateEligibilityCta({ sessionReady: false, loggedIn: true, alreadyRated: false }),
    ).toBe('eligible');
  });

  it('prefers already_rated over login state', () => {
    expect(
      mapRateEligibilityCta({ sessionReady: true, loggedIn: true, alreadyRated: true }),
    ).toBe('already_rated');
    expect(
      mapRateEligibilityCta({ sessionReady: true, loggedIn: false, alreadyRated: true }),
    ).toBe('already_rated');
  });
});
