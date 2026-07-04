import * as SecureStore from 'expo-secure-store';

export interface BasicSessionTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
}

const SECURE_STORE_KEY = 'serrale_customer_tokens';

export const secureSession = {
  async read(): Promise<BasicSessionTokens | null> {
    try {
      const value = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (!value) return null;
      return JSON.parse(value) as BasicSessionTokens;
    } catch {
      // Return null on failure (e.g. key corruption)
      return null;
    }
  },

  async write(tokens: BasicSessionTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(tokens));
    } catch {
      // Propagate secure store write failures
      throw new Error('Failed to save secure session storage.');
    }
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
    } catch {
      // Best effort clearing
    }
  },
};
