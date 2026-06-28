import { GROUP_NAMES } from '../../data/mock';
import { DIRECTORY } from '../../lib/env';
import { http } from '../../lib/http';
import type { Category } from '../../types';
import type { CategoryGroup } from '../shared';
import { adaptCategory } from './adapters';
import type { ApiCategory } from './types';

export async function getCategories(): Promise<Category[]> {
  const rows = await http<ApiCategory[]>(`${DIRECTORY}/categories`);
  return (rows || []).map(adaptCategory);
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
