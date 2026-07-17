import { AREA_ALL } from '../../data/mock';
import { DIRECTORY } from '../../lib/env';
import { http, HttpError, NetworkError, QueryValue } from '../../lib/http';
import type { PastWork, Provider, ProviderQuery, Review } from '../../types';
import { Page, PAGE_SIZE } from '../shared';
import { toProviderPage } from './adapters';
import type { ApiListPayload, ApiProvider } from './types';

interface ApiProviderDetailPayload {
  provider?: ApiProvider | null;
}

function unwrapProvider(payload: ApiProvider | ApiProviderDetailPayload | null): ApiProvider | null {
  if (!payload) return null;
  if ('id' in payload && typeof (payload as ApiProvider).id === 'string') return payload as ApiProvider;
  return (payload as ApiProviderDetailPayload).provider || null;
}

/**
 * Translates the UI's logical page + area into the list params the backend
 * actually reads: `category`, `area`, `q`, `limit`, `offset`, and (added with
 * provider_type/engagement_types) `engagement` (contract matrix M-4/M-5). Filter/
 * sort UI state that still has no backing column server-side (available_today,
 * rating, price, experience, sort) is intentionally NOT sent — it would be
 * silently ignored and imply filtering that cannot happen. The city-wide
 * sentinel area omits `area` entirely (browse the whole city).
 */
function listParams(query: ProviderQuery, page: number, limit = PAGE_SIZE): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {
    limit,
    offset: page * limit,
  };
  if (query.categoryId) params.category = query.categoryId;
  const area = query.filters?.areas?.[0] ?? query.area;
  if (area && area !== AREA_ALL) params.area = area;
  if (query.filters?.engagement) params.engagement = query.filters.engagement;
  return params;
}

/** Free-text search routes to /search; everything else to /providers. */
export async function getProviders(query: ProviderQuery = {}, page = 0): Promise<Page<Provider>> {
  const params = listParams(query, page);
  const path = query.search ? `${DIRECTORY}/search` : `${DIRECTORY}/providers`;
  if (query.search) params.q = query.search;
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(path, { query: params });
  return toProviderPage(payload, page);
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  const payload = await http<ApiProvider | ApiProviderDetailPayload | null>(`${DIRECTORY}/providers/${encodeURIComponent(id)}`);
  const row = unwrapProvider(payload);
  return row ? toProviderPage([row], 0).items[0] : undefined;
}

export async function getNearbyProviders(
  area: string,
  limit = 5,
  engagement?: string,
): Promise<Provider[]> {
  const params: Record<string, QueryValue> = { limit, offset: 0 };
  if (area && area !== AREA_ALL) params.area = area;
  if (engagement === 'temporary' || engagement === 'permanent') params.engagement = engagement;
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(`${DIRECTORY}/providers`, { query: params });
  return toProviderPage(payload, 0).items.slice(0, limit);
}

/**
 * "Verified providers" home rail. The backend has no `verified` column/filter
 * (M-3/M-4), so this simply returns the most recent public providers — every
 * publicly listed provider is admin-reviewed, which is the real trust signal the
 * card surfaces. No `verified: true` param is sent (it would be ignored).
 * Optional `engagement` mirrors the list filter (`?engagement=`).
 */
export async function getVerifiedProviders(limit = 3, engagement?: string): Promise<Provider[]> {
  const params: Record<string, QueryValue> = { limit, offset: 0 };
  if (engagement === 'temporary' || engagement === 'permanent') params.engagement = engagement;
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(`${DIRECTORY}/providers`, {
    query: params,
  });
  return toProviderPage(payload, 0).items.slice(0, limit);
}

/**
 * The live backend exposes no per-provider portfolio (M-3). Rather than issue a
 * redundant provider-detail fetch that can never contain past work, resolve to
 * an empty list. The detail screen renders a neutral "No past work" state.
 */
export function getProviderPastWork(_providerId: string): Promise<PastWork[]> {
  return Promise.resolve([]);
}

/** No global recent-work endpoint in the contract; live mode returns none. */
export function getRecentWork(_limit = 4): Promise<PastWork[]> {
  return Promise.resolve([]);
}

