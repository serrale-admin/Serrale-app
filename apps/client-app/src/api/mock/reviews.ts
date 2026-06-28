import { REVIEWS } from '../../data/mock';
import type { Review } from '../../types';
import { delay } from './client';

export function getProviderReviews(providerId: string, limit?: number): Promise<Review[]> {
  const list = REVIEWS.filter((r) => r.providerId === providerId);
  return delay(limit ? list.slice(0, limit) : list);
}
