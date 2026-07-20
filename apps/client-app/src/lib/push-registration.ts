import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as api from '../api';
import { logger } from './logger';

type NotificationsModule = typeof import('expo-notifications');

function loadNotificationsModule(): NotificationsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

function pushRegistrationEnabled(): boolean {
  if (Platform.OS === 'web') return false;
  // Opt-in for dev/simulator runs unless explicitly enabled.
  if (process.env.EXPO_PUBLIC_ENABLE_PUSH === 'true') return true;
  // Production / EAS builds: attempt registration when native module exists.
  return Constants.appOwnership !== 'expo';
}

/**
 * Register a push token when expo-notifications is linked in the native binary.
 * Never throws — missing native module, simulator, or denied permission are all no-ops.
 */
export async function registerDirectoryPushIfPossible(): Promise<void> {
  if (!pushRegistrationEnabled()) return;

  const Notifications = loadNotificationsModule();
  if (!Notifications) {
    logger.warn('push_register_skipped', { reason: 'native_module_unavailable' });
    return;
  }

  try {
    const perms = await Notifications.getPermissionsAsync();
    let status = perms.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    const tokenResult = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    const token = tokenResult?.data;
    if (!token) return;
    await api.registerPushToken(token, 'expo');
  } catch (err) {
    logger.warn('push_register_failed', { err: String(err) });
  }
}
