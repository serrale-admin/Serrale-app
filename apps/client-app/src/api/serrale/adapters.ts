import { CATS } from '../../data/mock';
import type { Category, Provider } from '../../types';
import { Page, PAGE_SIZE } from '../shared';
import type { ApiProvider } from './types';

/**
 * Local presentation metadata (Phosphor icon, group, sub-services, Amharic name,
 * default count) keyed by the backend ontology slug. The backend supplies only
 * counts (GET /categories) and `category_slug` (on providers); the app supplies
 * its own iconography/grouping/labels. Unknown slugs fall back gracefully.
 */
const PRESENTATION = new Map<string, { name: string; am: string; icon: string; group: string; subs: string[] }>();
for (const c of CATS) {
  const meta = { name: c.name, am: c.am, icon: c.icon, group: c.group, subs: c.subs };
  PRESENTATION.set(c.id, meta);
  PRESENTATION.set(c.name.toLowerCase(), meta);
}

/** Presentation metadata for a slug, or undefined when the slug is unknown. */
export function presentationForSlug(slug?: string): { name: string; am: string; icon: string; group: string; subs: string[] } | undefined {
  return slug ? PRESENTATION.get(slug.toLowerCase()) : undefined;
}

/**
 * Builds a presentation `Category` for a backend ontology slug + its live count.
 * Unknown slugs (present in the DB but not in the local ontology snapshot) still
 * render — a Title-Cased name derived from the slug, a neutral icon, and the
 * "Services" group — so a backend that adds a slug never breaks the UI.
 */
export function adaptCategory(slug: string, count: number): Category {
  const pres = presentationForSlug(slug);
  return {
    id: slug,
    name: pres?.name || titleFromSlug(slug),
    am: pres?.am || pres?.name || titleFromSlug(slug),
    icon: pres?.icon || 'ph-squares-four',
    count,
    group: pres?.group || 'Services',
    subs: pres?.subs || [],
  };
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Adapts the REAL public provider row into the app `Provider`. Fields the
 * backend does not expose (rating, reviews, verified, availableToday, price,
 * portfolio) are NOT fabricated (contract matrix M-3):
 *   - rating/reviewCount default to 0 → the UI hides rating chrome when 0,
 *   - verified/availableToday/hasPastWork default to false,
 *   - price defaults to 'Standard' (a neutral label, never shown as a real tier),
 *   - `adminReviewed` is true because appearing in the public list already means
 *     the provider passed admin review server-side (that IS a real signal).
 */
export function adaptProvider(api: ApiProvider): Provider {
  const experience = Number.parseInt(String(api.experience || '').replace(/[^0-9]/g, ''), 10) || 0;
  const service = presentationForSlug(api.category_slug || undefined)?.name
    || (api.category_slug ? titleFromSlug(api.category_slug) : 'Service');

  return {
    id: api.id,
    name: api.full_name || 'Provider',
    service,
    categoryId: api.category_slug || '',
    rating: 0,
    reviewCount: 0,
    area: api.area || 'Addis Ababa',
    verified: false,
    adminReviewed: true,
    availableToday: false,
    hasPastWork: false,
    exp: experience,
    price: 'Standard',
    description: api.bio || '',
    phone: api.phone || api.whatsapp || '',
    whatsapp: api.whatsapp || api.phone || undefined,
    imageUrl: api.photo_url || undefined,
    providerType: api.provider_type || undefined,
    engagementTypes: api.engagement_types || undefined,
  };
}

/**
 * Normalizes the `{ providers, total, limit, offset }` list envelope (or a bare
 * array) into a `Page<Provider>`. `hasMore` is computed from the backend's real
 * `total`/`offset`/`limit` so it stays correct even though the app's logical
 * "page" maps to a limit/offset window server-side (contract matrix M-5).
 */
export function toProviderPage(payload: ApiProvider[] | import('./types').ApiListPayload<ApiProvider>, page: number): Page<Provider> {
  const isArray = Array.isArray(payload);
  const rows = isArray ? payload : payload.providers || payload.items || payload.results || payload.data || [];
  const items = rows.map(adaptProvider);
  const total = isArray ? rows.length : payload.total ?? payload.count ?? rows.length;
  const limit = !isArray && typeof payload.limit === 'number' ? payload.limit : PAGE_SIZE;
  const offset = !isArray && typeof payload.offset === 'number' ? payload.offset : page * PAGE_SIZE;
  const hasMore = offset + rows.length < total;
  return { items, page, pageSize: limit, total, hasMore };
}
