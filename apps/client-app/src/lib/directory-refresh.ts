import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { ColorValue } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useLabels } from './labels';
import { colors } from './theme';

/** Shared RefreshControl colors — SERRALE green spinner on iOS/Android. */
export const directoryRefreshProps: {
  tintColor: ColorValue;
  colors: ColorValue[];
  progressBackgroundColor: ColorValue;
} = {
  tintColor: colors.green700,
  colors: [colors.green700],
  progressBackgroundColor: colors.surface,
};

/** Keep the spinner up long enough to read as intentional feedback. */
const MIN_REFRESH_MS = 450;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Directory pull-to-refresh / header refresh.
 *
 * Invalidates the given React Query keys (active observers refetch), keeps a
 * local `refreshing` flag for RefreshControl + button spinners, and toasts the
 * outcome. A busy-ref guards against double-taps while the first run is in flight.
 */
export function usePullToRefresh(...queryKeys: QueryKey[]) {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);
  const labels = useLabels();
  const [refreshing, setRefreshing] = useState(false);
  const keysRef = useRef(queryKeys);
  keysRef.current = queryKeys;
  const busyRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setRefreshing(true);
    const started = Date.now();
    let failed = false;
    try {
      // invalidateQueries marks stale and awaits active refetches (default refetchType).
      await Promise.all(
        keysRef.current.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      failed = keysRef.current.some((queryKey) =>
        queryClient
          .getQueryCache()
          .findAll({ queryKey })
          .some((query) => query.state.status === 'error'),
      );
    } catch {
      failed = true;
    } finally {
      const remaining = MIN_REFRESH_MS - (Date.now() - started);
      if (remaining > 0) await sleep(remaining);
      setRefreshing(false);
      busyRef.current = false;
    }
    if (failed) {
      showToast(labels.common.refreshFailed, 'ph-warning-circle');
    } else {
      showToast(labels.common.refreshed, 'ph-arrow-clockwise');
    }
  }, [queryClient, showToast, labels.common.refreshFailed, labels.common.refreshed]);

  return { refreshing, onRefresh };
}
