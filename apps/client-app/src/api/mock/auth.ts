import { normalizeEthiopianPhone, PHONE_INVALID_MESSAGE } from '../../lib/phone';
import type { OtpChallenge, OtpPurpose, VerifyResult } from '../shared';
import type { ApiSessionExchange, ApiSessionRefresh } from '../serrale/types';
import { delay } from './client';

export interface VerifyArgs {
  challengeId: string;
  code: string;
  phone: string;
  purpose: OtpPurpose;
}

let challengeSeq = 1;

/** Requests an OTP (mock): validates the phone, returns a fake challenge. */
export function requestOtp(
  phone: string,
  _purpose: OtpPurpose,
  _idempotencyKey?: string,
): Promise<OtpChallenge> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error(PHONE_INVALID_MESSAGE));
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

/** Mock exchangeSession */
export function exchangeSession(phone: string, _verifyToken: string): Promise<ApiSessionExchange> {
  const normalized = normalizeEthiopianPhone(phone) || phone;
  return delay(
    {
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
      customer: {
        id: 'mock-customer-uuid',
        phone: normalized,
        phone_verified: true,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    400,
  );
}

/** Mock refreshSession */
export function refreshSession(_refreshToken: string): Promise<ApiSessionRefresh> {
  return delay(
    {
      access_token: 'mock-access-token-rotated-' + Date.now(),
      refresh_token: 'mock-refresh-token-rotated-' + Date.now(),
      access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
    },
    400,
  );
}

/** Mock logoutSession */
export function logoutSession(_refreshToken: string): Promise<{ ok: boolean }> {
  return delay({ ok: true }, 200);
}

