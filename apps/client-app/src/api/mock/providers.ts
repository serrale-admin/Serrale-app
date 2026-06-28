import { CATS, PASTWORK, PROV } from '../../data/mock';
import type { Filters, PastWork, Provider, ProviderQuery, SortKey } from '../../types';
import { Page, PAGE_SIZE, paginate } from '../shared';
import { delay } from './client';

const catName = (id: string): string => CATS.find((c) => c.id === id)?.name || '';

function matchesFilters(p: Provider, filters?: Filters): boolean {
  if (!filters) return true;
  const f = filters;
  if (f.areas.length && !f.areas.includes(p.area)) return false;
  if (f.avail.includes('Available today') && !p.availableToday) return false;
  if (f.trust.includes('Verified only') && !p.verified) return false;
  if (f.trust.includes('Admin reviewed') && !p.adminReviewed) return false;
  if (f.trust.includes('Has past work') && !p.hasPastWork) return false;
  if (f.rating === '4.5+' && p.rating < 4.5) return false;
  if (f.rating === '4.0+' && p.rating < 4.0) return false;
  if (f.price.length && !f.price.includes(p.price)) return false;
  if (f.exp.includes('5+ years') && p.exp < 5) return false;
  else if (f.exp.includes('3+ years') && p.exp < 3) return false;
  else if (f.exp.includes('1+ years') && p.exp < 1) return false;
  return true;
}

function sortProviders(list: Provider[], sort: SortKey | undefined, area?: string): Provider[] {
  const out = list.slice();
  if (sort === 'Rating') return out.sort((a, b) => b.rating - a.rating);
  if (sort === 'Nearest' && area) return out.sort((a, b) => Number(b.area === area) - Number(a.area === area));
  if (sort === 'Recently added') return out.reverse();
  return out.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);
}

export function selectProviders(query: ProviderQuery = {}): Provider[] {
  let list = PROV.slice();
  if (query.categoryId) list = list.filter((p) => p.categoryId === query.categoryId);
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        catName(p.categoryId).toLowerCase().includes(q),
    );
  }
  list = list.filter((p) => matchesFilters(p, query.filters));
  return sortProviders(list, query.sort, query.area);
}

export function getProviders(query: ProviderQuery = {}, page = 0): Promise<Page<Provider>> {
  return delay(paginate(selectProviders(query), page, PAGE_SIZE));
}

export function getProvider(id: string): Promise<Provider | undefined> {
  return delay(PROV.find((p) => p.id === id));
}

export function getNearbyProviders(area: string, limit = 5): Promise<Provider[]> {
  let near = PROV.filter((p) => (area === 'All Addis Ababa' ? true : p.area === area));
  if (near.length < 3) near = PROV.slice();
  return delay(near.slice(0, limit));
}

export function getVerifiedProviders(limit = 3): Promise<Provider[]> {
  return delay(PROV.filter((p) => p.verified).slice(0, limit));
}

export function getProviderPastWork(providerId: string): Promise<PastWork[]> {
  return delay(PASTWORK.filter((w) => w.providerId === providerId));
}

export function getRecentWork(limit = 4): Promise<PastWork[]> {
  return delay(PASTWORK.slice(0, limit));
}
