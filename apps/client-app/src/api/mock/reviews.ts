import { REVIEWS } from '../../data/mock';
import type { Review } from '../../types';
import { delay } from './client';
import type { ReviewEligibility, SubmitReviewResult } from '../serrale/providers';

const submitted = new Map<string, Review>();

export function getProviderReviews(providerId: string, limit?: number): Promise<Review[]> {
  const live = submitted.get(providerId);
  const list = [
    ...(live ? [live] : []),
    ...REVIEWS.filter((r) => r.providerId === providerId),
  ];
  return delay(limit ? list.slice(0, limit) : list);
}

export function getReviewEligibility(providerId: string): Promise<ReviewEligibility> {
  if (submitted.has(providerId)) {
    return delay({
      status: 'already_rated',
      existing_rating: submitted.get(providerId)!.rating,
    });
  }
  return delay({ status: 'eligible' });
}

export function submitProviderReview(
  providerId: string,
  input: { rating: number; comment?: string }
): Promise<SubmitReviewResult> {
  const review: Review = {
    providerId,
    userName: 'You',
    area: '',
    rating: input.rating,
    text: input.comment || '',
  };
  submitted.set(providerId, review);
  const all = REVIEWS.filter((r) => r.providerId === providerId).concat([review]);
  const review_count = all.length;
  const avg_rating =
    Math.round((all.reduce((s, r) => s + r.rating, 0) / review_count) * 100) / 100;
  return delay({ review, avg_rating, review_count });
}
