import { AREA_ALL } from '../../data/mock';
import { DIRECTORY } from '../../lib/env';
import { http, QueryValue } from '../../lib/http';
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
 * Translates the UI's logical page + area into the ONLY list params the backend
 * actually reads: `category`, `area`, `q`, `limit`, `offset` (contract matrix
 * M-4/M-5). Filter/sort UI state that has no backing column server-side
 * (verified, available_today, rating, price, experience, sort) is intentionally
 * NOT sent — it would be silently ignored and imply filtering that cannot happen.
 * The city-wide sentinel area omits `area` entirely (browse the whole city).
 */
function listParams(query: ProviderQuery, page: number, limit = PAGE_SIZE): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {
    limit,
    offset: page * limit,
  };
  if (query.categoryId) params.category = query.categoryId;
  const area = query.filters?.areas?.[0] ?? query.area;
  if (area && area !== AREA_ALL) params.area = area;
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

export async function getNearbyProviders(area: string, limit = 5): Promise<Provider[]> {
  const params: Record<string, QueryValue> = { limit, offset: 0 };
  if (area && area !== AREA_ALL) params.area = area;
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(`${DIRECTORY}/providers`, { query: params });
  return toProviderPage(payload, 0).items.slice(0, limit);
}

/**
 * "Verified providers" home rail. The backend has no `verified` column/filter
 * (M-3/M-4), so this simply returns the most recent public providers — every
 * publicly listed provider is admin-reviewed, which is the real trust signal the
 * card surfaces. No `verified: true` param is sent (it would be ignored).
 */
export async function getVerifiedProviders(limit = 3): Promise<Provider[]> {
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(`${DIRECTORY}/providers`, {
    query: { limit, offset: 0 },
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

/** The live backend exposes no per-provider reviews (M-3); resolve to empty. */
export function getProviderReviews(_providerId: string, _limit?: number): Promise<Review[]> {
  return Promise.resolve([]);
}
