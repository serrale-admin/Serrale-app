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

  it('defaults Profile / bare login to existence-gated login purpose', () => {
    expect(resolveCustomerOtpIntent({})).toBe('login');
    expect(resolveCustomerOtpIntent({ next: '/(tabs)/profile' })).toBe('login');
  });
});
