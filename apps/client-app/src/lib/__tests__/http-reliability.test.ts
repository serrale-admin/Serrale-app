/**
 * Integration coverage for the reliability orchestration layered onto `http()`:
 * request-id / source headers, in-flight GET dedupe, GET retry with backoff,
 * abort semantics (aborted requests never retry; a deduped subscriber aborting
 * does not kill the shared request), and the read circuit breaker — including the
 * guarantee that it NEVER blocks a write (e.g. logout POST).
 *
 * `fetch` is mocked at the boundary. We use Jest fake timers so backoff/cool-down
 * delays are deterministic and instant. The 401 interceptor is NOT exercised here
 * (that lives in http-interceptor.test.ts); we keep tokenProvider/unauthorizedHandler
 * unset so this suite tests the reliability layer in isolation.
 */
import {
  http,
  setTokenProvider,
  setUnauthorizedHandler,
  getNetworkStatus,
  subscribeNetworkStatus,
  setCurrentRoute,
  segmentsToRouteTemplate,
  __resetNetworkReliability,
} from '../http';
import {
  CIRCUIT_FAILURE_THRESHOLD,
  CIRCUIT_COOLDOWN_MS,
  MAX_RETRIES,
} from '../request-policy';

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? headers[name] ?? null,
    },
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function envelope(data: unknown) {
  return { success: true, data };
}

/** Advance fake timers repeatedly so queued backoff/setTimeout callbacks fire. */
async function flushTimers(steps = 12) {
  for (let i = 0; i < steps; i++) {
    // Run microtasks, then any pending timers, alternating so retry loops progress.
    await Promise.resolve();
    jest.runOnlyPendingTimers();
    await Promise.resolve();
  }
}

