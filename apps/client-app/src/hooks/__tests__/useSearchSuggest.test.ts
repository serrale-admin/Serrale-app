import { act, renderHook } from '@testing-library/react-native';
import { __clearSuggestCache, SUGGEST_DEBOUNCE_MS, useSearchSuggest } from '../useSearchSuggest';
import * as api from '../../api';
import type { SearchSuggestion } from '../../api';

jest.mock('../../api', () => ({
  __esModule: true,
  searchSuggest: jest.fn(),
  MIN_SUGGEST_LENGTH: 2,
}));

const mockSuggest = api.searchSuggest as jest.MockedFunction<typeof api.searchSuggest>;

const row = (label: string): SearchSuggestion => ({ type: 'category', label, categorySlug: label.toLowerCase() });

/** Deferred promise helper so tests control exactly when a fetch resolves. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  jest.useFakeTimers();
  mockSuggest.mockReset();
  __clearSuggestCache();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useSearchSuggest', () => {
  it('debounces 300 ms and fires exactly one request per settled query', async () => {
    mockSuggest.mockResolvedValue([row('Plumbers')]);
    const { result, rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: '' } });

    rerender({ q: 'pl' });
    act(() => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS - 1);
    });
    expect(mockSuggest).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(mockSuggest).toHaveBeenCalledTimes(1);
    expect(mockSuggest.mock.calls[0][0]).toBe('pl');
    expect(result.current.suggestions).toEqual([row('Plumbers')]);
    expect(result.current.loading).toBe(false);
  });

  it('restarts the debounce while typing — only the final query is fetched', async () => {
    mockSuggest.mockResolvedValue([row('Cleaners')]);
    const { rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: '' } });

    rerender({ q: 'cl' });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    rerender({ q: 'cle' });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    rerender({ q: 'clea' });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });

    expect(mockSuggest).toHaveBeenCalledTimes(1);
    expect(mockSuggest.mock.calls[0][0]).toBe('clea');
  });

  it('skips queries below the minimum useful length', () => {
    const { result, rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: 'p' } });
    act(() => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS * 2);
    });
    expect(mockSuggest).not.toHaveBeenCalled();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.loading).toBe(false);

    rerender({ q: '' });
    expect(result.current.suggestions).toEqual([]);
  });

  it('NEVER shows a stale result for a different query (cancellation)', async () => {
    const slow = deferred<SearchSuggestion[]>();
    const fast = deferred<SearchSuggestion[]>();
    mockSuggest.mockImplementationOnce(() => slow.promise).mockImplementationOnce(() => fast.promise);

    const { result, rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: 'paint' } });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });
    expect(mockSuggest).toHaveBeenCalledTimes(1);

    // Query changes before the first request resolves → first must be discarded.
    rerender({ q: 'welder' });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });
    expect(mockSuggest).toHaveBeenCalledTimes(2);

    // The OLD query's response lands late: it must not render.
    await act(async () => {
      slow.resolve([row('Painters')]);
    });
    expect(result.current.suggestions).toEqual([]);

    await act(async () => {
      fast.resolve([row('Welders')]);
    });
    expect(result.current.suggestions).toEqual([row('Welders')]);
  });

  it('aborts the in-flight request when the query changes', async () => {
    const never = deferred<SearchSuggestion[]>();
    mockSuggest.mockImplementation(() => never.promise);

    const { rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: 'garden' } });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });
    const signal = mockSuggest.mock.calls[0][1] as AbortSignal;
    expect(signal.aborted).toBe(false);

    rerender({ q: 'gardener help' });
    expect(signal.aborted).toBe(true);
  });

  it('serves a recent query from the brief cache without refetching', async () => {
    mockSuggest.mockResolvedValue([row('Nannies')]);
    const { result, rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: 'na' } });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });
    expect(mockSuggest).toHaveBeenCalledTimes(1);

    rerender({ q: 'nan' });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });
    expect(mockSuggest).toHaveBeenCalledTimes(2);

    // Back to the first query: instant cache hit, no third request.
    rerender({ q: 'na' });
    act(() => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS * 2);
    });
    expect(mockSuggest).toHaveBeenCalledTimes(2);
    expect(result.current.suggestions).toEqual([row('Nannies')]);
    expect(result.current.loading).toBe(false);
  });

  it('fails silent: a fetch error yields empty suggestions, no crash', async () => {
    mockSuggest.mockRejectedValue(new Error('suggest down'));
    const { result, rerender } = renderHook(({ q }: { q: string }) => useSearchSuggest(q), { initialProps: { q: '' } });
    rerender({ q: 'mason' });
    await act(async () => {
      jest.advanceTimersByTime(SUGGEST_DEBOUNCE_MS);
    });
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
