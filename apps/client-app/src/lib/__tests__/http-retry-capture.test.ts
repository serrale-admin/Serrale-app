/**
 * Guards the two ADDITIVE http.ts behaviors this branch relies on (flagged for
 * the parallel http.ts rework — if that rewrite drops either, this goes red):
 *
 *   1. `RequestOptions.headers` is forwarded onto the fetch (Idempotency-Key).
 *   2. A 429 response's raw retry signals (error-body fields + Retry-After /
 *      RateLimit-Reset headers) are captured onto `HttpError.retryRaw`.
 *
 * `fetch` is mocked at the network boundary, same convention as
 * http-interceptor.test.ts.
 */
import { http, HttpError } from '../http';
import { retryInfoFromError } from '../otp-retry';
import { requestOtp } from '../../api/serrale/auth';

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  const lower = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
    headers: { get: (name: string) => lower.get(String(name).toLowerCase()) ?? null },
  } as unknown as Response;
}

afterEach(() => {
  (global.fetch as jest.Mock | undefined)?.mockReset?.();
});

describe('http() 429 raw retry capture', () => {
  it('captures error-body fields and retry headers onto HttpError.retryRaw', async () => {
    const nextAllowed = new Date(Date.now() + 300_000).toISOString();
    global.fetch = jest.fn(async () =>
      jsonResponse(
        429,
        {
          success: false,
          error: {
            code: 'OTP_PHONE_RATE_LIMITED',
            message: 'Too many OTP requests.',
            retry_after_seconds: 300,
            next_allowed_at: nextAllowed,
          },
        },
        { 'Retry-After': '300' },
      ),
    ) as unknown as typeof fetch;

    let thrown: unknown;
    try {
      await http('/public-directory/otp/request', { method: 'POST', body: {}, skipAuthInterceptor: true });
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(HttpError);
    const err = thrown as HttpError;
    expect(err.status).toBe(429);
    expect(err.code).toBe('OTP_PHONE_RATE_LIMITED');
    expect(err.retryRaw).toBeDefined();
    expect(err.retryRaw?.retryAfter).toBe('300');
    // End-to-end: the captured raw signals parse into a usable wait.
    const info = retryInfoFromError(err);
    expect(info.seconds).toBe(300);
    expect(info.nextAllowedAt).toBe(nextAllowed);
  });

  it('captures RateLimit-Reset when Retry-After is absent (IP limiter shape)', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(
        429,
        { success: false, error: { code: 'OTP_IP_RATE_LIMITED', message: 'Too many.' } },
        { 'RateLimit-Reset': '75' },
      ),
    ) as unknown as typeof fetch;

    await expect(http('/x', { skipAuthInterceptor: true })).rejects.toMatchObject({
      status: 429,
      retryRaw: expect.objectContaining({ rateLimitReset: '75' }),
    });
  });

  it('leaves retryRaw undefined for non-429 errors', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(400, { success: false, error: { code: 'INVALID_PHONE', message: 'Invalid.' } }),
    ) as unknown as typeof fetch;

    let thrown: unknown;
    try {
      await http('/x', { skipAuthInterceptor: true });
    } catch (e) {
      thrown = e;
    }
    expect((thrown as HttpError).retryRaw).toBeUndefined();
  });
});

describe('requestOtp Idempotency-Key header', () => {
  it('sends the key as an Idempotency-Key request header with the normalized phone', async () => {
    let captured: { url: string; init?: RequestInit } | null = null;
    global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      captured = { url: String(url), init };
      return jsonResponse(200, {
        success: true,
        data: { challenge_id: 'c-1', expires_at: new Date().toISOString() },
      });
    }) as unknown as typeof fetch;

    await requestOtp('0912 345 678', 'directory_customer_request', 'otp_abc123');

    expect(captured).not.toBeNull();
    const sent = captured as unknown as { url: string; init?: RequestInit };
    const headers = sent.init?.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('otp_abc123');
    expect(JSON.parse(String(sent.init?.body))).toEqual({
      phone: '+251912345678',
      purpose: 'directory_customer_request',
    });
  });

  it('omits the header when no key is provided', async () => {
    let sentHeaders: Record<string, string> | undefined;
    global.fetch = jest.fn(async (_url: string, init?: RequestInit) => {
      sentHeaders = init?.headers as Record<string, string>;
      return jsonResponse(200, {
        success: true,
        data: { challenge_id: 'c-2', expires_at: new Date().toISOString() },
      });
    }) as unknown as typeof fetch;

    await requestOtp('0912345678', 'directory_customer_request');

    expect(sentHeaders?.['Idempotency-Key']).toBeUndefined();
  });
});
