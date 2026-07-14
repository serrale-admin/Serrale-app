/** Shared 6-digit OTP helpers for login, verify, and provider join. */
export const OTP_LENGTH = 6;

export function emptyOtp(): string[] {
  return Array.from({ length: OTP_LENGTH }, () => '');
}

export function sanitizeSingleOtpDigit(raw: string): string {
  return raw.replace(/[^0-9]/g, '').slice(-1);
}

/** Spread a pasted SMS code across six boxes (partial paste allowed). */
export function parseOtpPaste(raw: string): string[] {
  const digits = raw.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
  const next = emptyOtp();
  for (let i = 0; i < digits.length; i += 1) next[i] = digits[i]!;
  return next;
}

export function otpComplete(code: readonly string[]): boolean {
  return code.length === OTP_LENGTH && code.every((d) => d !== '');
}
