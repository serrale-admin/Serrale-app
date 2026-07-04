/**
 * End-to-end coverage of the 401 refresh interceptor wired through the real
 * `http()` client and the real session manager:
 *   - N concurrent 401s coalesce into exactly ONE refresh network call (single-flight)
 *   - a safe GET is replayed exactly once after a successful refresh
 *   - a non-idempotent write (POST) is NOT auto-replayed; the error surfaces
 *
 * `fetch` is mocked at the network boundary so we can count real calls to the
 * refresh endpoint. The API mock layer is NOT used here — we drive `serrale`.
 */
import { http, setTokenProvider, setUnauthorizedHandler } from '../http';
import { doRefresh, handleLogout } from '../session-manager';
import { secureSession } from '../secure-session';
import { useAppStore } from '../../store/appStore';
import { queryClient } from '../queryClient';

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
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] || null),
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete store[key];
      }),
      _clear: () => {
        store = {};
      },
    },
  };
});

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function envelope(data: unknown) {
  return { success: true, data };
}

const REFRESH_PATH = '/customers/session/refresh';

describe('http 401 refresh interceptor (single-flight + replay policy)', () => {
  beforeEach(async () => {
    require('expo-secure-store')._clear();
    (require('@react-native-async-storage/async-storage').default as any)._clear();
    useAppStore.getState().logout();
    queryClient.clear();

    // Seed a session so the token provider attaches a Bearer header.
    await secureSession.write({
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
      accessExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
    });

    // Wire the SAME hooks the app registers in bootstrap.
    setTokenProvider(async () => {
      const t = await secureSession.read();
      return t?.accessToken ?? null;
    });
    setUnauthorizedHandler(async (replay, isSafe) => {
      const refreshed = await doRefresh();
      if (!refreshed) throw new Error('logged out');
      if (isSafe) return await replay();
      throw new Error('write not replayed');
    });
  });

  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('coalesces N concurrent 401s into exactly ONE refresh call and replays each safe GET once', async () => {
    let refreshCalls = 0;
    const dataGetCalls: string[] = [];

    global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      const u = String(url);
      if (u.includes(REFRESH_PATH)) {
        refreshCalls += 1;
        // Simulate latency so all in-flight 401s land on the same promise.
        await new Promise((r) => setTimeout(r, 30));
        return jsonResponse(
          200,
          envelope({
            access_token: 'access-new',
            refresh_token: 'refresh-new',
            access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
          }),
        );
      }
      // Data GET: 401 while the access token is stale, 200 after refresh.
      const auth = (init?.headers as Record<string, string>)?.Authorization;
      dataGetCalls.push(auth || 'none');
      if (auth === 'Bearer access-old') return jsonResponse(401, { success: false, error: { code: 'SESSION_EXPIRED' } });
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    const results = await Promise.all([
      http('/public-directory/customers/me'),
      http('/public-directory/customers/me'),
      http('/public-directory/customers/me'),
      http('/public-directory/customers/me'),
    ]);

    // Exactly one refresh network call despite 4 concurrent 401s.
    expect(refreshCalls).toBe(1);
    // Every safe GET eventually succeeded (replayed with the new token).
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }, { ok: true }]);
    // The rotated token was persisted.
    expect((await secureSession.read())?.accessToken).toBe('access-new');
    // Replays used the fresh Bearer token.
    expect(dataGetCalls).toContain('Bearer access-new');
  });

  it('does NOT auto-replay a non-idempotent write; surfaces the error after refresh', async () => {
    let refreshCalls = 0;
    let writeAttempts = 0;

    global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      const u = String(url);
      if (u.includes(REFRESH_PATH)) {
        refreshCalls += 1;
        return jsonResponse(
          200,
          envelope({
            access_token: 'access-new',
            refresh_token: 'refresh-new',
            access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
          }),
        );
      }
      writeAttempts += 1;
      return jsonResponse(401, { success: false, error: { code: 'SESSION_EXPIRED' } });
    }) as unknown as typeof fetch;

    await expect(
      http('/public-directory/leads/request', { method: 'POST', body: { service: 'x' } }),
    ).rejects.toThrow();

    // Refresh happened once, but the write was attempted exactly once (no replay).
    expect(refreshCalls).toBe(1);
    expect(writeAttempts).toBe(1);
  });

  it('logs out and clears the session when refresh itself returns 401', async () => {
    global.fetch = jest.fn(async (url: string) => {
      const u = String(url);
      if (u.includes(REFRESH_PATH)) return jsonResponse(401, { success: false, error: { code: 'SESSION_EXPIRED' } });
      return jsonResponse(401, { success: false, error: { code: 'SESSION_EXPIRED' } });
    }) as unknown as typeof fetch;

    await expect(http('/public-directory/customers/me')).rejects.toThrow();

    expect(await secureSession.read()).toBeNull();
    expect(useAppStore.getState().loggedIn).toBe(false);
  });

  it('retains the session on a network error during refresh (degraded, not logged out)', async () => {
    global.fetch = jest.fn(async (url: string) => {
      const u = String(url);
      if (u.includes(REFRESH_PATH)) throw new TypeError('Network request failed');
      return jsonResponse(401, { success: false, error: { code: 'SESSION_EXPIRED' } });
    }) as unknown as typeof fetch;

    await expect(http('/public-directory/customers/me')).rejects.toThrow();

    // Session tokens are retained; user is NOT logged out on connectivity failure.
    expect((await secureSession.read())?.refreshToken).toBe('refresh-old');
  });

  afterAll(async () => {
    await handleLogout().catch(() => {});
  });
});
