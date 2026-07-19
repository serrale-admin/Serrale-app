import { Platform } from 'react-native';
import * as api from '../api';
import { logger } from './logger';

/**
 * Register a push token when expo-notifications is available.
 * Safe no-op when the native module is not installed or permission is denied.
 */
export async function registerDirectoryPushIfPossible(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // Dynamic import keeps the app bootable when the package is not linked yet.
    const Notifications = await import('expo-notifications').catch(() => null);
    if (!Notifications) return;

    const perms = await Notifications.getPermissionsAsync();
    let status = perms.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') return;

    const tokenResult = await Notifications.getExpoPushTokenAsync();
    const token = tokenResult?.data;
    if (!token) return;
    await api.registerPushToken(token, 'expo');
  } catch (err) {
    logger.warn('push_register_failed', { err: String(err) });
  }
}
