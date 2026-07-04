import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import { normalizeEthiopianPhone } from '../../lib/phone';
import type { OtpChallenge, OtpPurpose, VerifyResult } from '../shared';
import type { ApiOtpChallenge, ApiOtpVerify, ApiSessionExchange, ApiSessionRefresh } from './types';
import type { VerifyArgs } from '../mock/auth';

/** POST /otp/request — sends an OTP via the backend (AfroMessage) and returns a challenge. */
export async function requestOtp(phone: string, purpose: OtpPurpose): Promise<OtpChallenge> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error('Enter a valid Ethiopian phone number.'));
  const data = await http<ApiOtpChallenge>(`${DIRECTORY}/otp/request`, {
    method: 'POST',
    body: { phone: normalized, purpose },
    skipAuthInterceptor: true, // Pre-auth: never trigger a session refresh from OTP calls.
  });
  return { challengeId: data.challenge_id, expiresAt: data.expires_at, reused: data.reused };
}

/** POST /otp/verify — verifies the code and returns a one-time verify_token. */
export async function verifyOtp(args: VerifyArgs): Promise<VerifyResult> {
  const normalized = normalizeEthiopianPhone(args.phone) || args.phone;
  const data = await http<ApiOtpVerify>(`${DIRECTORY}/otp/verify`, {
    method: 'POST',
    body: { challenge_id: args.challengeId, code: args.code, phone: normalized, purpose: args.purpose },
    // Pre-auth: a wrong code returns 401 OTP_INCORRECT — must NOT fire the refresh interceptor.
    skipAuthInterceptor: true,
  });
  if (!data?.verified || !data?.verify_token) {
    return Promise.reject(new Error('Incorrect code. Check the SMS and try again.'));
  }
  return { verified: true, verifyToken: data.verify_token };
}

/** POST /customers/session — exchanges verify_token for customer session tokens. */
export async function exchangeSession(phone: string, verifyToken: string): Promise<ApiSessionExchange> {
  const normalized = normalizeEthiopianPhone(phone) || phone;
  return await http<ApiSessionExchange>(`${DIRECTORY}/customers/session`, {
    method: 'POST',
    body: { phone: normalized, verify_token: verifyToken },
    skipAuthInterceptor: true, // Do not intercept auth calls themselves
  });
}

/** POST /customers/session/refresh — rotates customer refresh token to get new session tokens. */
export async function refreshSession(refreshToken: string): Promise<ApiSessionRefresh> {
  return await http<ApiSessionRefresh>(`${DIRECTORY}/customers/session/refresh`, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    skipAuthInterceptor: true, // Bare path: must NOT recursively trigger the 401-refresh interceptor.
  });
}

/** POST /customers/session/logout — revokes the customer refresh session. */
export async function logoutSession(refreshToken: string): Promise<{ ok: boolean }> {
  try {
    const res = await http<{ ok?: boolean }>(`${DIRECTORY}/customers/session/logout`, {
      method: 'POST',
      body: { refresh_token: refreshToken },
      skipAuthInterceptor: true, // Do not intercept logout calls
    });
    return { ok: res?.ok ?? true };
  } catch {
    // Best-effort logout: ignore network failures or session-expired 401s during logout
    return { ok: true };
  }
}

