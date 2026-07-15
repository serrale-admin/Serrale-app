import { locationDisplayName } from '../data/mock';
import type { Category } from '../types';
import type { Labels } from './labels';

/** Localized category title — same rule as Categories/Search tab cards. */
export function categoryLabel(category: Pick<Category, 'name' | 'am'>, useAmharic: boolean): string {
  return useAmharic ? category.am : category.name;
}

/** Localized service group heading — mirrors Categories tab filter chips. */
export function serviceGroupLabel(group: string, labels: Labels): string {
  if (group === 'Home Services') return labels.categories.homeServices;
  if (group === 'Repairs & Maintenance') return labels.categories.repairsMaintenance;
  if (group === 'Moving & Transport') return labels.categories.movingTransport;
  if (group === 'Health & Wellness') return labels.categories.healthWellness;
  return group;
}

/** Localized area name for display; stored/submitted value stays English `location.name`. */
export function areaLabel(areaName: string, useAmharic: boolean): string {
  return locationDisplayName(areaName, useAmharic);
}
