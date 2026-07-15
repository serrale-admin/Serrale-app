import { renderHook, act } from '@testing-library/react-native';
import { usePullToRefresh } from '../directory-refresh';

describe('usePullToRefresh', () => {
  it('sets refreshing while refetchers run and clears after', async () => {
    let resolveA!: () => void;
    const a = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveA = resolve;
        }),
    );
    const b = jest.fn(async () => undefined);

    const { result } = renderHook(() => usePullToRefresh(a, b));
    expect(result.current.refreshing).toBe(false);

    let done!: () => void;
    const finished = new Promise<void>((resolve) => {
      done = resolve;
    });
    act(() => {
      void result.current.onRefresh().then(done);
    });
    expect(result.current.refreshing).toBe(true);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveA();
      await finished;
    });
    expect(result.current.refreshing).toBe(false);
  });
});
