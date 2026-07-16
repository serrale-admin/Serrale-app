import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import { providerSession } from '../../lib/provider-session';
import type { ApiProviderAccount } from './types';

async function providerToken(): Promise<string> {
  const record = await providerSession.read();
  if (!record?.sessionToken) {
    return Promise.reject(new Error('Provider session not found. Log in again.'));
  }
  return record.sessionToken;
}

/** GET /providers/me — live provider listing (requires provider JWT). */
export async function fetchProviderMe(): Promise<ApiProviderAccount> {
  const token = await providerToken();
  const data = await http<{ provider: ApiProviderAccount }>(`${DIRECTORY}/providers/me`, { token });
  if (!data?.provider) {
    return Promise.reject(new Error('Provider profile unavailable.'));
  }
  return data.provider;
}

export interface ProviderProfilePatch {
  fullName?: string;
  area?: string;
  whatsappNumber?: string;
  experience?: string;
  description?: string;
  categorySlug?: string;
  providerType?: 'individual' | 'business';
  engagementTypes?: ('temporary' | 'permanent')[];
}

/** PATCH /providers/me — update listing details (provider JWT). */
export async function updateProviderProfile(patch: ProviderProfilePatch): Promise<ApiProviderAccount> {
  const token = await providerToken();
  const data = await http<{ provider: ApiProviderAccount }>(`${DIRECTORY}/providers/me`, {
    method: 'PATCH',
    token,
    body: patch,
  });
  if (!data?.provider) {
    return Promise.reject(new Error('Could not save your provider profile.'));
  }
  return data.provider;
}
