import { normalizeEthiopianPhone, PHONE_INVALID_MESSAGE } from '../../lib/phone';
import { HttpError } from '../../lib/http';
import { resolveLoginRoleFromHint } from '../../lib/phone-account';
import type { OtpChallenge, OtpPurpose, VerifyResult } from '../shared';
import type {
  ApiCustomerProfile,
  ApiProviderAccount,
  ApiProviderSessionResult,
  ApiSessionExchange,
  ApiSessionRefresh,
} from '../serrale/types';
import type { CustomerProfilePayload, PhoneAccountHintResponse } from '../serrale/auth';
import type { ProviderProfilePatch } from '../serrale/provider-account';
import { delay } from './client';

export interface VerifyArgs {
  challengeId: string;
  code: string;
  phone: string;
  purpose: OtpPurpose;
}

let challengeSeq = 1;

/** Mock pre-auth phone lookup (no SMS). */
export function fetchPhoneAccountHint(
  phone: string,
  preferredRole: 'customer' | 'provider' = 'customer',
): Promise<PhoneAccountHintResponse | null> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error(PHONE_INVALID_MESSAGE));
  const isProvider = normalized.endsWith('4841');
  const isCustomer = normalized.endsWith('5678');
  const account = {
    has_customer: isCustomer,
    has_provider: isProvider,
    customer_profile_complete: isCustomer,
  };
  return delay(
    { account, resolved_role: resolveLoginRoleFromHint(account, preferredRole) },
    200,
  );
}

/** Requests an OTP (mock): validates the phone, returns a fake challenge. */
export function requestOtp(
  phone: string,
  purpose: OtpPurpose,
  _idempotencyKey?: string,
): Promise<OtpChallenge> {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized) return Promise.reject(new Error(PHONE_INVALID_MESSAGE));
  // Mirror production: login requires an existing mock customer (...5678).
  if (purpose === 'directory_customer_login' && !normalized.endsWith('5678') && !normalized.endsWith('4841')) {
    return Promise.reject(new HttpError(404, 'No customer account', 'CUSTOMER_NOT_FOUND'));
  }
  if (purpose === 'directory_provider_login' && !normalized.endsWith('4841')) {
    return Promise.reject(new HttpError(404, 'No provider account', 'PROVIDER_NOT_FOUND'));
  }
  return delay(
    {
      challengeId: 'mock-challenge-' + challengeSeq++,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
      account: {
        has_customer: normalized.endsWith('5678') || normalized.endsWith('4841'),
        has_provider: normalized.endsWith('4841'),
        customer_profile_complete: normalized.endsWith('5678') || normalized.endsWith('4841'),
      },
    },
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

/** Mock fetchCustomerMe */
export function fetchCustomerMe(): Promise<ApiCustomerProfile> {
  return delay(
    {
      id: 'mock-customer-uuid',
      phone: '+251912345678',
      phone_verified: true,
      status: 'active',
      display_name: 'Mock Customer',
      profile_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    200,
  );
}

export function updateCustomerProfile(payload: CustomerProfilePayload): Promise<ApiCustomerProfile> {
  return delay(
    {
      id: 'mock-customer-uuid',
      phone: '+251912345678',
      phone_verified: true,
      status: 'active',
      display_name: payload.display_name,
      company_name: payload.company_name ?? null,
      area_slug: payload.area_slug ?? null,
      profile_complete: true,
      client_type: payload.client_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    300,
  );
}

export function loginProvider(_verifyToken: string, phone: string): Promise<ApiProviderSessionResult> {
  const normalized = normalizeEthiopianPhone(phone) || phone;
  return delay(
    {
      session_token: 'mock-provider-session-' + Date.now(),
      provider: {
        id: 'mock-provider-id',
        full_name: 'Mock Provider',
        phone: normalized,
        category_slug: 'plumbers',
        area: 'Bole',
      },
      customer_session: {
        access_token: 'mock-access-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
      },
    },
    400,
  );
}

export function ensureCustomerSessionFromProvider(): Promise<{
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
} | null> {
  return delay(
    {
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
    },
    200,
  );
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
        display_name: 'Mock Customer',
        profile_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...(normalized.endsWith('4841')
        ? {
            account: { has_customer: true, has_provider: true, customer_profile_complete: true },
            linked_provider: {
              id: 'mock-provider-id',
              full_name: 'Mock Provider',
              area: 'Bole',
              category_slug: 'plumbers',
            },
            provider_session: {
              session_token: 'mock-provider-session-' + Date.now(),
              provider: {
                id: 'mock-provider-id',
                full_name: 'Mock Provider',
                phone: normalized,
                category_slug: 'plumbers',
                area: 'Bole',
              },
            },
          }
        : {}),
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

/** Mock provider register endpoint parity with real API. */
export function registerProvider(payload: RegisterProviderPayload): Promise<ApiProviderSessionResult> {
  const normalized = normalizeEthiopianPhone(payload.phone) || payload.phone;
  return delay(
    {
      session_token: 'mock-provider-session-' + Date.now(),
      provider: {
        id: 'mock-provider-' + Date.now(),
        full_name: payload.fullName,
        phone: normalized,
        category_slug: payload.categorySlug,
        area: payload.area || null,
        whatsapp: payload.whatsappNumber || null,
        experience: payload.experience || null,
        bio: payload.description || null,
        status: 'active',
        created_at: new Date().toISOString(),
        provider_type: payload.providerType || 'individual',
        engagement_types: payload.engagementTypes || ['temporary', 'permanent'],
      },
    },
    450,
  );
}

let mockProviderAccount: ApiProviderAccount = {
  id: 'mock-provider-id',
  full_name: 'Mock Provider',
  phone: '+251938064841',
  category_slug: 'plumbers',
  area: 'Bole',
  whatsapp: '+251938064841',
  experience: '5 years',
  bio: 'Reliable plumbing in Addis.',
  photo_url: null,
  status: 'active',
  phone_verified: true,
  kyc_status: 'pending',
  created_at: new Date().toISOString(),
  provider_type: 'individual',
  engagement_types: ['temporary', 'permanent'],
};

export function fetchProviderMe(): Promise<ApiProviderAccount> {
  return delay({ ...mockProviderAccount }, 200);
}

export function updateProviderProfile(patch: ProviderProfilePatch): Promise<ApiProviderAccount> {
  mockProviderAccount = {
    ...mockProviderAccount,
    full_name: patch.fullName ?? mockProviderAccount.full_name,
    area: patch.area ?? mockProviderAccount.area,
    whatsapp: patch.whatsappNumber ?? mockProviderAccount.whatsapp,
    experience: patch.experience ?? mockProviderAccount.experience,
    bio: patch.description ?? mockProviderAccount.bio,
    category_slug: patch.categorySlug ?? mockProviderAccount.category_slug,
    provider_type: patch.providerType ?? mockProviderAccount.provider_type,
    engagement_types: patch.engagementTypes ?? mockProviderAccount.engagement_types,
    updated_at: new Date().toISOString(),
  } as ApiProviderAccount;
  return delay({ ...mockProviderAccount }, 300);
}

