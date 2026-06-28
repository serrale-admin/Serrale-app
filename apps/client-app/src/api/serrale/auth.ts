import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import { normalizeEthiopianPhone } from '../../lib/phone';
import type { OtpChallenge, OtpPurpose, VerifyResult } from '../shared';
import type { ApiOtpChallenge, ApiOtpVerify } from './types';
import type { VerifyArgs } from '../mock/auth';

/** POST /otp/request — sends an OTP via the backend (AfroMessage) and returns a challenge. */
export async function requestOtp(phone: string, purpose: OtpPurpose): Promise<OtpChallenge> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error('Enter a valid Ethiopian phone number.'));
  const data = await http<ApiOtpChallenge>(`${DIRECTORY}/otp/request`, {
    method: 'POST',
    body: { phone: normalized, purpose },
  });
  return { challengeId: data.challenge_id, expiresAt: data.expires_at, reused: data.reused };
}

/** POST /otp/verify — verifies the code and returns a one-time verify_token. */
export async function verifyOtp(args: VerifyArgs): Promise<VerifyResult> {
  const normalized = normalizeEthiopianPhone(args.phone) || args.phone;
  const data = await http<ApiOtpVerify>(`${DIRECTORY}/otp/verify`, {
    method: 'POST',
    body: { challenge_id: args.challengeId, code: args.code, phone: normalized, purpose: args.purpose },
  });
  if (!data?.verified || !data?.verify_token) {
    return Promise.reject(new Error('Incorrect code. Check the SMS and try again.'));
  }
  return { verified: true, verifyToken: data.verify_token };
}