describe('http reliability layer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setTokenProvider(null);
    setUnauthorizedHandler(null);
    __resetNetworkReliability();
  });

  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('attaches a unique X-Request-Id and constant source/surface headers per request', async () => {
    const headersSeen: Record<string, string>[] = [];
    global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
      headersSeen.push({ ...(init?.headers as Record<string, string>) });
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    await http('/public-directory/categories');
    await http('/public-directory/providers');

    expect(headersSeen).toHaveLength(2);
    for (const h of headersSeen) {
      expect(h['X-Request-Id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(h['X-Serrale-Source']).toBe('mobile_app');
      expect(h['X-Serrale-Route']).toBe('basic'); // app surface, per backend contract
      expect(h['X-Serrale-App-Version']).toBeTruthy();
      expect(h['X-Serrale-Platform']).toContain('app_surface=basic');
    }
    // request ids are unique per request
    expect(headersSeen[0]['X-Request-Id']).not.toBe(headersSeen[1]['X-Request-Id']);
  });

  it('never sends PII in metadata headers', async () => {
    let captured: Record<string, string> = {};
    global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
      captured = { ...(init?.headers as Record<string, string>) };
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;
    await http('/public-directory/categories');
    const blob = JSON.stringify(captured).toLowerCase();
    expect(blob).not.toContain('phone');
    expect(blob).not.toContain('email');
    expect(blob).not.toContain('token');
  });

  it('dedupes N identical concurrent GETs into a single fetch', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 20));
      return jsonResponse(200, envelope({ n: 1 }));
    }) as unknown as typeof fetch;

    const p = Promise.all([
      http('/public-directory/categories'),
      http('/public-directory/categories'),
      http('/public-directory/categories'),
      http('/public-directory/categories'),
    ]);
    await flushTimers();
    const results = await p;

    expect(calls).toBe(1);
    expect(results).toEqual([{ n: 1 }, { n: 1 }, { n: 1 }, { n: 1 }]);
  });

  it('does NOT dedupe GETs with different query params', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    await Promise.all([
      http('/public-directory/search/suggest', { query: { q: 'plumb' } }),
      http('/public-directory/search/suggest', { query: { q: 'elect' } }),
    ]);
    expect(calls).toBe(2);
  });

  it('does NOT dedupe writes (each POST hits the network)', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 10));
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    const p = Promise.all([
      http('/public-directory/leads/request', { method: 'POST', body: { a: 1 }, skipAuthInterceptor: true }),
      http('/public-directory/leads/request', { method: 'POST', body: { a: 1 }, skipAuthInterceptor: true }),
    ]);
    await flushTimers();
    await p;
    expect(calls).toBe(2);
  });

  it('retries an eligible GET on a transient 503 and eventually succeeds', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      if (calls < 2) return jsonResponse(503, { success: false, error: { message: 'busy' } });
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    const p = http('/public-directory/providers');
    await flushTimers();
    await expect(p).resolves.toEqual({ ok: true });
    expect(calls).toBe(2);
  });

  it('retries a GET on a pure network error up to the cap, then surfaces', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    const p = http('/public-directory/providers');
    const assertion = expect(p).rejects.toThrow();
    await flushTimers();
    await assertion;
    // initial attempt + (MAX_RETRIES - 1) retries === MAX_RETRIES total attempts
    expect(calls).toBe(MAX_RETRIES);
  });

  it('never retries a write on a network error (single attempt)', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    const p = http('/public-directory/leads/request', {
      method: 'POST',
      body: { a: 1 },
      skipAuthInterceptor: true,
    });
    const assertion = expect(p).rejects.toThrow();
    await flushTimers();
    await assertion;
    expect(calls).toBe(1);
  });

  it('honors Retry-After on a 429 GET and retries exactly once after the delay', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      if (calls < 2) return jsonResponse(429, { success: false, error: { message: 'slow down' } }, { 'retry-after': '1' });
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    const p = http('/public-directory/providers');
    await flushTimers();
    await expect(p).resolves.toEqual({ ok: true });
    expect(calls).toBe(2);
  });

  it('does not retry a 429 GET without Retry-After (surfaces immediately, one call)', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      return jsonResponse(429, { success: false, error: { message: 'slow down' } });
    }) as unknown as typeof fetch;

    const p = http('/public-directory/providers');
    const assertion = expect(p).rejects.toThrow();
    await flushTimers();
    await assertion;
    expect(calls).toBe(1);
  });

  it('an aborted GET rejects and is never retried', async () => {
    let calls = 0;
    const controller = new AbortController();
    global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
      calls += 1;
      return await new Promise((_resolve, reject) => {
        const sig = init?.signal;
        if (sig?.aborted) return reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        sig?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      });
    }) as unknown as typeof fetch;

    const p = http('/public-directory/providers', { signal: controller.signal });
    const assertion = expect(p).rejects.toThrow();
    controller.abort();
    await flushTimers();
    await assertion;
    expect(calls).toBe(1); // no retry after an abort
  });

  it('one deduped subscriber aborting does NOT kill the shared GET for the others', async () => {
    let calls = 0;
    // Holder object so TS does not narrow the captured resolver to `never`.
    const fetchGate: { resolve?: (r: Response) => void } = {};
    global.fetch = jest.fn(async () => {
      calls += 1;
      return await new Promise<Response>((resolve) => {
        fetchGate.resolve = resolve;
      });
    }) as unknown as typeof fetch;

    const aborter = new AbortController();
    const shared = http('/public-directory/categories'); // no signal
    const withSignal = http('/public-directory/categories', { signal: aborter.signal }); // deduped onto `shared`

    await Promise.resolve();
    expect(calls).toBe(1); // single shared fetch

    // The signalled subscriber bails; the shared request must keep going.
    aborter.abort();
    await expect(withSignal).rejects.toThrow();

    // Resolve the underlying fetch — the non-aborted subscriber still gets data.
    fetchGate.resolve?.(jsonResponse(200, envelope({ ok: true })));
    await flushTimers();
    await expect(shared).resolves.toEqual({ ok: true });
    expect(calls).toBe(1);
  });

  it('opens the read circuit after consecutive failures and short-circuits further reads', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      return jsonResponse(503, { success: false, error: { message: 'down' } });
    }) as unknown as typeof fetch;

    // Drive enough *distinct* failing reads to trip the circuit. Each read may
    // retry per policy; we only care that the circuit trips and then blocks.
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) {
      const p = http(`/public-directory/providers`, { query: { p: i } });
      const a = expect(p).rejects.toThrow();
      await flushTimers();
      await a;
    }

    expect(getNetworkStatus().circuit).toBe('open');
    const callsBefore = calls;

    // Next read is short-circuited without touching the network.
    const blocked = http('/public-directory/providers', { query: { p: 999 } });
    const ba = expect(blocked).rejects.toThrow();
    await flushTimers();
    await ba;
    expect(calls).toBe(callsBefore); // no new fetch
  });

  it('recovers via a half-open probe after cool-down and closes on success', async () => {
    let mode: 'fail' | 'ok' = 'fail';
    global.fetch = jest.fn(async () => {
      if (mode === 'fail') return jsonResponse(503, { success: false, error: { message: 'down' } });
      return jsonResponse(200, envelope({ ok: true }));
    }) as unknown as typeof fetch;

    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) {
      const p = http(`/public-directory/providers`, { query: { p: i } });
      const a = expect(p).rejects.toThrow();
      await flushTimers();
      await a;
    }
    expect(getNetworkStatus().circuit).toBe('open');

    // Wait out the cool-down; the next read is the half-open probe.
    jest.advanceTimersByTime(CIRCUIT_COOLDOWN_MS + 1);
    mode = 'ok';
    const probe = http('/public-directory/providers', { query: { p: 'probe' } });
    await flushTimers();
    await expect(probe).resolves.toEqual({ ok: true });
    expect(getNetworkStatus().circuit).toBe('closed');
  });

  it('NEVER blocks a write (logout POST) even when the read circuit is open', async () => {
    let readCalls = 0;
    let logoutCalls = 0;
    global.fetch = jest.fn(async (url: string) => {
      if (String(url).includes('/logout')) {
        logoutCalls += 1;
        return jsonResponse(200, envelope({ ok: true }));
      }
      readCalls += 1;
      return jsonResponse(503, { success: false, error: { message: 'down' } });
    }) as unknown as typeof fetch;

    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) {
      const p = http(`/public-directory/providers`, { query: { p: i } });
      const a = expect(p).rejects.toThrow();
      await flushTimers();
      await a;
    }
    expect(getNetworkStatus().circuit).toBe('open');

    // Logout must go through regardless of the open read circuit.
    const p = http('/public-directory/customers/session/logout', {
      method: 'POST',
      body: { refresh_token: 'r' },
      skipAuthInterceptor: true,
    });
    await flushTimers();
    await expect(p).resolves.toEqual({ ok: true });
    expect(logoutCalls).toBe(1);
    void readCalls;
  });

  it('exposes network status via subscribe and notifies on circuit transitions', async () => {
    const statuses: string[] = [];
    const unsub = subscribeNetworkStatus((s) => statuses.push(s.circuit));
    global.fetch = jest.fn(async () => jsonResponse(503, { success: false, error: {} })) as unknown as typeof fetch;

    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) {
      const p = http(`/public-directory/providers`, { query: { p: i } });
      const a = expect(p).rejects.toThrow();
      await flushTimers();
      await a;
    }
    unsub();
    expect(statuses).toContain('open');
  });

  describe('route template propagation (X-Serrale-Platform)', () => {
    afterEach(() => {
      // currentRoute is module-level state not touched by
      // __resetNetworkReliability(); reset it so it can't leak into other
      // tests in this file that assert on X-Serrale-Platform.
      setCurrentRoute(undefined);
    });

    it('emits whatever setCurrentRoute is given, verbatim, as the route= segment', async () => {
      global.fetch = jest.fn(async () => jsonResponse(200, envelope({ ok: true }))) as unknown as typeof fetch;

      setCurrentRoute(segmentsToRouteTemplate(['provider', '[id]']));
      let headers: Record<string, string> = {};
      (global.fetch as jest.Mock).mockImplementationOnce(async (_url: string, init?: RequestInit) => {
        headers = { ...(init?.headers as Record<string, string>) };
        return jsonResponse(200, envelope({ ok: true }));
      });
      await http('/public-directory/providers');

      // Template form only — no concrete id ever substituted in.
      expect(headers['X-Serrale-Platform']).toBe('app_surface=basic; route=/provider/[id]');
    });

    it('never contains a concrete resolved path, only the template form', async () => {
      let headers: Record<string, string> = {};
      global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
        headers = { ...(init?.headers as Record<string, string>) };
        return jsonResponse(200, envelope({ ok: true }));
      }) as unknown as typeof fetch;

      // Simulates what _layout.tsx's useSegments() effect would feed in for a
      // concrete visit to e.g. /provider/42 — the dynamic segment stays literal.
      setCurrentRoute(segmentsToRouteTemplate(['provider', '[id]']));
      await http('/public-directory/providers');

      expect(headers['X-Serrale-Platform']).not.toContain('/provider/42');
      expect(headers['X-Serrale-Platform']).toContain('/provider/[id]');
    });

    it('falls back to "unknown" when no route has been set', async () => {
      let headers: Record<string, string> = {};
      global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
        headers = { ...(init?.headers as Record<string, string>) };
        return jsonResponse(200, envelope({ ok: true }));
      }) as unknown as typeof fetch;

      setCurrentRoute(undefined);
      await http('/public-directory/categories');

      expect(headers['X-Serrale-Platform']).toBe('app_surface=basic; route=unknown');
    });
  });

  describe('segmentsToRouteTemplate (segments → route template join helper)', () => {
    it('joins nested segments into a slash-delimited template', () => {
      expect(segmentsToRouteTemplate(['(tabs)', 'home'])).toBe('/(tabs)/home');
    });

    it('preserves dynamic-segment brackets literally (no param substitution)', () => {
      expect(segmentsToRouteTemplate(['provider', '[id]'])).toBe('/provider/[id]');
    });

    it('maps the root route (empty segments) to "/"', () => {
      expect(segmentsToRouteTemplate([])).toBe('/');
    });

    it('handles a single top-level segment', () => {
      expect(segmentsToRouteTemplate(['providers'])).toBe('/providers');
    });
  });
});
