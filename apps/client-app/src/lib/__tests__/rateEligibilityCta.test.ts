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

  it('shows need_contact for a logged-in user who has not contacted the provider', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: true,
        alreadyRated: false,
        apiStatus: 'need_contact',
      }),
    ).toBe('need_contact');
  });

  it('never lets need_contact override or be confused with need_login for a guest', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: false,
        alreadyRated: false,
        apiStatus: 'need_contact',
      }),
    ).toBe('need_login');
  });

  it('lets need_contact apply for a provider-only session (same as customer)', () => {
    expect(
      mapRateEligibilityCta({
        sessionReady: true,
        loggedIn: true,
        alreadyRated: false,
        providerOnlySession: true,
        apiStatus: 'need_contact',
      }),
    ).toBe('need_contact');
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
