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

/** Backend engagement enum. '' (not specified) -> omitted, distinct from `timing`. */
function engagementTypeFor(engagement: string): 'temporary' | 'permanent' | undefined {
  if (engagement === 'Temporary') return 'temporary';
  if (engagement === 'Permanent') return 'permanent';
  return undefined;
}

/**
 * Submits a customer service request (POST /leads/request).
 *
 * Authenticated + idempotent: Bearer session + Idempotency-Key. Returns
 * `{ ok, duplicate, idempotentReplay? }` plus additive identity fields when the
 * backend provides them (`id`, `status`, `created_at`, `kind`).
 *
 * `serviceNeed` is ALWAYS sent as a non-empty string. Production
 * (`SERRALE-Main`) still validates `serviceNeed: z.string().min(1)`. The form
 * treats the description as optional, so when it is blank we fall back to the
 * selected category slug — never omit the field or Zod returns VALIDATION_ERROR
 * ("Some details don't look right").
 */
export async function createServiceRequest(input: ServiceRequest, idempotencyKey?: string): Promise<CreatedRequest> {
  const phone = useAppStore.getState().user?.phone;
  const key = idempotencyKey || generateRequestId();

  const note =
    [input.budget ? `Budget: ${input.budget}` : '', input.preferredContact ? `Preferred contact: ${input.preferredContact}` : '']
      .filter(Boolean)
      .join(' · ') || undefined;

  const description = input.description.trim();
  const serviceNeed = description || input.categoryId.trim();
  if (!serviceNeed) {
    throw Object.assign(new Error('Choose a service'), { name: 'ValidationError' });
  }

  const body: Record<string, unknown> = {
    phone,
    serviceNeed,
    serviceCategory: input.categoryId,
    location: input.area,
    timing: timingFor(input.when),
    note,
  };
  const engagementType = engagementTypeFor(input.engagement);
  if (engagementType) body.engagementType = engagementType;

  const res = await http<{
    ok?: boolean;
    duplicate?: boolean;
    idempotent_replay?: boolean;
    id?: string;
    status?: string;
    created_at?: string;
    kind?: 'request';
  }>(`${DIRECTORY}/leads/request`, {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body,
  });

  return {
    ok: true,
    duplicate: res?.duplicate ?? false,
    idempotentReplay: res?.idempotent_replay ?? false,
    id: res?.id,
    status: res?.status,
    created_at: res?.created_at,
    kind: res?.kind,
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

/** Reasons accepted by POST /providers/:id/reports. */
export const PROVIDER_REPORT_REASONS = [
  'spam',
  'scam',
  'inappropriate',
  'wrong_info',
  'not_reachable',
  'other',
] as const;

export type ProviderReportReason = (typeof PROVIDER_REPORT_REASONS)[number];

/**
 * Submit a provider report to SERRALE staff (POST /providers/:id/reports).
 * Optional session is attached automatically by http() when logged in.
 * Throws on failure so the UI can show an error toast (never a fake "sent").
 */
export async function reportProvider(
  providerId: string,
  input: { reason: ProviderReportReason; details?: string }
): Promise<{ recorded: boolean; id?: string }> {
  const res = await http<{ recorded?: boolean; id?: string }>(
    `${DIRECTORY}/providers/${encodeURIComponent(providerId)}/reports`,
    {
      method: 'POST',
      body: {
        reason: input.reason,
        details: input.details,
        source_platform: 'mobile_app',
        source_flow: 'provider_detail',
      },
    }
  );
  return { recorded: res?.recorded ?? true, id: res?.id };
}
