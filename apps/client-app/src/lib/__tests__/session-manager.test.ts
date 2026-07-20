import { doRefresh, handleCustomerLogout, handleExchange, handleLogout, initializeSessionManager } from '../session-manager';
import { secureSession } from '../secure-session';
import { providerSession } from '../provider-session';
import { useAppStore } from '../../store/appStore';
import { queryClient } from '../queryClient';
import { HttpError } from '../http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../../api';

jest.mock('../../api', () => ({
  exchangeSession: jest.fn(),
  refreshSession: jest.fn(),
  logoutSession: jest.fn(),
  fetchCustomerMe: jest.fn(),
}));

jest.mock('../provider-session', () => ({
  providerSession: {
    read: jest.fn(),
    write: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => {
  let store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (key: string) => store[key] || null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
    _clear: () => {
      store = {};
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  const mockStorage = {
    getItem: jest.fn(async (key: string) => store[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
      return null;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
      return null;
    }),
    _clear: () => {
      store = {};
    },
  };
  return {
    __esModule: true,
    default: mockStorage,
  };
});

// Helper to generate a fake JWT with JSON payload
function makeFakeJwt(payload: object) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
  return `${header}.${body}.signature`;
}

describe('session-manager', () => {
  beforeEach(async () => {
    require('expo-secure-store')._clear();
    require('@react-native-async-storage/async-storage').default._clear();
    jest.clearAllMocks();
    useAppStore.getState().logout();
    useAppStore.getState().setSessionReady(false);
    (providerSession.read as jest.Mock).mockResolvedValue(null);
    (providerSession.clear as jest.Mock).mockResolvedValue(undefined);
    queryClient.clear();
  });

  describe('handleExchange', () => {
    it('should exchange verifyToken and login user', async () => {
      const mockResult = {
        access_token: makeFakeJwt({ customer_id: 'cust-1', phone: '+251912345678' }),
        refresh_token: 'refresh-token-val',
        access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
        customer: {
          id: 'cust-1',
          phone: '+251912345678',
          phone_verified: true,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      (api.exchangeSession as jest.Mock).mockResolvedValue(mockResult);
      (api.fetchCustomerMe as jest.Mock).mockResolvedValue({
        ...mockResult.customer,
        display_name: 'Abebe Kebede',
        profile_complete: true,
      });

      await handleExchange('0912345678', 'verify-token-val');

      const saved = await secureSession.read();
      expect(saved).toEqual({
        accessToken: mockResult.access_token,
        refreshToken: mockResult.refresh_token,
        accessExpiresAt: mockResult.access_expires_at,
      });

      const storeState = useAppStore.getState();
      expect(storeState.loggedIn).toBe(true);
      expect(storeState.user).toEqual({
        id: 'cust-1',
        phone: '+251912345678',
        name: 'Abebe Kebede',
        profileComplete: true,
      });
      expect(storeState.activeSession).toBe('customer');
      expect(storeState.providerProfile).toBeNull();
      expect(storeState.hasCustomerSession).toBe(true);
    });

    it('sets customer session even when the phone has a linked provider listing', async () => {
      const mockResult = {
        access_token: makeFakeJwt({ customer_id: 'cust-2', phone: '+251938064841' }),
        refresh_token: 'refresh-token-val',
        access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
        customer: {
          id: 'cust-2',
          phone: '+251938064841',
          phone_verified: true,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        account: { has_customer: true, has_provider: true, customer_profile_complete: true },
        linked_provider: {
          id: 'prov-1',
          full_name: 'Natnael Asnake',
          area: 'Bole',
          photo_url: 'https://example.com/photo.jpg',
          category_slug: 'plumbers',
        },
        provider_session: {
          session_token: 'provider-jwt-from-exchange',
          provider: {
            id: 'prov-1',
            full_name: 'Natnael Asnake',
            phone: '+251938064841',
            category_slug: 'plumbers',
            area: 'Bole',
            photo_url: 'https://example.com/photo.jpg',
          },
        },
      };
      (api.exchangeSession as jest.Mock).mockResolvedValue(mockResult);
      (api.fetchCustomerMe as jest.Mock).mockResolvedValue({
        ...mockResult.customer,
        display_name: 'Natnael Asnake',
        profile_complete: true,
      });

      await handleExchange('0938064841', 'verify-token-val');

      const storeState = useAppStore.getState();
      expect(storeState.activeSession).toBe('customer');
      expect(storeState.providerProfile).toBeNull();
      expect(storeState.phoneHasProvider).toBe(true);
      expect(storeState.user?.name).toBe('Natnael Asnake');
      expect(providerSession.write).toHaveBeenCalledWith(
        'provider-jwt-from-exchange',
        expect.objectContaining({ id: 'prov-1', full_name: 'Natnael Asnake', phone: '+251938064841' }),
      );
    });
  });

  describe('doRefresh (single-flight)', () => {
    it('should perform exactly 1 refresh call for multiple concurrent refresh attempts', async () => {
      const mockTokens = {
        accessToken: makeFakeJwt({ customer_id: 'cust-1', phone: '+251912345678' }),
        refreshToken: 'refresh-old',
        accessExpiresAt: new Date(Date.now() - 5000).toISOString(), // expired
      };
      await secureSession.write(mockTokens);

      const mockRefreshResult = {
        access_token: makeFakeJwt({ customer_id: 'cust-1', phone: '+251912345678' }),
        refresh_token: 'refresh-new',
        access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
      };

      (api.refreshSession as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => setTimeout(() => resolve(mockRefreshResult), 50));
      });

      // Concurrent calls
      const [res1, res2] = await Promise.all([doRefresh(), doRefresh()]);

      expect(api.refreshSession).toHaveBeenCalledTimes(1);
      expect(res1).toEqual({
        accessToken: mockRefreshResult.access_token,
        refreshToken: mockRefreshResult.refresh_token,
        accessExpiresAt: mockRefreshResult.access_expires_at,
      });
      expect(res2).toEqual(res1);
    });

    it('should clear session and logout on 401 SESSION_EXPIRED', async () => {
      const mockTokens = {
        accessToken: 'access-old',
        refreshToken: 'refresh-old',
        accessExpiresAt: new Date(Date.now() - 5000).toISOString(),
      };
      await secureSession.write(mockTokens);

      (api.refreshSession as jest.Mock).mockRejectedValue(new HttpError(401, 'Session expired'));

      await doRefresh();

      const saved = await secureSession.read();
      expect(saved).toBeNull();
      expect(useAppStore.getState().loggedIn).toBe(false);
    });

    it('should retain tokens and not logout on network error or 503', async () => {
      const mockTokens = {
        accessToken: 'access-old',
        refreshToken: 'refresh-old',
        accessExpiresAt: new Date(Date.now() - 5000).toISOString(),
      };
      await secureSession.write(mockTokens);

      (api.refreshSession as jest.Mock).mockRejectedValue(new HttpError(503, 'Service unavailable'));

      await expect(doRefresh()).rejects.toThrow();

      const saved = await secureSession.read();
      expect(saved).toEqual(mockTokens);
    });
  });

  describe('handleLogout', () => {
    it('should clear everything, call logout API (best effort), and be idempotent', async () => {
      const mockTokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        accessExpiresAt: new Date().toISOString(),
      };
      await secureSession.write(mockTokens);
      (api.logoutSession as jest.Mock).mockResolvedValue({ ok: true });

      // Seed a private query so we can assert the cache is cleared on logout.
      queryClient.setQueryData(['customers', 'me'], { phone: '+251912345678' });
      useAppStore.getState().login({ id: 'c1', phone: '+251912345678', name: 'SERRALE user' });

      // First logout
      await handleLogout();

      expect(api.logoutSession).toHaveBeenCalledWith('refresh');
      expect(await secureSession.read()).toBeNull();
      expect(useAppStore.getState().loggedIn).toBe(false);
      // Private React Query cache is cleared.
      expect(queryClient.getQueryData(['customers', 'me'])).toBeUndefined();

      // Second logout (idempotent check)
      await expect(handleLogout()).resolves.not.toThrow();
    });
  });

  describe('handleCustomerLogout', () => {
    it('restores provider UI when customer tokens are cleared but provider JWT remains', async () => {
      await secureSession.write({
        accessToken: 'access',
        refreshToken: 'refresh',
        accessExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
      });
      (providerSession.read as jest.Mock).mockResolvedValue({
        sessionToken: 'provider-jwt',
        provider: {
          id: 'prov-1',
          full_name: 'Natnael Asnake',
          phone: '+251938064841',
          category_slug: 'plumbers',
          area: 'Bole',
        },
        savedAt: new Date().toISOString(),
      });
      (api.logoutSession as jest.Mock).mockResolvedValue({ ok: true });
      useAppStore.getState().setHasCustomerSession(true);
      useAppStore.getState().login({ id: 'c1', phone: '+251938064841', name: 'Natnael' });

      await handleCustomerLogout();

      const store = useAppStore.getState();
      expect(await secureSession.read()).toBeNull();
      expect(store.hasCustomerSession).toBe(false);
      expect(store.loggedIn).toBe(true);
      expect(store.activeSession).toBe('provider');
      expect(store.providerProfile?.id).toBe('prov-1');
    });
  });

  describe('bootstrap restore', () => {
    beforeEach(async () => {
      await AsyncStorage.setItem('serrale_install_marker', 'installed');
      (api.fetchCustomerMe as jest.Mock).mockReset();
      (api.fetchCustomerMe as jest.Mock).mockRejectedValue(new Error('fetchCustomerMe not mocked'));
    });

    it('should login immediately if valid tokens are present', async () => {
      const mockTokens = {
        accessToken: makeFakeJwt({ customer_id: 'cust-1', phone: '+251912345678' }),
        refreshToken: 'refresh',
        accessExpiresAt: new Date(Date.now() + 3600_000).toISOString(), // valid for 1h
      };
      await secureSession.write(mockTokens);

      await initializeSessionManager();

      const storeState = useAppStore.getState();
      expect(storeState.loggedIn).toBe(true);
      expect(storeState.hasCustomerSession).toBe(true);
      expect(storeState.user?.phone).toBe('+251912345678');
      expect(api.refreshSession).not.toHaveBeenCalled();
    });

    it('should trigger background refresh if tokens are expired', async () => {
      const mockTokens = {
        accessToken: makeFakeJwt({ customer_id: 'cust-1', phone: '+251912345678' }),
        refreshToken: 'refresh-expired',
        accessExpiresAt: new Date(Date.now() - 5000).toISOString(), // expired
      };
      await secureSession.write(mockTokens);

      const mockRefreshResult = {
        access_token: makeFakeJwt({ customer_id: 'cust-1', phone: '+251912345678' }),
        refresh_token: 'refresh-new',
        access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
      };
      (api.refreshSession as jest.Mock).mockResolvedValue(mockRefreshResult);

      await initializeSessionManager();

      // Wait a moment for background task to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(api.refreshSession).toHaveBeenCalledWith('refresh-expired');
      const saved = await secureSession.read();
      expect(saved?.refreshToken).toBe('refresh-new');
    });

    it('should stay logged out when no tokens are present', async () => {
      await initializeSessionManager();

      expect(useAppStore.getState().loggedIn).toBe(false);
      expect(useAppStore.getState().user).toBeNull();
      expect(useAppStore.getState().sessionReady).toBe(true);
      expect(api.refreshSession).not.toHaveBeenCalled();
    });

    it('should restore provider session when no customer tokens exist', async () => {
      (providerSession.read as jest.Mock).mockResolvedValue({
        sessionToken: 'provider-jwt',
        provider: {
          id: 'prov-1',
          full_name: 'Natnael Asnake',
          phone: '+251938064841',
          category_slug: 'plumbers',
          area: 'Bole',
          photo_url: 'https://example.com/photo.jpg',
        },
        savedAt: new Date().toISOString(),
      });

      await initializeSessionManager();
      await new Promise((resolve) => setTimeout(resolve, 10));

      const store = useAppStore.getState();
      expect(store.sessionReady).toBe(true);
      expect(store.loggedIn).toBe(true);
      expect(store.hasCustomerSession).toBe(false);
      expect(store.user?.name).toBe('Natnael Asnake');
      expect(store.providerProfile?.full_name).toBe('Natnael Asnake');
      expect(store.activeSession).toBe('provider');
    });

    it('keeps customer UI when both customer tokens and provider JWT exist but role is customer', async () => {
      const mockTokens = {
        accessToken: makeFakeJwt({ customer_id: 'cust-1', phone: '+251938064841' }),
        refreshToken: 'refresh',
        accessExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
      };
      await secureSession.write(mockTokens);
      await AsyncStorage.setItem('serrale_active_session', 'customer');
      (providerSession.read as jest.Mock).mockResolvedValue({
        sessionToken: 'provider-jwt',
        provider: {
          id: 'prov-1',
          full_name: 'Natnael Asnake',
          phone: '+251938064841',
          category_slug: 'plumbers',
          area: 'Bole',
        },
        savedAt: new Date().toISOString(),
      });
      (api.fetchCustomerMe as jest.Mock).mockResolvedValue({
        id: 'cust-1',
        phone: '+251938064841',
        display_name: 'Natnael Asnake',
        profile_complete: true,
        phone_verified: true,
        status: 'active',
      });

      await initializeSessionManager();
      await new Promise((resolve) => setTimeout(resolve, 10));

      const store = useAppStore.getState();
      expect(store.activeSession).toBe('customer');
      expect(store.providerProfile).toBeNull();
      expect(store.phoneHasProvider).toBe(true);
      expect(store.loggedIn).toBe(true);
      expect(store.hasCustomerSession).toBe(true);
    });

    it('keeps hasCustomerSession when active role is provider but customer tokens exist', async () => {
      const mockTokens = {
        accessToken: makeFakeJwt({ customer_id: 'cust-1', phone: '+251938064841' }),
        refreshToken: 'refresh',
        accessExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
      };
      await secureSession.write(mockTokens);
      await AsyncStorage.setItem('serrale_active_session', 'provider');
      (providerSession.read as jest.Mock).mockResolvedValue({
        sessionToken: 'provider-jwt',
        provider: {
          id: 'prov-1',
          full_name: 'Natnael Asnake',
          phone: '+251938064841',
          category_slug: 'plumbers',
          area: 'Bole',
        },
        savedAt: new Date().toISOString(),
      });

      await initializeSessionManager();
      await new Promise((resolve) => setTimeout(resolve, 10));

      const store = useAppStore.getState();
      expect(store.activeSession).toBe('provider');
      expect(store.loggedIn).toBe(true);
      expect(store.hasCustomerSession).toBe(true);
      expect(store.providerProfile?.id).toBe('prov-1');
    });

    it('attaches a provider JWT to request/activity paths when no customer token exists', async () => {
      (providerSession.read as jest.Mock).mockResolvedValue({
        sessionToken: 'provider-jwt',
        provider: {
          id: 'prov-1',
          full_name: 'Natnael Asnake',
          phone: '+251938064841',
          category_slug: 'plumbers',
          area: 'Bole',
        },
        savedAt: new Date().toISOString(),
      });
      await initializeSessionManager();

      const { http, setUnauthorizedHandler } = require('../http') as typeof import('../http');
      setUnauthorizedHandler(null);

      const auths: string[] = [];
      global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
        const headers = init?.headers as Record<string, string> | undefined;
        auths.push(headers?.Authorization || '');
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ success: true, data: { items: [], total: 0 } }),
          headers: { get: () => null },
        } as unknown as Response;
      }) as unknown as typeof fetch;

      await http('/public-directory/customers/me/activity');
      await http('/public-directory/leads/request', {
        method: 'POST',
        body: { service: 'x' },
        headers: { 'Idempotency-Key': 'k1' },
      });

      expect(auths).toEqual(['Bearer provider-jwt', 'Bearer provider-jwt']);
    });
  });
});
