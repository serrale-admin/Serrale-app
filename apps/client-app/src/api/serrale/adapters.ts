import { CATS } from '../../data/mock';
import type { Category, PastWork, PriceLevel, Provider, Review } from '../../types';
import { Page, PAGE_SIZE } from '../shared';
import type { ApiCategory, ApiListPayload, ApiPastWork, ApiProvider, ApiReview } from './types';

/**
 * Local presentation metadata (Phosphor icon, group, sub-services, Amharic name)
 * keyed by category slug/id/name. The backend supplies real ids + counts; the app
 * supplies its own iconography/grouping. Unknown categories fall back gracefully.
 */
const PRESENTATION = new Map<string, { icon: string; group: string; subs: string[]; am: string }>();
for (const c of CATS) {
  const meta = { icon: c.icon, group: c.group, subs: c.subs, am: c.am };
  PRESENTATION.set(c.id, meta);
  PRESENTATION.set(c.name.toLowerCase(), meta);
}
const presFor = (...keys: (string | undefined)[]) => {
  for (const k of keys) {
    const hit = k && PRESENTATION.get(k.toLowerCase());
    if (hit) return hit;
  }
  return undefined;
};

const PAST_WORK_BG = ['#086246', '#064734', '#0b5a40', '#16875F'];

export function adaptCategory(api: ApiCategory): Category {
  const pres = presFor(api.slug, api.id, api.name);
  return {
    id: api.slug || api.id,
    name: api.name,
    am: pres?.am || api.name,
    icon: pres?.icon || 'ph-squares-four',
    count: api.provider_count ?? api.count ?? 0,
    group: api.group || pres?.group || 'Services',
    subs: pres?.subs || [],
  };
}

function adaptPrice(value?: string): PriceLevel {
  const v = (value || '').toLowerCase();
  if (v.includes('budget') || v.includes('low')) return 'Budget';
  if (v.includes('premium') || v.includes('high')) return 'Premium';
  return 'Standard';
}

export function adaptProvider(api: ApiProvider): Provider {
  const verified = api.verified ?? api.is_verified ?? ['approved', 'verified'].includes((api.verification_status || '').toLowerCase());
  const experience = typeof api.years_experience === 'number'
    ? api.years_experience
    : typeof api.experience_years === 'number'
      ? api.experience_years
      : Number.parseInt(String(api.experience || '').replace(/[^0-9]/g, ''), 10) || 0;

  return {
    id: api.id,
    name: api.full_name || api.business_name || api.name || 'Provider',
    service: api.service || api.category?.name || api.category_name || api.category_slug || 'Service',
    categoryId: api.category?.slug || api.category?.id || api.category_slug || api.category_id || '',
    rating: api.rating ?? 0,
    reviewCount: api.review_count ?? api.reviews_count ?? 0,
    area: api.area || api.location_text || api.sub_city || 'Addis Ababa',
    verified,
    adminReviewed: api.admin_reviewed ?? verified,
    availableToday: api.available_today ?? false,
    hasPastWork: api.has_past_work ?? (api.portfolio?.length ?? 0) > 0,
    exp: experience,
    price: adaptPrice(api.price_level || api.price),
    description: api.description || '',
    phone: api.phone || api.whatsapp || '',
    whatsapp: api.whatsapp || api.phone || undefined,
    imageUrl: api.photo_url || api.image_url || api.avatar_url || undefined,
  };
}

export function adaptPastWork(providerId: string, api: ApiPastWork, i: number): PastWork {
  return {
    providerId,
    title: api.title || api.caption || 'Past work',
    note: api.note || api.caption || '',
    category: api.category || '',
    area: api.area || api.location_text || '',
    icon: 'ph-image-square',
    bg: PAST_WORK_BG[i % PAST_WORK_BG.length],
  };
}

export function adaptReview(api: ApiReview): Review {
  return {
    providerId: '',
    userName: api.user_name || api.author || 'Customer',
    area: api.area || '',
    rating: api.rating ?? 5,
    text: api.text || api.comment || '',
  };
}

/** Normalizes either a bare array or an `{ items, total }` object into a Page<Provider>. */
export function toProviderPage(payload: ApiProvider[] | ApiListPayload<ApiProvider>, page: number): Page<Provider> {
  const rows = Array.isArray(payload) ? payload : payload.items || payload.results || payload.data || [];
  const items = rows.map(adaptProvider);
  const total = Array.isArray(payload) ? rows.length : payload.total ?? payload.count ?? rows.length;
  const hasMore = Array.isArray(payload)
    ? rows.length >= PAGE_SIZE
    : payload.has_more ?? (page + 1) * PAGE_SIZE < total;
  return { items, page, pageSize: PAGE_SIZE, total, hasMore };
}
