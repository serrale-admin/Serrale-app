import { CATS, GROUP_NAMES } from '../../data/mock';
import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import type { Category } from '../../types';
import type { CategoryGroup } from '../shared';
import { adaptCategory } from './adapters';
import type { ApiCategoryCounts } from './types';

/** GET /categories envelope: `{ data: { counts: { [slug]: count } } }`. */
interface CategoryCountsPayload {
  counts?: ApiCategoryCounts;
}

/**
 * Fetches live per-slug provider counts and merges them into the ontology-aligned
 * presentation list. The 24 local slugs are always present (in ontology order);
 * any extra slug the backend reports that we do not know locally is appended via
 * the graceful `adaptCategory` fallback so nothing live is hidden.
 */
export async function getCategories(): Promise<Category[]> {
  const payload = await http<CategoryCountsPayload>(`${DIRECTORY}/categories`);
  const counts = payload?.counts || {};

  const known = CATS.map((c) => ({ ...c, count: counts[c.id] ?? 0 }));
  const knownSlugs = new Set(known.map((c) => c.id));
  const extras = Object.keys(counts)
    .filter((slug) => !knownSlugs.has(slug))
    .map((slug) => adaptCategory(slug, counts[slug]));

  return [...known, ...extras];
}

export async function getCategory(id: string): Promise<Category | undefined> {
  const all = await getCategories();
  return all.find((c) => c.id === id);
}

export async function getCategoryGroups(query = ''): Promise<CategoryGroup[]> {
  const q = query.trim().toLowerCase();
  const all = (await getCategories()).filter((c) => !q || c.name.toLowerCase().includes(q));
  const known = GROUP_NAMES.map((name) => ({ name, items: all.filter((c) => c.group === name) }));
  const other = all.filter((c) => !GROUP_NAMES.includes(c.group));
  if (other.length) known.push({ name: 'More', items: other });
  return known.filter((g) => g.items.length > 0);
}
