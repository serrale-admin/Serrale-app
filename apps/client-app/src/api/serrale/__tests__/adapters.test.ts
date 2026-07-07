import { adaptCategory, adaptProvider, toProviderPage } from '../adapters';
import type { ApiProvider } from '../types';

/** A realistic live row — exactly the PUBLIC_FIELDS the backend returns (M-3). */
const LIVE_ROW: ApiProvider = {
  id: '318d4b90-0000-4000-8000-000000000001',
  full_name: 'Abenezer',
  phone: '+251985306704',
  whatsapp: null,
  category_slug: 'car-mechanics',
  area: 'Yeka',
  experience: '5',
  bio: null,
  photo_url: 'https://example.com/p.jpg',
  created_at: '2026-06-19T00:00:00Z',
};

describe('adaptProvider (honest M-3 mapping)', () => {
  it('never fabricates rating/review/verification/availability/past-work data', () => {
    const p = adaptProvider(LIVE_ROW);
    expect(p.rating).toBe(0);
    expect(p.reviewCount).toBe(0);
    expect(p.verified).toBe(false);
    expect(p.availableToday).toBe(false);
    expect(p.hasPastWork).toBe(false);
    // Being publicly listed IS the real admin-review signal.
    expect(p.adminReviewed).toBe(true);
  });

  it('maps the real row fields', () => {
    const p = adaptProvider(LIVE_ROW);
    expect(p.id).toBe(LIVE_ROW.id);
    expect(p.name).toBe('Abenezer');
    expect(p.categoryId).toBe('car-mechanics');
    expect(p.service).toBe('Car Mechanics'); // presentation label for the slug
    expect(p.area).toBe('Yeka');
    expect(p.exp).toBe(5); // parsed from experience string
    expect(p.phone).toBe('+251985306704');
    expect(p.imageUrl).toBe('https://example.com/p.jpg');
    expect(p.description).toBe('');
  });

  it('falls back gracefully for null/missing fields and unknown slugs', () => {
    const p = adaptProvider({ id: 'x', category_slug: 'brand-new-trade' });
    expect(p.name).toBe('Provider');
    expect(p.service).toBe('Brand New Trade'); // Title Case from slug
    expect(p.area).toBe('Addis Ababa');
    expect(p.exp).toBe(0);
  });

  it('uses whatsapp as the phone fallback and vice versa', () => {
    const waOnly = adaptProvider({ id: 'x', whatsapp: '+251900000001' });
    expect(waOnly.phone).toBe('+251900000001');
    const phoneOnly = adaptProvider({ id: 'y', phone: '+251900000002', whatsapp: null });
    expect(phoneOnly.whatsapp).toBe('+251900000002');
  });
});

describe('adaptCategory (graceful unknown-slug fallback)', () => {
  it('resolves known ontology slugs to local presentation metadata', () => {
    const c = adaptCategory('plumbers', 7);
    expect(c.id).toBe('plumbers');
    expect(c.name).toBe('Plumbers');
    expect(c.am).toBe('ቧንቧ ሰራተኞች');
    expect(c.count).toBe(7);
    expect(c.group).toBe('Home Services');
    expect(c.subs.length).toBeGreaterThan(0);
  });

  it('renders unknown backend slugs instead of hiding them', () => {
    const c = adaptCategory('solar-installers', 3);
    expect(c.id).toBe('solar-installers');
    expect(c.name).toBe('Solar Installers');
    expect(c.icon).toBe('ph-squares-four');
    expect(c.group).toBe('Services');
    expect(c.count).toBe(3);
  });
});

describe('toProviderPage (limit/offset envelope — M-5)', () => {
  const rows = (n: number): ApiProvider[] =>
    Array.from({ length: n }, (_, i) => ({ ...LIVE_ROW, id: `row-${i}` }));

  it('computes hasMore from the backend total/limit/offset', () => {
    const page0 = toProviderPage({ providers: rows(20), total: 23, limit: 20, offset: 0 }, 0);
    expect(page0.items).toHaveLength(20);
    expect(page0.total).toBe(23);
    expect(page0.hasMore).toBe(true);

    const page1 = toProviderPage({ providers: rows(3), total: 23, limit: 20, offset: 20 }, 1);
    expect(page1.items).toHaveLength(3);
    expect(page1.hasMore).toBe(false);
  });

  it('handles a bare array payload', () => {
    const page = toProviderPage(rows(2), 0);
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(2);
    expect(page.hasMore).toBe(false);
  });

  it('tolerates alias envelopes (items/results/data)', () => {
    expect(toProviderPage({ items: rows(1), total: 1 }, 0).items).toHaveLength(1);
    expect(toProviderPage({ results: rows(1), total: 1 }, 0).items).toHaveLength(1);
    expect(toProviderPage({ data: rows(1), total: 1 }, 0).items).toHaveLength(1);
  });
});
