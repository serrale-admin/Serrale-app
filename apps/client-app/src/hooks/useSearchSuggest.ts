import { useEffect, useRef, useState } from 'react';
import * as api from '../api';
import { MIN_SUGGEST_LENGTH } from '../api';
import type { SearchSuggestion } from '../api';

/** Debounce before a suggest request goes out (per the search-assistance spec). */
export const SUGGEST_DEBOUNCE_MS = 300;

/** How long a cached suggestion set stays fresh. Brief by design. */
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 30;

const cache = new Map<string, { at: number; items: SearchSuggestion[] }>();

function readCache(key: string): SearchSuggestion[] | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit.items;
}

function writeCache(key: string, items: SearchSuggestion[]) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), items });
}

/** Test hook: empties the module-level suggestion cache. */
export function __clearSuggestCache() {
  cache.clear();
}

/**
 * Debounced, cancellable typeahead against GET /search/suggest.
 *
 * Guarantees:
 *  - a request fires only after `SUGGEST_DEBOUNCE_MS` of typing silence and only
 *    for queries of at least MIN_SUGGEST_LENGTH characters;
 *  - changing the query aborts the in-flight request (AbortController — the
 *    http layer propagates the signal) and invalidates its result, so
 *    suggestions for query A can NEVER render once the query is B;
 *  - results are cached briefly (per normalized query) so backspacing to a
 *    recent query re-renders instantly without a network call;
 *  - `loading` is true only while a fetch for the CURRENT query is pending.
 */
export function useSearchSuggest(query: string): { suggestions: SearchSuggestion[]; loading: boolean } {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();

    // The query changed: whatever was in flight is now for a stale query.
    abortRef.current?.abort();
    abortRef.current = null;

    if (q.length < MIN_SUGGEST_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const cached = readCache(q);
    if (cached) {
      setSuggestions(cached);
      setLoading(false);
      return;
    }

    // Fresh fetch for a new query: clear the previous query's suggestions
    // immediately (never show stale rows under a different query) and debounce.
    setSuggestions([]);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(() => {
      api
        .searchSuggest(q, controller.signal)
        .then((items) => {
          if (controller.signal.aborted) return; // superseded by a newer query
          writeCache(q, items);
          setSuggestions(items);
          setLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          // Suggestion failures are silent: assistance is best-effort and the
          // user can always just submit the search.
          setSuggestions([]);
          setLoading(false);
        });
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, loading };
}
