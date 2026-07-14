import { emptyOtp, otpComplete, parseOtpPaste, sanitizeSingleOtpDigit } from '../otp-code';

describe('otp-code', () => {
  it('parses pasted digits into six slots', () => {
    expect(parseOtpPaste('123456')).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(parseOtpPaste('12')).toEqual(['1', '2', '', '', '', '']);
  });

  it('sanitizes single digit input', () => {
    expect(sanitizeSingleOtpDigit('a9b')).toBe('9');
  });

  it('detects complete codes', () => {
    expect(otpComplete(parseOtpPaste('123456'))).toBe(true);
    expect(otpComplete(emptyOtp())).toBe(false);
  });
});
