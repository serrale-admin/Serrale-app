import { delay } from './client';

/** Mock per-customer saved provider ids (survives logout/login in mock mode). */
const savedByCustomer = new Map<string, Set<string>>();
const MOCK_CUSTOMER_ID = 'mock-customer-uuid';

function bucket(): Set<string> {
  let set = savedByCustomer.get(MOCK_CUSTOMER_ID);
  if (!set) {
    set = new Set();
    savedByCustomer.set(MOCK_CUSTOMER_ID, set);
  }
  return set;
}

export function fetchSavedProviderIds(): Promise<string[]> {
  return delay([...bucket()]);
}

export function saveProviderBookmark(providerId: string): Promise<void> {
  bucket().add(providerId);
  return delay(undefined);
}

export function unsaveProviderBookmark(providerId: string): Promise<void> {
  bucket().delete(providerId);
  return delay(undefined);
}
