import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';

export type DirectoryNotificationType =
  | 'contact_received'
  | 'customer_reviewed'
  | 'provider_reviewed'
  | 'report_update'
  | 'system';

export interface DirectoryNotification {
  id: string;
  type: DirectoryNotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  contact_event_id: string | null;
  read_at: string | null;
  created_at: string;
}

export async function fetchNotifications(opts?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<{ items: DirectoryNotification[]; unread_count: number }> {
  return http(`${DIRECTORY}/notifications`, {
    query: {
      unread_only: opts?.unreadOnly ? 'true' : undefined,
      limit: opts?.limit ?? 50,
    },
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  await http(`${DIRECTORY}/notifications/${id}/read`, { method: 'POST', body: {} });
}

export async function markAllNotificationsRead(): Promise<void> {
  await http(`${DIRECTORY}/notifications/read-all`, { method: 'POST', body: {} });
}

export async function registerPushToken(token: string, platform: 'expo' | 'ios' | 'android' = 'expo') {
  return http(`${DIRECTORY}/push-tokens`, {
    method: 'POST',
    body: { token, platform },
  });
}

export interface CustomerTrustProfile {
  id: string;
  display_name: string;
  client_type: string | null;
  company_name: string | null;
  area_slug: string | null;
  avg_rating: number | null;
  review_count: number;
  member_since: string;
}

export async function fetchCustomerTrust(customerId: string): Promise<{
  customer: CustomerTrustProfile;
  reviews: Array<{ id: string; rating: number; comment: string | null; display_name: string; created_at: string }>;
}> {
  return http(`${DIRECTORY}/customers/${customerId}/trust`);
}

export async function fetchCustomerReviewEligibility(
  customerId: string,
): Promise<{ status: 'eligible' | 'need_login' | 'need_contact' | 'already_rated' }> {
  return http(`${DIRECTORY}/customers/${customerId}/reviews/eligibility`);
}

export async function submitCustomerReview(
  customerId: string,
  input: { rating: number; comment?: string; contact_event_id?: string },
  idempotencyKey: string,
) {
  return http(`${DIRECTORY}/customers/${customerId}/reviews`, {
    method: 'POST',
    body: input,
    headers: { 'Idempotency-Key': idempotencyKey.slice(0, 128) },
  });
}

export async function reportCustomer(
  customerId: string,
  input: {
    reason: string;
    details?: string;
    source_flow?: string;
    contact_event_id?: string;
  },
) {
  return http(`${DIRECTORY}/customers/${customerId}/reports`, {
    method: 'POST',
    body: {
      reason: input.reason,
      details: input.details,
      source_platform: 'mobile_app',
      source_flow: input.source_flow ?? 'trust',
      contact_event_id: input.contact_event_id,
    },
  });
}

export interface SharedLead {
  share_id: string;
  lead_id: string;
  customer_id: string | null;
  phone: string;
  display_name: string | null;
  service_need: string | null;
  service_category: string | null;
  location: string | null;
  created_at: string;
}

export async function fetchSharedLeads(): Promise<{ leads: SharedLead[] }> {
  return http(`${DIRECTORY}/providers/me/shared-leads`);
}

export async function logLeadContact(input: {
  leadId: string;
  eventType: 'phone_click' | 'whatsapp_click';
  sourceFlow?: string;
}) {
  const clientEventId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return http(`${DIRECTORY}/leads/${input.leadId}/contact-events`, {
    method: 'POST',
    body: {
      event_type: input.eventType,
      source_platform: 'mobile_app',
      source_flow: input.sourceFlow ?? 'shared_lead',
      client_event_id: clientEventId,
    },
  }).catch(() => ({ recorded: false }));
}
