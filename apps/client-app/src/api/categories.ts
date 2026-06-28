import { CATS, GROUP_NAMES } from '../data/mock';
import type { Category } from '../types';
import { delay } from './client';

export interface CategoryGroup {
  name: string;
  items: Category[];
}

export function getCategories(): Promise<Category[]> {
  return delay(CATS);
}

export function getCategory(id: string): Promise<Category | undefined> {
  return delay(CATS.find((c) => c.id === id));
}

/** Categories grouped by their section, optionally filtered by a search query. */
export function getCategoryGroups(query = ''): Promise<CategoryGroup[]> {
  const q = query.trim().toLowerCase();
  const groups = GROUP_NAMES.map((name) => ({
    name,
    items: CATS.filter((c) => c.group === name && (!q || c.name.toLowerCase().includes(q))),
  })).filter((g) => g.items.length > 0);
  return delay(groups);
}
