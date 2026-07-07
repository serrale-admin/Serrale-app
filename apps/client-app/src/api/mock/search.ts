import { CATS } from '../../data/mock';
import type { SearchSuggestion } from '../shared';
import { MIN_SUGGEST_LENGTH, SUGGEST_LIMIT } from '../serrale/search';
import { delay } from './client';

/**
 * Typeahead suggestions from the category ontology (mock for /search/suggest).
 * Returns the same `SearchSuggestion[]` shape as the real client. `signal` is
 * accepted for parity; the delay resolves regardless (callers ignore stale ones).
 */
export function searchSuggest(query: string, _signal?: AbortSignal): Promise<SearchSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_SUGGEST_LENGTH) return delay([]);
  const out: SearchSuggestion[] = CATS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.am.includes(query.trim()),
  )
    .slice(0, SUGGEST_LIMIT)
    .map((c) => ({ type: 'category', label: c.name, labelAm: c.am, categorySlug: c.id, providerCount: c.count }));
  return delay(out);
}
