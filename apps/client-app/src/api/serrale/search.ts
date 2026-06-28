import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';

/** Typeahead suggestions for GET /search/suggest. Tolerates string[] or {label}[]. */
export async function searchSuggest(query: string): Promise<string[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await http<(string | { label?: string; text?: string; name?: string })[]>(
    `${DIRECTORY}/search/suggest`,
    { query: { q } },
  );
  return (rows || [])
    .map((r) => (typeof r === 'string' ? r : r.label || r.text || r.name || ''))
    .filter(Boolean)
    .slice(0, 6);
}
