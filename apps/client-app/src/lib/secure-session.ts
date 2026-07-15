import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface BasicSessionTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
}

const SECURE_STORE_KEY = 'serrale_customer_tokens';

async function readRaw(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return null;
  }
}

async function writeRaw(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    throw new Error('Failed to save secure session storage.');
  }
}

async function clearRaw(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    if (Platform.OS === 'web') await AsyncStorage.removeItem(key);
  }
}

export const secureSession = {
  async read(): Promise<BasicSessionTokens | null> {
    try {
      const value = await readRaw(SECURE_STORE_KEY);
      if (!value) return null;
      return JSON.parse(value) as BasicSessionTokens;
    } catch {
      return null;
    }
  },

  async write(tokens: BasicSessionTokens): Promise<void> {
    await writeRaw(SECURE_STORE_KEY, JSON.stringify(tokens));
  },

  async clear(): Promise<void> {
    await clearRaw(SECURE_STORE_KEY);
  },
};
