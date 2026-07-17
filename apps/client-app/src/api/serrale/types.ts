/**
 * SERRALE Basic API response shapes (namespace /api/public-directory/*).
 *
 * The OTP shapes are exact per the contract. Category/Provider/list shapes are
 * modeled defensively (optional fields, common aliases) because the exact field
 * names live in the backend repo. ALL field access happens in `adapters.ts`, so
 * reconciling with the real contract is a localized edit there.
 */

export interface ApiOtpChallenge {
  challenge_id: string;
  expires_at: string;
  reused?: boolean;
  /** `review_code` = Play-review bypass (no SMS). Absent on older backends → treat as SMS. */
  delivery?: 'sms' | 'review_code';
  account?: {
    has_customer: boolean;
    has_provider: boolean;
    customer_profile_complete: boolean;
  };
}

export interface ApiOtpVerify {
  verified: boolean;
  verify_token: string;
}

/**
 * GET /public-directory/categories returns `{ counts }` only — a
 * `{ [category_slug]: activeProviderCount }` map (contract matrix §1). There is
 * no per-category object with name/icon/group on the wire; the app supplies all
 * presentation metadata locally (src/data/mock.ts). This alias exists only for
 * the counts envelope.
 */
export type ApiCategoryCounts = Record<string, number>;

/**
 * The REAL public provider row. `PUBLIC_FIELDS` on both `/providers` and
 * `/providers/:id` is exactly: id, full_name, phone, whatsapp, category_slug,
 * area, experience, bio, photo_url, created_at (+ distance_km in geo/nearby
 * mode). The backend has NO rating/review/verified/available_today/price/
 * portfolio/reviews columns — see contract matrix M-3. Do not add fabricated
 * fields here.
 */
export interface ApiProvider {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  category_slug?: string | null;
  area?: string | null;
  experience?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  created_at?: string | null;
  /** Only present in GPS/nearby mode. */
  distance_km?: number | null;
  /** individual | business — added with engagement_types (engagement-model Phase 2). */
  provider_type?: 'individual' | 'business' | null;
  /** Subset of {temporary, permanent} — what engagement lengths this provider accepts. */
  engagement_types?: ('temporary' | 'permanent')[] | null;
  /** Published review average — null/absent when none. */
  avg_rating?: number | null;
  /** Published review count — 0 when none. */
  review_count?: number | null;
}

/**
 * Provider list envelope from `/providers` and `/search`:
 * `{ providers, total, limit, offset, nearby }` (contract matrix §1). The
 * optional aliases keep the adapter defensive against minor shape drift.
 */
export interface ApiListPayload<T> {
  providers?: T[];
  items?: T[];
  results?: T[];
  data?: T[];
  total?: number;
  count?: number;
  limit?: number;
  offset?: number;
  nearby?: boolean;
}

export interface ApiSessionCustomer {
  id: string;
  phone: string;
  phone_verified: boolean;
  status: string;
  client_type?: 'individual' | 'company' | null;
  display_name?: string | null;
  company_name?: string | null;
  area_slug?: string | null;
  id_number?: string | null;
  id_document_url?: string | null;
  business_license_number?: string | null;
  business_license_url?: string | null;
  profile_complete?: boolean;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
}

export type ApiCustomerProfile = ApiSessionCustomer;

export interface ApiLinkedProviderSummary {
  id: string;
  full_name: string;
  area?: string | null;
  photo_url?: string | null;
  category_slug?: string | null;
}

export interface ApiSessionExchange {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  customer: ApiSessionCustomer;
  account?: ApiOtpChallenge['account'];
  linked_provider?: ApiLinkedProviderSummary | null;
  /** Co-issued when the phone owns a provider listing — same OTP, no /providers/login round-trip. */
  provider_session?: ApiProviderSessionResult | null;
}

export interface ApiSessionRefresh {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
}

export interface ApiProviderSessionProvider {
  id: string;
  full_name: string;
  phone: string;
  category_slug: string;
  area?: string | null;
  whatsapp?: string | null;
  experience?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  status?: string | null;
  created_at?: string | null;
  provider_type?: 'individual' | 'business' | null;
  engagement_types?: ('temporary' | 'permanent')[] | null;
}

/** GET/PATCH /providers/me response row. */
export interface ApiProviderAccount extends ApiProviderSessionProvider {
  phone_verified?: boolean;
  national_id_number?: string | null;
  kyc_status?: 'pending' | 'submitted' | 'verified' | 'rejected';
}

export interface ApiProviderSessionResult {
  provider: ApiProviderSessionProvider;
  session_token: string;
}

