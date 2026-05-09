import * as SecureStore from "expo-secure-store";

import type { SessionTokens } from "./types";

const ACCESS_TOKEN_KEY = "serrale.mobile.access_token";
const REFRESH_TOKEN_KEY = "serrale.mobile.refresh_token";

const memoryFallback: Record<string, string | undefined> = {};

async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return memoryFallback[key] ?? null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
    return;
  } catch {
    memoryFallback[key] = value;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
    return;
  } catch {
    delete memoryFallback[key];
  }
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function setSession(tokens: SessionTokens): Promise<void> {
  await setItem(ACCESS_TOKEN_KEY, tokens.accessToken);

  if (tokens.refreshToken) {
    await setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
}

export async function hasSession(): Promise<boolean> {
  const token = await getAccessToken();
  return Boolean(token);
}
