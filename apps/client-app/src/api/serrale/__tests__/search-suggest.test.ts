import { MIN_SUGGEST_LENGTH, searchSuggest, SUGGEST_LIMIT } from '../search';
import { http } from '../../../lib/http';

jest.mock('../../../lib/http', () => ({
  http: jest.fn(),
  __esModule: true,
}));

const mockHttp = http as jest.MockedFunction<typeof http>;

beforeEach(() => {
  mockHttp.mockReset();
});

describe('searchSuggest — object envelope (M-7)', () => {
  it('adapts the { query, normalizedQuery, suggestions } OBJECT the backend returns', async () => {
    mockHttp.mockResolvedValue({
      query: 'plum',
      normalizedQuery: 'plum',
      suggestions: [
        { type: 'category', label: 'Plumbers', label_am: 'ቧንቧ ሰራተኞች', slug: 'plumbers', providerCount: 4 },
        { type: 'need', label: 'Fix a water leak', categorySlug: 'plumbers' },
      ],
    } as never);

    const out = await searchSuggest('plum');
    expect(out).toEqual([
      { type: 'category', label: 'Plumbers', labelAm: 'ቧንቧ ሰራተኞች', categorySlug: 'plumbers', reason: undefined, providerCount: 4 },
      { type: 'need', label: 'Fix a water leak', labelAm: undefined, categorySlug: 'plumbers', reason: undefined, providerCount: undefined },
    ]);
    expect(mockHttp).toHaveBeenCalledWith('/public-directory/search/suggest', expect.objectContaining({ query: { q: 'plum' } }));
  });

  it('caps results at six', async () => {
    mockHttp.mockResolvedValue({
      suggestions: Array.from({ length: 9 }, (_, i) => ({ type: 'need', label: `Need ${i}` })),
    } as never);
    const out = await searchSuggest('clean');
    expect(out).toHaveLength(SUGGEST_LIMIT);
    expect(SUGGEST_LIMIT).toBe(6);
  });

  it('short-circuits below the minimum useful query length without a request', async () => {
    expect(MIN_SUGGEST_LENGTH).toBe(2);
    await expect(searchSuggest('p')).resolves.toEqual([]);
    await expect(searchSuggest('  ')).resolves.toEqual([]);
    expect(mockHttp).not.toHaveBeenCalled();
  });

  it('drops rows without a usable label and handles the fallback row', async () => {
    mockHttp.mockResolvedValue({
      suggestions: [
        { type: 'fallback_request_help', label: 'Request help', label_am: 'እርዳታ ይጠይቁ', reason: 'We could not match your search.' },
        { type: 'need', label: '   ' },
        { type: 'need' },
      ],
    } as never);
    const out = await searchSuggest('zzz');
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('fallback_request_help');
    expect(out[0].reason).toContain('could not match');
  });

  it('forwards the caller AbortSignal to the http layer (cancellation)', async () => {
    mockHttp.mockResolvedValue({ suggestions: [] } as never);
    const controller = new AbortController();
    await searchSuggest('paint', controller.signal);
    expect(mockHttp.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
});
