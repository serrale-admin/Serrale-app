import {
  getNearbyProviders,
  getProviderPastWork,
  getProviderReviews,
  getProviders,
  getReviewEligibility,
  getVerifiedProviders,
} from '../providers';
import { getCategories } from '../categories';
import { http, HttpError } from '../../../lib/http';
import { AREA_ALL } from '../../../data/mock';
import type { Filters } from '../../../types';

jest.mock('../../../lib/http', () => ({
  ...jest.requireActual('../../../lib/http'),
  http: jest.fn(),
  __esModule: true,
}));

const mockHttp = http as jest.MockedFunction<typeof http>;

const emptyFilters = (): Filters => ({
  areas: [],
  avail: [],
  trust: [],
  rating: 'Any',
  contact: [],
  price: [],
  exp: [],
  engagement: '',
});

beforeEach(() => {
  mockHttp.mockReset();
  mockHttp.mockResolvedValue({ providers: [], total: 0, limit: 20, offset: 0 } as never);
});

describe('getProviders — only backend-supported params (M-4/M-5)', () => {
  it('sends limit/offset (never page/page_size) with page size 20', async () => {
    await getProviders({}, 0);
    const [path, opts] = mockHttp.mock.calls[0];
    expect(path).toBe('/public-directory/providers');
    expect(opts?.query).toEqual({ limit: 20, offset: 0 });
  });

  it('maps logical page N to offset N*20', async () => {
    await getProviders({}, 2);
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 20, offset: 40 });
  });

  it('sends category and a single area', async () => {
    await getProviders({ categoryId: 'plumbers', area: 'Bole' });
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 20, offset: 0, category: 'plumbers', area: 'Bole' });
  });

  it('omits area entirely for the city-wide sentinel', async () => {
    await getProviders({ area: AREA_ALL });
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 20, offset: 0 });
  });

  it('prefers the explicit area filter over the ambient area', async () => {
    const filters = { ...emptyFilters(), areas: ['Yeka'] };
    await getProviders({ area: 'Bole', filters });
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 20, offset: 0, area: 'Yeka' });
  });

  it('routes free-text search to /search with q', async () => {
    await getProviders({ search: 'water leak' }, 1);
    const [path, opts] = mockHttp.mock.calls[0];
    expect(path).toBe('/public-directory/search');
    expect(opts?.query).toEqual({ limit: 20, offset: 20, q: 'water leak' });
  });

  it('never sends unsupported filter/sort params, even with a full filter state', async () => {
    const filters: Filters = {
      areas: ['Bole'],
      avail: ['Available today'],
      trust: ['Verified only', 'Has past work'],
      rating: '4.5+',
      contact: ['WhatsApp available'],
      price: ['Budget'],
      exp: ['5+ years'],
      engagement: '',
    };
    await getProviders({ filters, sort: 'Rating' });
    const query = mockHttp.mock.calls[0][1]?.query || {};
    expect(Object.keys(query).sort()).toEqual(['area', 'limit', 'offset']);
  });

  it('sends engagement when set in filters', async () => {
    const filters = { ...emptyFilters(), engagement: 'temporary' };
    await getProviders({ filters });
    const query = mockHttp.mock.calls[0][1]?.query || {};
    expect(Object.keys(query).sort()).toEqual(['engagement', 'limit', 'offset']);
    expect(query.engagement).toBe('temporary');
  });

  it('omits engagement when not set', async () => {
    await getProviders({ filters: emptyFilters() });
    const query = mockHttp.mock.calls[0][1]?.query || {};
    expect(query).not.toHaveProperty('engagement');
  });
});

