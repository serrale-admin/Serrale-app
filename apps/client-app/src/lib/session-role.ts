import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActiveSessionRole = 'customer' | 'provider';

const ACTIVE_SESSION_KEY = 'serrale_active_session';

export async function readActiveSessionRole(): Promise<ActiveSessionRole | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
  return raw === 'customer' || raw === 'provider' ? raw : null;
}

export async function writeActiveSessionRole(role: ActiveSessionRole | null): Promise<void> {
  if (!role) {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, role);
}
