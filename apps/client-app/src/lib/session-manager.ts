import { secureSession, BasicSessionTokens } from './secure-session';
import { useAppStore } from '../store/appStore';
import { queryClient } from './queryClient';
import { checkInstallation } from './installation';
import { setTokenProvider, setUnauthorizedHandler, HttpError } from './http';
import { exchangeSession, refreshSession, logoutSession, fetchCustomerMe } from '../api';
import type { ApiCustomerProfile, ApiSessionCustomer } from '../api/serrale/types';
import { customerDisplayName, isCustomerProfileComplete } from './customer-profile';
import { parsePhoneAccountHint, phonesMatch } from './phone-account';
import { providerSession, type ProviderSessionRecord } from './provider-session';
import { readActiveSessionRole, writeActiveSessionRole } from './session-role';

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

function applyCustomerToStore(customer: ApiCustomerProfile | ApiSessionCustomer) {
  useAppStore.getState().login({
    id: customer.id,
    phone: customer.phone,
    name: customerDisplayName(customer),
    profileComplete: isCustomerProfileComplete(customer),
  });
}

/** Restore in-memory auth state from a saved provider session (SecureStore). */
export async function syncProviderProfile(): Promise<void> {
  try {
    const { fetchProviderMe } = await import('../api');
    const provider = await fetchProviderMe();
    const record = await providerSession.read();
    if (record) {
      await providerSession.write(record.sessionToken, provider);
      applyProviderSession({ ...record, provider });
    }
  } catch {
    // Best-effort refresh — local session remains usable.
  }
}

export function applyProviderSession(record: ProviderSessionRecord): void {
  const provider = record.provider;
  useAppStore.getState().setPhoneHasProvider(true);
  useAppStore.getState().setProviderProfile({
    id: provider.id,
    full_name: provider.full_name,
    phone: provider.phone,
    area: provider.area ?? null,
    photo_url: provider.photo_url ?? null,
    category_slug: provider.category_slug,
  });
  if (provider.photo_url) {
    useAppStore.getState().setLinkedProvider({
      id: provider.id,
      full_name: provider.full_name,
      area: provider.area ?? null,
      photo_url: provider.photo_url,
      category_slug: provider.category_slug,
    });
  }
  const activeSession = useAppStore.getState().activeSession;
  if (activeSession === 'provider' || !useAppStore.getState().loggedIn) {
    useAppStore.getState().login({
      id: provider.id,
      phone: provider.phone,
      name: provider.full_name?.trim() || provider.phone,
      profileComplete: true,
    });
  }
}

/** Activate the saved provider JWT for the same phone (no OTP) when switching roles. */
export async function switchToProviderAccount(): Promise<'switched' | 'needs_login'> {
  const record = await providerSession.read();
  const phone = useAppStore.getState().user?.phone;
  if (!record?.provider?.phone || !phone || !phonesMatch(record.provider.phone, phone)) {
    return 'needs_login';
  }
  await writeActiveSessionRole('provider');
  useAppStore.getState().setActiveSession('provider');
  applyProviderSession(record);
  return 'switched';
}

/** Customer OTP session — never activate provider UI even when the phone has a listing. */
export async function activateCustomerSession(): Promise<void> {
  await writeActiveSessionRole('customer');
  useAppStore.getState().setActiveSession('customer');
  useAppStore.getState().setProviderProfile(null);
}

