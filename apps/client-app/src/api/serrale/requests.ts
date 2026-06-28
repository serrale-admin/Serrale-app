import { CATS } from '../../data/mock';
import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import type { ServiceRequest } from '../../types';
import type { CreatedRequest } from '../shared';

const slugFor = (categoryId: string) => CATS.find((c) => c.id === categoryId)?.id || categoryId;

/**
 * Submits a customer service request (POST /leads/request). Requires the
 * `verify_token` obtained from the OTP verify step (purpose directory_customer_request).
 */
export async function createServiceRequest(input: ServiceRequest, verifyToken?: string): Promise<CreatedRequest> {
  const created = await http<{ id?: string; status?: string; created_at?: string }>(`${DIRECTORY}/leads/request`, {
    method: 'POST',
    token: verifyToken,
    body: {
      verify_token: verifyToken,
      category: slugFor(input.categoryId),
      area: input.area,
      description: input.description,
      when: input.when,
      budget: input.budget || undefined,
      preferred_contact: input.preferredContact,
    },
  });
  return {
    id: created?.id || 'request',
    status: created?.status || 'new',
    createdAt: created?.created_at || new Date().toISOString(),
  };
}

/**
 * Logs a provider contact lead (POST /leads/provider) when a user taps Call/WhatsApp.
 * Best-effort: callers fire-and-forget so contact is never blocked.
 */
export async function createProviderLead(providerId: string, verifyToken?: string): Promise<{ ok: true }> {
  await http<unknown>(`${DIRECTORY}/leads/provider`, {
    method: 'POST',
    token: verifyToken,
    body: { provider_id: providerId, verify_token: verifyToken },
  });
  return { ok: true };
}
