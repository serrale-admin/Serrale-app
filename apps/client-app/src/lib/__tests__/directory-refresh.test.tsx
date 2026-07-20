import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { usePullToRefresh } from '../directory-refresh';
import { useAppStore } from '../../store/appStore';

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('usePullToRefresh', () => {
  beforeEach(() => {
    useAppStore.getState().hideToast();
    jest.useFakeTimers();
  });

  afterEach(() => {
    useAppStore.getState().hideToast();
    jest.useRealTimers();
  });

  it('sets refreshing, invalidates active queries, then toasts success', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    let calls = 0;
    const observer = new QueryObserver(client, {
      queryKey: ['categories'],
      queryFn: async () => {
        calls += 1;
        return [{ id: `v${calls}` }];
      },
    });
    const unsub = observer.subscribe(() => undefined);
    await act(async () => {
      await observer.refetch();
    });
    const callsAfterMount = calls;

    const { result } = renderHook(() => usePullToRefresh(['categories']), {
      wrapper: wrapperFor(client),
    });
    expect(result.current.refreshing).toBe(false);

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.onRefresh();
    });
    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(500);
      await pending;
    });

    expect(result.current.refreshing).toBe(false);
    expect(calls).toBeGreaterThan(callsAfterMount);
    expect(useAppStore.getState().toast?.text).toMatch(/updated|ተዘም/i);

    unsub();
  });

  it('toasts failure when invalidated queries end in error', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const observer = new QueryObserver(client, {
      queryKey: ['categories'],
      queryFn: async () => {
        throw new Error('network down');
      },
    });
    const unsub = observer.subscribe(() => undefined);
    await act(async () => {
      await observer.refetch();
    });

    const { result } = renderHook(() => usePullToRefresh(['categories']), {
      wrapper: wrapperFor(client),
    });

    await act(async () => {
      const pending = result.current.onRefresh();
      await jest.advanceTimersByTimeAsync(500);
      await pending;
    });

    expect(useAppStore.getState().toast?.text).toMatch(/couldn.?t refresh|ማደስ አልተቻለም/i);
    unsub();
  });
});
