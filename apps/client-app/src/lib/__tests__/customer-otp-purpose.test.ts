import {
  customerOtpPurposeForIntent,
  resolveCustomerOtpIntent,
} from '../customer-otp-purpose';

describe('customer OTP purpose split', () => {
  it('maps login vs request intents to distinct purposes', () => {
    expect(customerOtpPurposeForIntent('login')).toBe('directory_customer_login');
    expect(customerOtpPurposeForIntent('request')).toBe('directory_customer_request');
  });

  it('treats Request-tab return routes as request intent', () => {
    expect(resolveCustomerOtpIntent({ next: '/(tabs)/request' })).toBe('request');
    expect(resolveCustomerOtpIntent({ intent: 'request' })).toBe('request');
  });

  it('defaults bare login and profile-return auth to login intent', () => {
    expect(resolveCustomerOtpIntent({})).toBe('login');
    expect(resolveCustomerOtpIntent({ next: '/(tabs)/profile' })).toBe('login');
  });

  it('still allows an explicit login-only override', () => {
    expect(resolveCustomerOtpIntent({ intent: 'login' })).toBe('login');
  });
});