/** Prefer live GET /customers/me; fall back to the customer row from session exchange. */
export async function syncCustomerProfile(fallback?: ApiSessionCustomer | null): Promise<void> {
  try {
    // During a 401 refresh replay, the original GET /customers/me may still own the
    // in-flight dedupe slot in http(). Using skipAuthInterceptor here bypasses that
    // dedupe/retry wrapper so this bootstrap read cannot deadlock waiting on the
    // very request that triggered the refresh.
    const live = await fetchCustomerMe({ skipAuthInterceptor: true });
    applyCustomerToStore(live);
    return;
  } catch {
    if (fallback) applyCustomerToStore(fallback);
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
      await syncCustomerProfile();

      return newTokens;
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        await handleCustomerLogout();
        return null;
      }
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function handleExchange(phone: string, verifyToken: string): Promise<{ profileComplete: boolean }> {
  const result = await exchangeSession(phone, verifyToken);

  const accessToken = result.access_token || (result as any).accessToken;
  const refreshToken = result.refresh_token || (result as any).refreshToken;
  const accessExpiresAt = result.access_expires_at || (result as any).accessExpiresAt;
  const customer = result.customer;
  const account = parsePhoneAccountHint(result.account);
  const linkedProvider = result.linked_provider ?? null;

  const tokens: BasicSessionTokens = {
    accessToken,
    refreshToken,
    accessExpiresAt,
  };

  await secureSession.write(tokens);

  if (account?.has_provider) {
    useAppStore.getState().setPhoneHasProvider(true);
    if (account) useAppStore.getState().setPendingAccountHint(account);
  }
  if (linkedProvider) {
    useAppStore.getState().setLinkedProvider(linkedProvider);
  }

  const bundledProvider = result.provider_session;
  if (bundledProvider?.session_token && bundledProvider.provider) {
    await providerSession.write(bundledProvider.session_token, bundledProvider.provider);
  }

  await activateCustomerSession();
  await syncCustomerProfile(customer);

  return { profileComplete: useAppStore.getState().user?.profileComplete ?? isCustomerProfileComplete(customer) };
}

/** Revoke and clear the customer refresh session without signing out a provider JWT. */
export async function handleCustomerLogout(): Promise<void> {
  try {
    const tokens = await secureSession.read();
    if (tokens?.refreshToken) {
      await logoutSession(tokens.refreshToken);
    }
  } catch {
    // Ignore error, proceed to clear local customer data
  } finally {
    await secureSession.clear();
    queryClient.removeQueries({ queryKey: ['customers'] });
    useAppStore.getState().logoutCustomer();
    useAppStore.getState().setActiveSession(null);
    await writeActiveSessionRole(null);
  }
}

export async function handleLogout(): Promise<void> {
  try {
    const tokens = await secureSession.read();
    if (tokens && tokens.refreshToken) {
      await logoutSession(tokens.refreshToken);
    }
  } catch {
    // Ignore error, proceed to clear local data
  }
  try {
    await providerSession.clear();
  } catch {
    // Best-effort provider sign-out
  } finally {
    await secureSession.clear();
    queryClient.clear();
    await writeActiveSessionRole(null);
    useAppStore.getState().logout();
  }
}

export async function initializeSessionManager(): Promise<void> {
  useAppStore.getState().setSessionReady(false);
  await checkInstallation();

  // Prefer customer access token; fall back to provider JWT so review /
  // contact-event / eligibility calls work in a provider-only session without
  // a second "customer account" login. Backend accepts either scope.
  setTokenProvider(async () => {
    const tokens = await secureSession.read();
    if (tokens?.accessToken) return tokens.accessToken;
    const provider = await providerSession.read();
    return provider?.sessionToken ?? null;
  });

  setUnauthorizedHandler(async (replay, isSafe) => {
    // Provider JWT has no refresh path. Only attempt customer refresh when a
    // customer refresh token exists — otherwise a 401 on a provider Bearer
    // would call handleCustomerLogout and wipe the active session role.
    const tokens = await secureSession.read();
    if (!tokens?.refreshToken) {
      throw new HttpError(401, 'Session expired');
    }

    const refreshed = await doRefresh();
    if (!refreshed) {
      throw new HttpError(401, 'Session expired');
    }

    if (isSafe) {
      return await replay();
    }

    throw new HttpError(401, 'Session expired. Write request skipped.');
  });

  try {
    const [tokens, providerRecord, savedRole] = await Promise.all([
      secureSession.read(),
      providerSession.read(),
      readActiveSessionRole(),
    ]);

    const hasCustomer = !!tokens;
    const hasProvider = !!providerRecord?.provider?.phone;
    let role = savedRole;
    if (!role) {
      if (hasCustomer) role = 'customer';
      else if (hasProvider) role = 'provider';
    }

    if (hasCustomer && role !== 'provider') {
      const claims = decodeJwt(tokens!.accessToken);
      const isExpired = Date.now() >= new Date(tokens!.accessExpiresAt).getTime() - 10000;

      if (claims?.phone) {
        useAppStore.getState().setActiveSession('customer');
        useAppStore.getState().setProviderProfile(null);
        useAppStore.getState().login({
          id: claims.customer_id,
          phone: claims.phone,
          name: claims.phone,
          profileComplete: false,
        });
        syncCustomerProfile().catch(() => {});
      }

      if (isExpired) {
        doRefresh().catch(() => {});
      }
    }

    if (hasProvider) {
      useAppStore.getState().setPhoneHasProvider(true);
      if (role === 'provider') {
        await writeActiveSessionRole('provider');
        useAppStore.getState().setActiveSession('provider');
        applyProviderSession(providerRecord!);
      }
    }

    const state = useAppStore.getState();
    if (state.loggedIn && !state.activeSession) {
      if (state.providerProfile && !hasCustomer) {
        await writeActiveSessionRole('provider');
        useAppStore.getState().setActiveSession('provider');
      } else {
        await writeActiveSessionRole('customer');
        useAppStore.getState().setActiveSession('customer');
        useAppStore.getState().setProviderProfile(null);
      }
    }
  } catch {
    // Fail-safe bootstrap
  } finally {
    useAppStore.getState().setSessionReady(true);
  }
}
