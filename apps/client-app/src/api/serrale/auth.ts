import { DIRECTORY } from '../../lib/env';
import { HttpError, http } from '../../lib/http';
import { parseOtpDelivery } from '../../lib/otp-delivery';
import { normalizeEthiopianPhone, PHONE_INVALID_MESSAGE } from '../../lib/phone';
import type { OtpChallenge, OtpPurpose, VerifyResult } from '../shared';
import type {
  ApiCustomerProfile,
  ApiOtpChallenge,
  ApiOtpVerify,
  ApiProviderSessionResult,
  ApiSessionExchange,
  ApiSessionRefresh,
} from './types';
import type { VerifyArgs } from '../mock/auth';

export interface PhoneAccountHintResponse {
  account: NonNullable<ApiOtpChallenge['account']>;
  resolved_role: 'customer' | 'provider';
}

/** POST /accounts/hint — DB lookup before OTP; no SMS sent. */
export async function fetchPhoneAccountHint(
  phone: string,
  preferredRole: 'customer' | 'provider' = 'customer',
): Promise<PhoneAccountHintResponse | null> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error(PHONE_INVALID_MESSAGE));
  try {
    const data = await http<PhoneAccountHintResponse>(`${DIRECTORY}/accounts/hint`, {
      method: 'POST',
      body: { phone: normalized, preferred_role: preferredRole },
      skipAuthInterceptor: true,
    });
    if (!data?.account) return null;
    return data;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.code === 'NOT_FOUND')) {
      return null;
    }
    throw e;
  }
}

/**
 * POST /otp/request — sends an OTP via the backend (AfroMessage) and returns a challenge.
 *
 * `idempotencyKey` (when supplied) is sent as the `Idempotency-Key` header. The
 * backend replays the same challenge for a repeated key within a 60s window
 * (publicDirectory.ts otpReplayKey/otpReplayCache), so one logical "send" — even
 * if the request is retried — never fans out into multiple SMS.
 */
export async function requestOtp(
  phone: string,
  purpose: OtpPurpose,
  idempotencyKey?: string,
): Promise<OtpChallenge> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error(PHONE_INVALID_MESSAGE));
  const data = await http<ApiOtpChallenge>(`${DIRECTORY}/otp/request`, {
    method: 'POST',
    body: { phone: normalized, purpose },
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    skipAuthInterceptor: true, // Pre-auth: never trigger a session refresh from OTP calls.
  });
  return {
    challengeId: data.challenge_id,
    expiresAt: data.expires_at,
    reused: data.reused,
    delivery: parseOtpDelivery(data.delivery) ?? undefined,
    account: data.account,
  };
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

export interface FetchCustomerMeOptions {
  skipAuthInterceptor?: boolean;
}

/** GET /customers/me — current customer hiring profile (requires Bearer access token). */
export async function fetchCustomerMe(options: FetchCustomerMeOptions = {}): Promise<ApiCustomerProfile> {
  const data = await http<{ customer: ApiCustomerProfile }>(`${DIRECTORY}/customers/me`, {
    skipAuthInterceptor: options.skipAuthInterceptor,
  });
  if (!data?.customer) {
    return Promise.reject(new Error('Customer profile unavailable.'));
  }
  return data.customer;
}

export interface CustomerProfilePayload {
  client_type: 'individual' | 'company';
  display_name: string;
  company_name?: string | null;
  area_slug?: string | null;
  id_number?: string | null;
  id_document_url?: string | null;
  business_license_number?: string | null;
  business_license_url?: string | null;
}

/** PATCH /customers/me — update hiring profile (Bearer session required). */
export async function updateCustomerProfile(payload: CustomerProfilePayload): Promise<ApiCustomerProfile> {
  const data = await http<{ customer: ApiCustomerProfile }>(`${DIRECTORY}/customers/me`, {
    method: 'PATCH',
    body: payload,
  });
  if (!data?.customer) {
    return Promise.reject(new Error('Could not save your profile.'));
  }
  return data.customer;
}

/** POST /providers/login — provider OTP login after directory_provider_login verify. */
export async function loginProvider(verifyToken: string, phone: string): Promise<ApiProviderSessionResult> {
  const normalized = normalizeEthiopianPhone(phone) || phone;
  return await http<ApiProviderSessionResult>(`${DIRECTORY}/providers/login`, {
    method: 'POST',
    body: { verify_token: verifyToken, phone: normalized },
    skipAuthInterceptor: true,
  });
}

/**
 * POST /customers/session/from-provider — mint customer tokens from a live
 * provider JWT so request history works for hybrid provider-only logins.
 */
export async function ensureCustomerSessionFromProvider(): Promise<{
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
} | null> {
  try {
    return await http<{
      access_token: string;
      refresh_token: string;
      access_expires_at: string;
    }>(`${DIRECTORY}/customers/session/from-provider`, {
      method: 'POST',
      body: {},
      skipAuthInterceptor: true,
    });
  } catch {
    return null;
  }
}

export interface RegisterProviderPayload {
  verifyToken: string;
  phone: string;
  fullName: string;
  categorySlug: string;
  area?: string;
  whatsappNumber?: string;
  experience?: string;
  description?: string;
  providerType?: 'individual' | 'business';
  engagementTypes?: ('temporary' | 'permanent')[];
}

/** POST /providers/register — registers a Basic provider after provider_join OTP verification. */
export async function registerProvider(payload: RegisterProviderPayload): Promise<ApiProviderSessionResult> {
  const normalized = normalizeEthiopianPhone(payload.phone) || payload.phone;
  return await http<ApiProviderSessionResult>(`${DIRECTORY}/providers/register`, {
    method: 'POST',
    body: {
      verify_token: payload.verifyToken,
      phone: normalized,
      fullName: payload.fullName.trim(),
      categorySlug: payload.categorySlug,
      area: payload.area || undefined,
      whatsappNumber: payload.whatsappNumber || undefined,
      experience: payload.experience || undefined,
      description: payload.description || undefined,
      providerType: payload.providerType,
      engagementTypes: payload.engagementTypes,
    },
    skipAuthInterceptor: true,
  });
}