/** Live published reviews for a provider. Soft-fails under circuit/5xx/404. */
export async function getProviderReviews(providerId: string, limit = 20): Promise<Review[]> {
  try {
    const payload = await http<{
      reviews?: Array<{
        id?: string;
        rating?: number;
        comment?: string | null;
        display_name?: string | null;
        created_at?: string;
      }>;
    }>(`${DIRECTORY}/providers/${encodeURIComponent(providerId)}/reviews`, {
      query: { limit, offset: 0 },
    });
    const rows = payload?.reviews || [];
    return rows
      .filter((r) => r && typeof r.rating === 'number' && r.rating > 0)
      .map((r) => ({
        providerId,
        userName: (r.display_name && String(r.display_name).trim()) || 'Customer',
        area: '',
        rating: Number(r.rating),
        text: (r.comment && String(r.comment).trim()) || '',
      }));
  } catch (err) {
    if (err instanceof HttpError && (err.status === 404 || err.status === 501 || err.status >= 500)) {
      return [];
    }
    if (err instanceof NetworkError) return [];
    throw err;
  }
}

export type ReviewEligibilityStatus = 'eligible' | 'need_login' | 'already_rated';

export interface ReviewEligibility {
  status: ReviewEligibilityStatus;
  existing_rating?: number | null;
}

/**
 * Advisory eligibility. Soft-fails to `eligible` (never need_login) on
 * missing/degraded endpoints so a logged-in UI never flashes "Sign in to rate".
 * The screen CTA MUST still gate on local `loggedIn` via mapRateEligibilityCta —
 * API need_login alone must never drive the Sign in label.
 * Stale `need_contact` from old backends is mapped to eligible.
 */
export async function getReviewEligibility(providerId: string): Promise<ReviewEligibility> {
  try {
    const payload = await http<ReviewEligibility & { status?: string }>(
      `${DIRECTORY}/providers/${encodeURIComponent(providerId)}/reviews/eligibility`
    );
    const status = payload?.status;
    return {
      status:
        status === 'already_rated' || status === 'need_login' || status === 'eligible'
          ? status
          : 'eligible',
      existing_rating: payload?.existing_rating ?? null,
    };
  } catch (err) {
    // Never soft-fail to need_login — that caused false "Sign in to rate" CTAs.
    // Real guests are gated by local session state on the detail screen.
    if (
      err instanceof NetworkError ||
      (err instanceof HttpError &&
        (err.status === 401 ||
          err.status === 404 ||
          err.status === 501 ||
          err.status === 429 ||
          err.status >= 500))
    ) {
      return { status: 'eligible' };
    }
    throw err;
  }
}

export interface SubmitReviewResult {
  review: Review;
  avg_rating: number | null;
  review_count: number;
}

/** Submit a review (instant publish). Requires any app login (customer or provider JWT). */
export async function submitProviderReview(
  providerId: string,
  input: { rating: number; comment?: string; idempotencyKey?: string }
): Promise<SubmitReviewResult> {
  const idem =
    input.idempotencyKey ||
    `review:${providerId}:${input.rating}:${(input.comment || '').slice(0, 48)}`;
  const payload = await http<{
    review: {
      id?: string;
      rating: number;
      comment?: string | null;
      display_name?: string | null;
      created_at?: string;
    };
    avg_rating?: number | null;
    review_count?: number;
  }>(`${DIRECTORY}/providers/${encodeURIComponent(providerId)}/reviews`, {
    method: 'POST',
    body: {
      rating: input.rating,
      comment: input.comment,
    },
    headers: {
      'Idempotency-Key': idem.slice(0, 128),
    },
  });
  return {
    review: {
      providerId,
      userName: (payload.review?.display_name && String(payload.review.display_name).trim()) || 'Customer',
      area: '',
      rating: Number(payload.review?.rating || input.rating),
      text: (payload.review?.comment && String(payload.review.comment).trim()) || input.comment || '',
    },
    avg_rating: payload.avg_rating ?? null,
    review_count: Number(payload.review_count || 0),
  };
}
