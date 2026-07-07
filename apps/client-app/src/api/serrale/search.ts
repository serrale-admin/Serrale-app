import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import type { SearchSuggestion } from '../shared';

/** Backend `SearchSuggestion` row shape (publicDirectorySearch.service.ts). */
interface ApiSuggestion {
  type?: string;
  label?: string;
  label_am?: string;
  slug?: string;
  categorySlug?: string;
  reason?: string;
  providerCount?: number;
}

/** GET /search/suggest envelope data: an OBJECT (contract matrix M-7), not an array. */
interface SuggestPayload {
  query?: string;
  normalizedQuery?: string;
  suggestions?: ApiSuggestion[];
}

/** Minimum query length worth suggesting on. Below this, suggest returns []. */
export const MIN_SUGGEST_LENGTH = 2;

/** Max suggestions surfaced (matches the search-assistance spec). */
export const SUGGEST_LIMIT = 6;

/**
 * Typeahead suggestions for GET /search/suggest. The backend returns
 * `{ query, normalizedQuery, suggestions: [...] }` — an object whose
 * `suggestions` array we adapt (the old code called `.map` on the object and
 * would have thrown at runtime — M-7). Supports cancellation via `signal`.
 */
export async function searchSuggest(query: string, signal?: AbortSignal): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (q.length < MIN_SUGGEST_LENGTH) return [];

  const payload = await http<SuggestPayload>(`${DIRECTORY}/search/suggest`, { query: { q }, signal });
  const rows = payload?.suggestions || [];

  return rows
    .map((r): SearchSuggestion | null => {
      const label = (r.label || '').trim();
      if (!label) return null;
      return {
        type: (r.type as SearchSuggestion['type']) || 'need',
        label,
        labelAm: r.label_am,
        categorySlug: r.categorySlug || r.slug,
        reason: r.reason,
        providerCount: r.providerCount,
      };
    })
    .filter((s): s is SearchSuggestion => s !== null)
    .slice(0, SUGGEST_LIMIT);
}
