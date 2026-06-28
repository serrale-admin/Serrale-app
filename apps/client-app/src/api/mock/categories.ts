import { CATS, GROUP_NAMES } from '../../data/mock';
import type { Category } from '../../types';
import type { CategoryGroup } from '../shared';
import { delay } from './client';

export function getCategories(): Promise<Category[]> {
  return delay(CATS);
}

export function getCategory(id: string): Promise<Category | undefined> {
  return delay(CATS.find((c) => c.id === id));
}

export function getCategoryGroups(query = ''): Promise<CategoryGroup[]> {
  const q = query.trim().toLowerCase();
  const groups = GROUP_NAMES.map((name) => ({
    name,
    items: CATS.filter((c) => c.group === name && (!q || c.name.toLowerCase().includes(q))),
  })).filter((g) => g.items.length > 0);
  return delay(groups);
}
