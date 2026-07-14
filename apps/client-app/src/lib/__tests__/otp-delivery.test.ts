import { isReviewCodeDelivery, parseOtpDelivery } from '../otp-delivery';

describe('otp delivery (Play review vs SMS)', () => {
  it('parses review_code and sms; ignores unknown / missing', () => {
    expect(parseOtpDelivery('review_code')).toBe('review_code');
    expect(parseOtpDelivery('sms')).toBe('sms');
    expect(parseOtpDelivery(undefined)).toBeNull();
    expect(parseOtpDelivery('something-else')).toBeNull();
  });

  it('flags only review_code as the no-SMS path', () => {
    expect(isReviewCodeDelivery('review_code')).toBe(true);
    expect(isReviewCodeDelivery('sms')).toBe(false);
    expect(isReviewCodeDelivery(null)).toBe(false);
  });
});
