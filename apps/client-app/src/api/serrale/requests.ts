import { useAppStore } from '../../store/appStore';
import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import { generateRequestId } from '../../lib/request-policy';
import type { ServiceRequest } from '../../types';
import type { CreatedRequest } from '../shared';

/** Contact-event types the backend records (contactEventSchema). */
export type ContactEventType = 'profile_view' | 'phone_click' | 'whatsapp_click' | 'copy_phone';

interface ContactEventInput {
  providerId: string;
  eventType: ContactEventType;
  sourceFlow?: string;
  searchQuery?: string;
  userArea?: string;
}

/** Backend timing enum. */
type Timing = 'emergency' | 'today' | 'this_week' | 'flexible';

function timingFor(when: string): Timing {
  if (when === 'Emergency') return 'emergency';
  if (when === 'Today') return 'today';
  if (when === 'This week') return 'this_week';
  return 'flexible';
}

/**
 * Submits a customer service request (POST /leads/request).
 *
 * Authenticated + idempotent: the request goes out under the customer's Bearer
 * session (auto-attached by the http layer's token provider — no verify_token in
 * the body, so the backend takes its session branch) with an `Idempotency-Key`
 * header. `idempotencyKey` MUST be stable across retries of one logical
 * submission so an offline/timeout retry-tap replays server-side instead of
 * creating a duplicate lead. The caller (useCreateRequest) generates one key per
 * submit action and reuses it on retry.
 *
 * Returns the HONEST backend shape `{ ok, duplicate, idempotentReplay? }` — no
 * synthesized id/status/created_at (contract matrix M-1).
 */
export async function createServiceRequest(input: ServiceRequest, idempotencyKey?: string): Promise<CreatedRequest> {
  const phone = useAppStore.getState().user?.phone;
  const key = idempotencyKey || generateRequestId();

  const note =
    [input.budget ? `Budget: ${input.budget}` : '', input.preferredContact ? `Preferred contact: ${input.preferredContact}` : '']
      .filter(Boolean)
      .join(' · ') || undefined;

  const res = await http<{ ok?: boolean; duplicate?: boolean; idempotent_replay?: boolean }>(`${DIRECTORY}/leads/request`, {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: {
      phone,
      serviceNeed: input.description,
      serviceCategory: input.categoryId,
      location: input.area,
      timing: timingFor(input.when),
      note,
    },
  });

  return {
    ok: true,
    duplicate: res?.duplicate ?? false,
    idempotentReplay: res?.idempotent_replay ?? false,
  };
}

/**
 * Records a provider contact event (POST /providers/:id/contact-events) when a
 * user opens a profile or taps Call/WhatsApp. This is the purpose-built public
 * analytics endpoint (contract matrix M-2/M-6) — it needs NO verify_token.
 *
 * Fire-and-forget: this never throws and callers must NOT await it before
 * opening tel:/wa.me. A failure here can never block a contact action.
 */
export function logProviderContact({ providerId, eventType, sourceFlow, searchQuery, userArea }: ContactEventInput): Promise<{ recorded: boolean }> {
  return http<{ recorded?: boolean }>(`${DIRECTORY}/providers/${encodeURIComponent(providerId)}/contact-events`, {
    method: 'POST',
    body: {
      event_type: eventType,
      source_platform: 'mobile_app',
      source_flow: sourceFlow,
      search_query: searchQuery,
      user_area: userArea,
    },
  })
    .then((r) => ({ recorded: r?.recorded ?? true }))
    .catch(() => ({ recorded: false }));
}
