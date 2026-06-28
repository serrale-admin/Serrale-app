/**
 * Mock API client.
 *
 * This module stands in for `packages/api` from the technical spec. Every export
 * returns a Promise with simulated latency so screens consume it exactly as they
 * would a real Supabase-backed layer. Swapping to Supabase later means replacing
 * the bodies in this `api/` folder only — screens and React Query hooks stay the
 * same.
 */

export const PAGE_SIZE = 20;

/** Simulated network latency. */
export function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

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
  return {
    items,
    page,
    pageSize,
    total: all.length,
    hasMore: start + pageSize < all.length,
  };
}
