import { HttpError, http, isUnauthenticatedPublicRead, setTokenProvider, __resetNetworkReliability } from '../http';

describe('isUnauthenticatedPublicRead', () => {
  it('marks catalog GETs as public (no Bearer should attach)', () => {
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/categories')).toBe(true);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/providers')).toBe(true);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/providers?limit=5')).toBe(true);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/providers/abc-123')).toBe(true);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/search')).toBe(true);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/search/suggest')).toBe(true);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/providers/abc-123/reviews')).toBe(true);
  });

  it('keeps authenticated provider/customer account routes private', () => {
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/providers/me')).toBe(false);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/providers/me/photo')).toBe(false);
    expect(isUnauthenticatedPublicRead('GET', '/public-directory/customers/me')).toBe(false);
    expect(isUnauthenticatedPublicRead('POST', '/public-directory/providers')).toBe(false);
    expect(isUnauthenticatedPublicRead('POST', '/public-directory/otp/request')).toBe(false);
    expect(
      isUnauthenticatedPublicRead('GET', '/public-directory/providers/abc-123/reviews/eligibility'),
    ).toBe(false);
  });
});

describe('public catalog GETs never attach customer Bearer', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    __resetNetworkReliability();
    setTokenProvider(async () => 'customer-access-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setTokenProvider(null);
    __resetNetworkReliability();
  });

  it('omits Authorization on /providers and /categories even when a session exists', async () => {
    const seen: string[] = [];
    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers as HeadersInit);
      seen.push(headers.get('Authorization') || '');
      return {
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { providers: [], total: 0, counts: {} } }),
        headers: { get: () => null },
      } as unknown as Response;
    }) as typeof fetch;

    await http('/public-directory/providers', { query: { limit: 1 } });
    await http('/public-directory/categories');
    expect(seen).toEqual(['', '']);
  });

  it('still attaches Authorization for /customers/me', async () => {
    let auth: string | null = null;
    global.fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers as HeadersInit);
      auth = headers.get('Authorization');
      return {
        status: 200,
        ok: true,
        text: async () => JSON.stringify({
          success: true,
          data: { customer: { id: 'c1', phone: '+251911000000' } },
        }),
        headers: { get: () => null },
      } as unknown as Response;
    }) as typeof fetch;

    await http('/public-directory/customers/me');
    expect(auth).toBe('Bearer customer-access-token');
  });
});

describe('http catch-all 404 envelope parsing', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    __resetNetworkReliability();
    setTokenProvider(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    __resetNetworkReliability();
  });

  it('extracts NOT_FOUND code + human message from legacy catch-all shape', async () => {
    global.fetch = jest.fn(async () => {
      return {
        status: 404,
        ok: false,
        text: async () =>
          JSON.stringify({
            error: 'NOT_FOUND',
            message: 'Endpoint /api/public-directory/providers/x/reviews does not exist on this server.',
            hint: 'Ensure you are using the correct HTTP method and path.',
          }),
        headers: { get: () => null },
      } as unknown as Response;
    }) as typeof fetch;

    await expect(
      http('/public-directory/providers/x/reviews', { method: 'POST', body: { rating: 5 } }),
    ).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      code: 'NOT_FOUND',
      message: 'Endpoint /api/public-directory/providers/x/reviews does not exist on this server.',
    } satisfies Partial<HttpError>);
  });
});
