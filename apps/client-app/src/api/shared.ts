import type { Category } from '../types';

export const PAGE_SIZE = 20;

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export function paginate<T>(all: T[], page: number, pageSize = PAGE_SIZE): Page<T> {
  const start = page * pageSize;
  const items = all.slice(start, start + pageSize);
  return { items, page, pageSize, total: all.length, hasMore: start + pageSize < all.length };
}

export interface CategoryGroup {
  name: string;
  items: Category[];
}

/** A search-assistance suggestion (adapted from GET /search/suggest). */
export interface SearchSuggestion {
  /** Backend classification: category | need | area | provider | fallback_request_help. */
  type: 'category' | 'need' | 'area' | 'provider' | 'fallback_request_help';
  label: string;
  labelAm?: string;
  /** Present for category/need rows — the ontology slug to open a category with. */
  categorySlug?: string;
  reason?: string;
  providerCount?: number;
}

/** OTP purposes supported by the backend. */
export type OtpPurpose =
  | 'directory_customer_request'
  | 'directory_customer_login'
  | 'directory_provider_join'
  | 'directory_provider_login'
  | 'directory_provider_phone_change';

/** Matches backend otp/request `delivery` — review_code means no SMS was sent. */
export type OtpDelivery = 'sms' | 'review_code';

export interface OtpChallenge {
  challengeId: string;
  expiresAt: string;
  reused?: boolean;
  delivery?: OtpDelivery;
  account?: {
    has_customer: boolean;
    has_provider: boolean;
    customer_profile_complete: boolean;
  };
}

export interface VerifyResult {
  verified: true;
  verifyToken: string;
}

/**
 * The HONEST result of POST /leads/request. The backend returns
 * `{ ok, duplicate, customer, session_token? }` — it never returns an `id`,
 * `status`, or `created_at` (contract matrix M-1), so we do not synthesize them.
 * `duplicate` is true when the same request was already recorded; on the
 * authenticated Bearer + Idempotency-Key path a replayed submission additionally
 * sets `idempotentReplay`.
 */
export interface CreatedRequest {
  ok: true;
  duplicate: boolean;
  idempotentReplay?: boolean;
}
