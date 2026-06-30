import { CATS } from '../../data/mock';
import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import type { ServiceRequest } from '../../types';
import type { CreatedRequest } from '../shared';
import { useAppStore } from '../../store/appStore';

interface ProviderLeadInput {
  providerId: string;
  verifyToken?: string;
  fullName?: string;
  phone?: string;
}

const slugFor = (categoryId: string) => CATS.find((c) => c.id === categoryId)?.id || categoryId;

/**
 * Submits a customer service request (POST /leads/request). Requires the
 * `verify_token` obtained from the OTP verify step (purpose directory_customer_request).
 */
export async function createServiceRequest(input: ServiceRequest, verifyToken?: string): Promise<CreatedRequest> {
  const phone = useAppStore.getState().user?.phone;
  const created = await http<{ id?: string; status?: string; created_at?: string }>(`${DIRECTORY}/leads/request`, {
    method: 'POST',
    token: verifyToken,
    body: {
      verify_token: verifyToken,
      phone,
      serviceNeed: input.description,
      serviceCategory: slugFor(input.categoryId),
      location: input.area,
      timing: input.when === 'Today' ? 'today' : input.when === 'This week' ? 'this_week' : 'flexible',
      note: [input.budget ? `Budget: ${input.budget}` : '', input.preferredContact ? `Preferred contact: ${input.preferredContact}` : '']
        .filter(Boolean)
        .join(' · ') || undefined,
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
export async function createProviderLead({ providerId, verifyToken, fullName, phone }: ProviderLeadInput): Promise<{ ok: true }> {
  await http<unknown>(`${DIRECTORY}/leads/provider`, {
    method: 'POST',
    token: verifyToken,
    body: {
      verify_token: verifyToken,
      providerId,
      fullName,
      phone,
    },
  });
  return { ok: true };
}
