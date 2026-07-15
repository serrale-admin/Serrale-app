import type { ColorValue } from 'react-native';
import { useCallback, useRef, useState } from 'react';
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

/**
 * Local refreshing flag + async handler that awaits every query refetch.
 * Uses a ref for refetchers so parent re-renders do not recreate onRefresh.
 */
export function usePullToRefresh(...refetchers: Array<() => Promise<unknown>>) {
  const [refreshing, setRefreshing] = useState(false);
  const refetchersRef = useRef(refetchers);
  refetchersRef.current = refetchers;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(refetchersRef.current.map((fn) => fn()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { refreshing, onRefresh };
}
