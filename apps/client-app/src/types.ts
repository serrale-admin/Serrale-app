export type Lang = 'en' | 'am';

export type PriceLevel = 'Budget' | 'Standard' | 'Premium';

export interface Category {
  id: string;
  name: string;
  am: string;
  icon: string;
  count: number;
  group: string;
  subs: string[];
}

export interface Provider {
  id: string;
  name: string;
  service: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  area: string;
  verified: boolean;
  adminReviewed: boolean;
  availableToday: boolean;
  hasPastWork: boolean;
  exp: number;
  price: PriceLevel;
  description: string;
  phone: string;
  whatsapp?: string;
  imageUrl?: string;
}

export interface Review {
  providerId: string;
  userName: string;
  area: string;
  rating: number;
  text: string;
}

export interface PastWork {
  providerId: string;
  title: string;
  category: string;
  area: string;
  icon: string;
  bg: string;
  note: string;
}

export interface Filters {
  areas: string[];
  avail: string[];
  trust: string[];
  rating: string;
  contact: string[];
  price: string[];
  exp: string[];
}

/** Service request payload (mirrors service_requests in the spec). */
export interface ServiceRequest {
  categoryId: string;
  area: string;
  description: string;
  when: string;
  budget: string;
  preferredContact: string;
}

/** Sort options for provider lists. */
export type SortKey = 'Recommended' | 'Rating' | 'Nearest' | 'Recently added';

export interface ProviderQuery {
  search?: string;
  categoryId?: string;
  area?: string;
  filters?: Filters;
  sort?: SortKey;
}
