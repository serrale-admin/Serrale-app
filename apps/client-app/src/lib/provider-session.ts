import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ApiProviderSessionProvider } from '../api/serrale/types';

export interface ProviderSessionRecord {
  sessionToken: string;
  provider: Pick<
    ApiProviderSessionProvider,
    'id' | 'full_name' | 'phone' | 'category_slug' | 'area' | 'photo_url'
  >;
  savedAt: string;
}

const STORE_KEY = 'serrale_provider_session';

async function readRaw(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORE_KEY);
  } catch {
    if (Platform.OS === 'web') return AsyncStorage.getItem(STORE_KEY);
    return null;
  }
}

async function writeRaw(value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORE_KEY, value);
    return;
  } catch {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(STORE_KEY, value);
      return;
    }
    throw new Error('Failed to save provider session.');
  }
}

async function clearRaw(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORE_KEY);
  } catch {
    if (Platform.OS === 'web') await AsyncStorage.removeItem(STORE_KEY);
  }
}

/** Persists the directory provider JWT returned by POST /providers/register. */
export const providerSession = {
  async read(): Promise<ProviderSessionRecord | null> {
    try {
      const raw = await readRaw();
      if (!raw) return null;
      return JSON.parse(raw) as ProviderSessionRecord;
    } catch {
      return null;
    }
  },

  async write(sessionToken: string, provider: ApiProviderSessionProvider): Promise<void> {
    const record: ProviderSessionRecord = {
      sessionToken,
      provider: {
        id: provider.id,
        full_name: provider.full_name,
        phone: provider.phone,
        category_slug: provider.category_slug,
        area: provider.area ?? null,
        photo_url: provider.photo_url ?? null,
      },
      savedAt: new Date().toISOString(),
    };
    await writeRaw(JSON.stringify(record));
  },

  async clear(): Promise<void> {
    await clearRaw();
  },
};
