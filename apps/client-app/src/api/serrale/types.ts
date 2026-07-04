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
}

export interface ApiOtpVerify {
  verified: boolean;
  verify_token: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
  icon_url?: string | null;
  group?: string;
  provider_count?: number;
  count?: number;
}

export interface ApiProviderCategory {
  id?: string;
  name?: string;
  slug?: string;
}

export interface ApiPastWork {
  id?: string;
  title?: string;
  caption?: string;
  note?: string;
  category?: string;
  area?: string;
  location_text?: string;
  image_url?: string;
}

export interface ApiReview {
  id?: string;
  user_name?: string;
  author?: string;
  area?: string;
  rating?: number;
  comment?: string;
  text?: string;
}

export interface ApiProvider {
  id: string;
  full_name?: string;
  business_name?: string;
  name?: string;
  category?: ApiProviderCategory;
  category_id?: string;
  category_slug?: string;
  category_name?: string;
  service?: string;
  rating?: number;
  review_count?: number;
  reviews_count?: number;
  location_text?: string;
  area?: string;
  sub_city?: string;
  verification_status?: string;
  is_verified?: boolean;
  verified?: boolean;
  admin_reviewed?: boolean;
  available_today?: boolean;
  has_past_work?: boolean;
  years_experience?: number;
  experience_years?: number;
  price_level?: string;
  price?: string;
  experience?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  photo_url?: string;
  image_url?: string;
  avatar_url?: string;
  portfolio?: ApiPastWork[];
  reviews?: ApiReview[];
}

/** Paginated list envelope (data may be a bare array OR an object with items+total). */
export interface ApiListPayload<T> {
  items?: T[];
  results?: T[];
  data?: T[];
  total?: number;
  count?: number;
  page?: number;
  page_size?: number;
  has_more?: boolean;
}

export interface ApiSessionCustomer {
  id: string;
  phone: string;
  phone_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
}

export interface ApiSessionExchange {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  customer: ApiSessionCustomer;
}

export interface ApiSessionRefresh {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
}

