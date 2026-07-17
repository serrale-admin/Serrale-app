import { mapRateEligibilityCta } from '../rateEligibilityCta';

describe('mapRateEligibilityCta', () => {
  it('shows Sign in only for confirmed guests', () => {
    expect(
      mapRateEligibilityCta({ sessionReady: true, loggedIn: false, alreadyRated: false }),
    ).toBe('need_login');
  });

  it('never shows Sign in when loggedIn (customer or provider)', () => {
    expect(
      mapRateEligibilityCta({ sessionReady: true, loggedIn: true, alreadyRated: false }),
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
});
