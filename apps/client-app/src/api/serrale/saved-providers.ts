import { DIRECTORY } from '../../lib/env';
import { http, HttpError } from '../../lib/http';

export async function fetchSavedProviderIds(): Promise<string[]> {
  try {
    const res = await http<{ provider_ids: string[] }>(`${DIRECTORY}/customers/me/saved-providers`);
    return res.provider_ids ?? [];
  } catch (err) {
    if (err instanceof HttpError && (err.status === 404 || err.status === 501)) {
      return [];
    }
    throw err;
  }
}

export async function saveProviderBookmark(providerId: string): Promise<void> {
  await http(`${DIRECTORY}/customers/me/saved-providers/${encodeURIComponent(providerId)}`, {
    method: 'PUT',
  });
}

export async function unsaveProviderBookmark(providerId: string): Promise<void> {
  await http(`${DIRECTORY}/customers/me/saved-providers/${encodeURIComponent(providerId)}`, {
    method: 'DELETE',
  });
}