describe('rails and detail-embedded resources', () => {
  it('getVerifiedProviders sends no illusory verified param', async () => {
    await getVerifiedProviders(3);
    const [path, opts] = mockHttp.mock.calls[0];
    expect(path).toBe('/public-directory/providers');
    expect(opts?.query).toEqual({ limit: 3, offset: 0 });
  });

  it('getVerifiedProviders forwards engagement when set', async () => {
    await getVerifiedProviders(3, 'permanent');
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 3, offset: 0, engagement: 'permanent' });
  });

  it('getNearbyProviders sends area only when not city-wide', async () => {
    await getNearbyProviders('Bole', 5);
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 5, offset: 0, area: 'Bole' });

    mockHttp.mockClear();
    mockHttp.mockResolvedValue({ providers: [], total: 0 } as never);
    await getNearbyProviders(AREA_ALL, 5);
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({ limit: 5, offset: 0 });
  });

  it('getNearbyProviders forwards engagement when set', async () => {
    await getNearbyProviders('Bole', 5, 'temporary');
    expect(mockHttp.mock.calls[0][1]?.query).toEqual({
      limit: 5,
      offset: 0,
      area: 'Bole',
      engagement: 'temporary',
    });
  });

  it('past work resolves empty WITHOUT a network call; reviews hit the live endpoint', async () => {
    await expect(getProviderPastWork('some-id')).resolves.toEqual([]);
    expect(mockHttp).not.toHaveBeenCalled();

    mockHttp.mockResolvedValue({ reviews: [], total: 0 } as never);
    await expect(getProviderReviews('some-id')).resolves.toEqual([]);
    expect(mockHttp).toHaveBeenCalledWith(
      '/public-directory/providers/some-id/reviews',
      expect.objectContaining({ query: { limit: 20, offset: 0 } }),
    );
  });
});

describe('getReviewEligibility — status whitelist', () => {
  it('passes through eligible / need_login / already_rated / need_contact', async () => {
    for (const status of ['eligible', 'need_login', 'already_rated', 'need_contact'] as const) {
      mockHttp.mockResolvedValueOnce({ status, existing_rating: null } as never);
      await expect(getReviewEligibility('p1')).resolves.toEqual({
        status,
        existing_rating: null,
      });
    }
  });

  it('collapses an unrecognized status to eligible rather than discarding it silently as need_login', async () => {
    mockHttp.mockResolvedValueOnce({ status: 'some_future_status' } as never);
    await expect(getReviewEligibility('p1')).resolves.toEqual({
      status: 'eligible',
      existing_rating: null,
    });
  });

  it('soft-fails to eligible (never need_login) on network/5xx/404/429', async () => {
    mockHttp.mockRejectedValueOnce(new HttpError(500, 'boom'));
    await expect(getReviewEligibility('p1')).resolves.toEqual({ status: 'eligible' });

    mockHttp.mockRejectedValueOnce(new HttpError(404, 'missing'));
    await expect(getReviewEligibility('p1')).resolves.toEqual({ status: 'eligible' });

    mockHttp.mockRejectedValueOnce(new HttpError(429, 'slow down'));
    await expect(getReviewEligibility('p1')).resolves.toEqual({ status: 'eligible' });
  });
});

describe('getCategories — { counts } envelope (live counts flow)', () => {
  it('merges live counts into the 24-slug ontology list and zero-fills the rest', async () => {
    mockHttp.mockResolvedValue({ counts: { plumbers: 4, 'car-mechanics': 1 } } as never);
    const cats = await getCategories();
    expect(cats).toHaveLength(24);
    expect(cats.find((c) => c.id === 'plumbers')?.count).toBe(4);
    expect(cats.find((c) => c.id === 'car-mechanics')?.count).toBe(1);
    expect(cats.find((c) => c.id === 'welders')?.count).toBe(0);
  });

  it('appends unknown backend slugs via the graceful fallback', async () => {
    mockHttp.mockResolvedValue({ counts: { 'solar-installers': 2 } } as never);
    const cats = await getCategories();
    expect(cats).toHaveLength(25);
    const extra = cats.find((c) => c.id === 'solar-installers');
    expect(extra?.name).toBe('Solar Installers');
    expect(extra?.count).toBe(2);
  });

  it('tolerates a missing counts map', async () => {
    mockHttp.mockResolvedValue({} as never);
    const cats = await getCategories();
    expect(cats).toHaveLength(24);
    expect(cats.every((c) => c.count === 0)).toBe(true);
  });
});
