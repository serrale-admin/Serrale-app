import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureSession } from './secure-session';

const INSTALLATION_MARKER_KEY = 'serrale_install_marker';

/**
 * Checks if the app has been newly installed.
 * 
 * On iOS, SecureStore contents (Keychain) survive app uninstallation. To prevent
 * restoring stale/expired credentials from a previous install on first launch:
 * 1. We check for a non-secret marker in AsyncStorage (which is cleared on uninstall).
 * 2. If the marker is missing but tokens exist in SecureStore, we clear the SecureStore.
 * 3. We then save the marker so subsequent launches don't trigger the purge.
 * 
 * On Android, both AsyncStorage and SecureStore are automatically wiped on uninstall.
 */
export async function checkInstallation(): Promise<void> {
  try {
    const marker = await AsyncStorage.getItem(INSTALLATION_MARKER_KEY);
    if (!marker) {
      // Stale Keychain survivor check
      const tokens = await secureSession.read();
      if (tokens) {
        await secureSession.clear();
      }
      // Set the installation marker
      await AsyncStorage.setItem(INSTALLATION_MARKER_KEY, 'installed');
    }
  } catch {
    // Fail-safe: do not crash app startup if AsyncStorage fails
  }
}
