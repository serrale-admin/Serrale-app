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

  it('shows Rate for a provider-only session (no separate customer account)', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: true,
        alreadyRated: false,
        providerOnlySession: true,
      }),
    ).toBe('eligible');
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

  it('ignores stale API need_contact when logged in (contact gate removed)', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: true,
        alreadyRated: false,
        apiStatus: 'need_contact',
      }),
    ).toBe('eligible');
  });

  it('still shows Sign in for guests even if API says need_contact', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: false,
        alreadyRated: false,
        apiStatus: 'need_contact',
      }),
    ).toBe('need_login');
  });

  it('ignores a stale API need_login when a session is live', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: true,
        alreadyRated: false,
        apiStatus: 'need_login',
      }),
    ).toBe('eligible');
  });
});
