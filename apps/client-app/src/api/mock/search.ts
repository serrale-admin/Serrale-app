import { CATS, PROV } from '../../data/mock';
import { delay } from './client';

/** Typeahead suggestions from category + provider names (mock for /search/suggest). */
export function searchSuggest(query: string): Promise<string[]> {
  const q = query.trim().toLowerCase();
  if (!q) return delay([]);
  const out = new Set<string>();
  for (const c of CATS) if (c.name.toLowerCase().includes(q)) out.add(c.name);
  for (const p of PROV) {
    if (p.service.toLowerCase().includes(q)) out.add(p.service);
    if (p.name.toLowerCase().includes(q)) out.add(p.name);
  }
  return delay(Array.from(out).slice(0, 6));
}
