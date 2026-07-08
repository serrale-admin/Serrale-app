import { useRouter } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../src/components/Button';
import EmptyState from '../src/components/EmptyState';
import ErrorBlock from '../src/components/ErrorBlock';
import ProviderRow from '../src/components/ProviderRow';
import ScreenHeader from '../src/components/ScreenHeader';
import { SkeletonProviderList } from '../src/components/Skeleton';
import * as api from '../src/api';
import { useLabels } from '../src/lib/labels';
import { colors } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

export default function BookmarksScreen() {
  const router = useRouter();
  const labels = useLabels();
  const saved = useAppStore((s) => s.saved);
  const savedIds = Object.keys(saved);
  const providerQueries = useQueries({
    queries: savedIds.map((id) => ({
      queryKey: ['provider', id],
      queryFn: () => api.getProvider(id),
      enabled: !!id,
    })),
  });
  const list = providerQueries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const isLoading = savedIds.length > 0 && providerQueries.some((q) => q.isLoading);
  const isError = savedIds.length > 0 && list.length === 0 && providerQueries.some((q) => q.isError);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={labels.common.savedProviders} />
      {isLoading ? (
        <View style={styles.list}>
          <SkeletonProviderList count={4} />
        </View>
      ) : isError ? (
        <View style={styles.emptyWrap}>
          <ErrorBlock
            error={providerQueries.find((q) => q.isError)?.error}
            onRetry={() => providerQueries.forEach((q) => q.refetch())}
            onAction={() => router.replace({ pathname: '/auth/login', params: { next: '/bookmarks' } })}
          />
        </View>
      ) : list.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {list.map((p) => <ProviderRow key={p.id} provider={p} />)}
          <View style={{ height: 20 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="ph-bookmark-simple"
            circle={colors.goldSoft}
            iconColor={colors.goldText}
            title={labels.bookmarks.emptyTitle}
            text={labels.bookmarks.emptyText}
          >
            <Button label={labels.common.browseProviders} onPress={() => router.push('/providers')} style={styles.cta} />
          </EmptyState>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, gap: 10 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  cta: { marginTop: 20, paddingHorizontal: 22 },
});
