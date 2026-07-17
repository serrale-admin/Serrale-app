import { DIRECTORY } from '../../lib/env';
import { http, HttpError } from '../../lib/http';

export type ActivityType = 'request' | 'job';
export type DisplayStatus = 'submitted' | 'in_progress' | 'closed' | 'unavailable';

export interface CustomerActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  category: string | null;
  location: string | null;
  engagement: 'temporary' | 'permanent' | null;
  timing: string | null;
  status: string;
  display_status: DisplayStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityTimelineEvent {
  id: string;
  from_status: string | null;
  to_status: string;
  display_status: string | null;
  actor_type: string;
  note: string | null;
  created_at: string;
}

export interface CustomerActivityDetail extends CustomerActivityItem {
  note: string | null;
  description: string | null;
  timeline: ActivityTimelineEvent[];
}

/**
 * Fetches the customer's merged request/job history.
 * Soft-fails to an empty list when the activity API is not deployed yet
 * (production currently 404s `/customers/me/activity`).
 */
export async function fetchMyActivity(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ items: CustomerActivityItem[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.offset != null) q.set('offset', String(params.offset));
  const qs = q.toString();
  try {
    return await http<{ items: CustomerActivityItem[]; total: number }>(
      `${DIRECTORY}/customers/me/activity${qs ? `?${qs}` : ''}`,
    );
  } catch (err) {
    if (err instanceof HttpError && (err.status === 404 || err.status === 501)) {
      return { items: [], total: 0 };
    }
    throw err;
  }
}

export async function fetchActivityDetail(
  type: ActivityType,
  id: string,
): Promise<CustomerActivityDetail> {
  try {
    const res = await http<{ item: CustomerActivityDetail }>(
      `${DIRECTORY}/customers/me/activity/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
    );
    return res.item;
  } catch (err) {
    if (err instanceof HttpError && (err.status === 404 || err.status === 501)) {
      throw new HttpError(404, 'Request history is not available on this server yet.', 'ACTIVITY_UNAVAILABLE');
    }
    throw err;
  }
}
