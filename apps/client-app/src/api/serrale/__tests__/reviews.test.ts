import { adaptProvider } from '../adapters';
import type { ApiProvider } from '../types';

jest.mock('../../../lib/http', () => ({
  http: jest.fn(),
  HttpError: class HttpError extends Error {
    status: number;
    code?: string;
    constructor(status: number, message: string, code?: string) {
      super(message);
      this.status = status;
      this.code = code;
      this.name = 'HttpError';
    }
  },
}));

import { http, HttpError } from '../../../lib/http';
import { getProviderReviews, getReviewEligibility, submitProviderReview } from '../providers';

const mockHttp = http as jest.MockedFunction<typeof http>;

describe('adaptProvider ratings', () => {
  const base: ApiProvider = {
    id: 'p1',
    full_name: 'Abebe',
    category_slug: 'nanny',
    area: 'Bole',
  };

  it('hides rating when review_count is 0', () => {
    const p = adaptProvider({ ...base, avg_rating: 5, review_count: 0 });
    expect(p.rating).toBe(0);
    expect(p.reviewCount).toBe(0);
  });

  it('maps avg_rating and review_count when present', () => {
    const p = adaptProvider({ ...base, avg_rating: 4.5, review_count: 3 });
    expect(p.rating).toBe(4.5);
    expect(p.reviewCount).toBe(3);
  });
});

describe('provider reviews API', () => {
  beforeEach(() => {
    mockHttp.mockReset();
  });

  it('maps published reviews', async () => {
    mockHttp.mockResolvedValue({
      reviews: [
        { id: 'r1', rating: 5, comment: 'Great', display_name: 'Sara', created_at: '2026-07-17T00:00:00Z' },
      ],
      total: 1,
    } as never);
    const rows = await getProviderReviews('prov-1', 10);
    expect(rows).toEqual([
      { providerId: 'prov-1', userName: 'Sara', area: '', rating: 5, text: 'Great' },
    ]);
  });

  it('soft-fails reviews list on 404', async () => {
    mockHttp.mockRejectedValue(new HttpError(404, 'missing'));
    await expect(getProviderReviews('prov-1')).resolves.toEqual([]);
  });

  it('maps eligibility', async () => {
    mockHttp.mockResolvedValue({ status: 'eligible', contact_event_id: 'c1' } as never);
    await expect(getReviewEligibility('prov-1')).resolves.toEqual({
      status: 'eligible',
      existing_rating: null,
      contact_event_id: 'c1',
    });
  });

  it('submits a review', async () => {
    mockHttp.mockResolvedValue({
      review: { rating: 4, comment: 'ok', display_name: 'You' },
      avg_rating: 4,
      review_count: 1,
    } as never);
    const res = await submitProviderReview('prov-1', { rating: 4, comment: 'ok' });
    expect(res.review_count).toBe(1);
    expect(res.review.rating).toBe(4);
    expect(mockHttp).toHaveBeenCalledWith(
      '/public-directory/providers/prov-1/reviews',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
