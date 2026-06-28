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

/** OTP purposes supported by the backend (only the customer one is used here). */
export type OtpPurpose =
  | 'directory_customer_request'
  | 'directory_provider_join'
  | 'directory_provider_login'
  | 'directory_provider_phone_change';

export interface OtpChallenge {
  challengeId: string;
  expiresAt: string;
  reused?: boolean;
}

export interface VerifyResult {
  verified: true;
  verifyToken: string;
}

export interface CreatedRequest {
  id: string;
  status: string;
  createdAt: string;
}
