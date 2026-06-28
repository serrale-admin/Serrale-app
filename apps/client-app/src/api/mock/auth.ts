import { normalizeEthiopianPhone } from '../../lib/phone';
import type { OtpChallenge, OtpPurpose, VerifyResult } from '../shared';
import { delay } from './client';

export interface VerifyArgs {
  challengeId: string;
  code: string;
  phone: string;
  purpose: OtpPurpose;
}

let challengeSeq = 1;

/** Requests an OTP (mock): validates the phone, returns a fake challenge. */
export function requestOtp(phone: string, _purpose: OtpPurpose): Promise<OtpChallenge> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error('Enter a valid Ethiopian phone number.'));
  return delay(
    { challengeId: 'mock-challenge-' + challengeSeq++, expiresAt: new Date(Date.now() + 300_000).toISOString() },
    400,
  );
}

/** Verifies an OTP (mock): accepts any 6-digit code, returns a fake verify_token. */
export function verifyOtp(args: VerifyArgs): Promise<VerifyResult> {
  if (args.code.replace(/[^0-9]/g, '').length !== 6) {
    return Promise.reject(new Error('Enter the 6-digit code.'));
  }
  return delay({ verified: true, verifyToken: 'mock-verify-token-' + Date.now() }, 400);
}
