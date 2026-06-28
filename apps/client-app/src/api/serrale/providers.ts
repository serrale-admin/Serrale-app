import { DIRECTORY } from '../../lib/env';
import { http, QueryValue } from '../../lib/http';
import type { Filters, PastWork, Provider, ProviderQuery } from '../../types';
import { Page, PAGE_SIZE } from '../shared';
import { adaptPastWork, adaptProvider, adaptReview, toProviderPage } from './adapters';
import type { ApiListPayload, ApiProvider } from './types';

/** Translates UI filters into query params (backend ignores unknown keys). */
function filterParams(filters?: Filters): Record<string, QueryValue> {
  if (!filters) return {};
  const p: Record<string, QueryValue> = {};
  if (filters.areas.length) p.area = filters.areas.join(',');
  if (filters.avail.includes('Available today')) p.available_today = true;
  if (filters.trust.includes('Verified only')) p.verified = true;
  if (filters.trust.includes('Has past work')) p.has_past_work = true;
  if (filters.rating === '4.5+') p.min_rating = 4.5;
  else if (filters.rating === '4.0+') p.min_rating = 4.0;
  if (filters.price.length) p.price_level = filters.price.join(',').toLowerCase();
  if (filters.exp.includes('5+ years')) p.min_experience = 5;
  else if (filters.exp.includes('3+ years')) p.min_experience = 3;
  else if (filters.exp.includes('1+ years')) p.min_experience = 1;
  return p;
}

/** Free-text search routes to /search; everything else to /providers. */
export async function getProviders(query: ProviderQuery = {}, page = 0): Promise<Page<Provider>> {
  const params: Record<string, QueryValue> = {
    page,
    page_size: PAGE_SIZE,
    category: query.categoryId,
    sort: query.sort,
    ...filterParams(query.filters),
  };
  const path = query.search ? `${DIRECTORY}/search` : `${DIRECTORY}/providers`;
  if (query.search) params.q = query.search;
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(path, { query: params });
  return toProviderPage(payload, page);
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  const row = await http<ApiProvider | null>(`${DIRECTORY}/providers/${encodeURIComponent(id)}`);
  return row ? adaptProvider(row) : undefined;
}

export async function getNearbyProviders(area: string, limit = 5): Promise<Provider[]> {
  const params: Record<string, QueryValue> = { page: 0, page_size: limit };
  if (area && area !== 'All Addis Ababa') params.area = area;
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(`${DIRECTORY}/providers`, { query: params });
  return toProviderPage(payload, 0).items.slice(0, limit);
}

export async function getVerifiedProviders(limit = 3): Promise<Provider[]> {
  const payload = await http<ApiProvider[] | ApiListPayload<ApiProvider>>(`${DIRECTORY}/providers`, {
    query: { page: 0, page_size: limit, verified: true },
  });
  return toProviderPage(payload, 0).items.slice(0, limit);
}

/** Past work comes embedded in the provider detail (`portfolio`). */
export async function getProviderPastWork(providerId: string): Promise<PastWork[]> {
  const row = await http<ApiProvider | null>(`${DIRECTORY}/providers/${encodeURIComponent(providerId)}`);
  return (row?.portfolio || []).map((w, i) => adaptPastWork(providerId, w, i));
}

/** No global recent-work endpoint in the contract; live mode returns none for now. */
export function getRecentWork(_limit = 4): Promise<PastWork[]> {
  return Promise.resolve([]);
}

/** Reviews come embedded in the provider detail (`reviews`). */
export async function getProviderReviews(providerId: string, limit?: number): Promise<import('../../types').Review[]> {
  const row = await http<ApiProvider | null>(`${DIRECTORY}/providers/${encodeURIComponent(providerId)}`);
  const list = (row?.reviews || []).map((r) => ({ ...adaptReview(r), providerId }));
  return limit ? list.slice(0, limit) : list;
}
