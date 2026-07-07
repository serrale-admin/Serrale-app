import { secureSession, BasicSessionTokens } from './secure-session';
import { useAppStore } from '../store/appStore';
import { queryClient } from './queryClient';
import { checkInstallation } from './installation';
import { setTokenProvider, setUnauthorizedHandler, HttpError } from './http';
import { exchangeSession, refreshSession, logoutSession } from '../api';

let refreshPromise: Promise<BasicSessionTokens | null> | null = null;

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodes a base64url string to raw bytes using a pure-JS lookup table.
 *
 * Hermes (RN 0.76 / Expo SDK 52) does not ship `atob`/`TextDecoder`, so we cannot
 * rely on either. This decodes base64url (`-`/`_` alphabet, optional padding)
 * to a byte array by hand. Throws on invalid input so the caller can fall back.
 */
function base64UrlToBytes(input: string): Uint8Array {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < base64.length; i++) {
    const value = BASE64_CHARS.indexOf(base64[i]);
    if (value === -1) throw new Error('Invalid base64url character');
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(bytes);
}

/**
 * Decodes UTF-8 bytes to a string in pure JS (no TextDecoder), handling
 * multi-byte sequences (e.g. Amharic) correctly.
 */
function utf8BytesToString(bytes: Uint8Array): string {
  let result = '';
  let i = 0;
  while (i < bytes.length) {
    const byte1 = bytes[i++];
    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
    } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
      const byte2 = bytes[i++] & 0x3f;
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | byte2);
    } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      result += String.fromCharCode(((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3);
    } else {
      // 4-byte sequence -> surrogate pair
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      const byte4 = bytes[i++] & 0x3f;
      let codePoint = ((byte1 & 0x07) << 18) | (byte2 << 12) | (byte3 << 6) | byte4;
      codePoint -= 0x10000;
      result += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
    }
  }
  return result;
}

/**
 * Decodes a JWT token payload without external libraries and without relying on
 * `atob`/`TextDecoder` (unavailable on Hermes). Exported for testing only.
 */
export function decodeJwt(token: string): { customer_id?: string; phone?: string; scope?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const bytes = base64UrlToBytes(parts[1]);
    const jsonStr = utf8BytesToString(bytes);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export async function doRefresh(): Promise<BasicSessionTokens | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokens = await secureSession.read();
      if (!tokens || !tokens.refreshToken) {
        throw new HttpError(401, 'No refresh token available', 'NO_REFRESH_TOKEN');
      }

      const res = await refreshSession(tokens.refreshToken);
      const accessExpiresAt = res.access_expires_at || (res as any).accessExpiresAt;
      const accessToken = res.access_token || (res as any).accessToken;
      const refreshToken = res.refresh_token || (res as any).refreshToken;

      const newTokens: BasicSessionTokens = {
        accessToken,
        refreshToken,
        accessExpiresAt,
      };

      await secureSession.write(newTokens);

      // Extract details from new access token to update Zustand state
      const claims = decodeJwt(accessToken);
      if (claims && claims.phone) {
        useAppStore.getState().login({
          id: claims.customer_id,
          phone: claims.phone,
          name: 'SERRALE user',
        });
      }

      return newTokens;
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        // Hard logout on 401 SESSION_EXPIRED
        await handleLogout();
        return null;
      }
      // Network error, timeout or 503: do NOT destroy session. Keep existing tokens and propagate error.
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function handleExchange(phone: string, verifyToken: string): Promise<void> {
  const result = await exchangeSession(phone, verifyToken);

  const accessToken = result.access_token || (result as any).accessToken;
  const refreshToken = result.refresh_token || (result as any).refreshToken;
  const accessExpiresAt = result.access_expires_at || (result as any).accessExpiresAt;
  const customer = result.customer;

  const tokens: BasicSessionTokens = {
    accessToken,
    refreshToken,
    accessExpiresAt,
  };

  await secureSession.write(tokens);

  // Update Zustand state. The verify_token was CONSUMED by the exchange above;
  // the store no longer retains any verify token (that field was removed).
  useAppStore.getState().login({
    id: customer.id,
    phone: customer.phone,
    name: 'SERRALE user',
  });
}

export async function handleLogout(): Promise<void> {
  try {
    const tokens = await secureSession.read();
    if (tokens && tokens.refreshToken) {
      // Best-effort logout API call
      await logoutSession(tokens.refreshToken);
    }
  } catch {
    // Ignore error, proceed to clear local data
  } finally {
    await secureSession.clear();
    queryClient.clear();
    useAppStore.getState().logout();
  }
}

export async function initializeSessionManager(): Promise<void> {
  // 1. Check install
  await checkInstallation();

  // 2. Register HTTP client hooks
  setTokenProvider(async () => {
    const tokens = await secureSession.read();
    if (!tokens) return null;
    return tokens.accessToken;
  });

  setUnauthorizedHandler(async (replay, isSafe) => {
    const refreshed = await doRefresh();
    if (!refreshed) {
      throw new HttpError(401, 'Session expired');
    }

    if (isSafe) {
      return await replay();
    }

    throw new HttpError(401, 'Session expired. Write request skipped.');
  });

  // 3. Bootstrap load
  try {
    const tokens = await secureSession.read();
    if (tokens) {
      const claims = decodeJwt(tokens.accessToken);
      const isExpired = Date.now() >= new Date(tokens.accessExpiresAt).getTime() - 10000;
      
      // Update store immediately with cached info (even if expired, we refresh in bg)
      if (claims && claims.phone) {
        useAppStore.getState().login({
          id: claims.customer_id,
          phone: claims.phone,
          name: 'SERRALE user',
        });
      }

      if (isExpired) {
        // Trigger background refresh. If refresh fails with 401, handleLogout was
        // already called inside doRefresh. On network/503 we keep the degraded
        // login state.
        doRefresh().catch(() => {});
      }
    }
  } catch {
    // Fail-safe bootstrap
  }
}
