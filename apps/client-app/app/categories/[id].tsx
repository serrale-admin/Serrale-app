import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import Chip from '../../src/components/Chip';
import EmptyState from '../../src/components/EmptyState';
import ErrorBlock from '../../src/components/ErrorBlock';
import FilterSheet from '../../src/components/FilterSheet';
import ProviderRow from '../../src/components/ProviderRow';
import ScreenHeader from '../../src/components/ScreenHeader';
import { SkeletonProviderList } from '../../src/components/Skeleton';
import { useCategory, useProviders } from '../../src/hooks/queries';
import { fmt } from '../../src/lib/format';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const am = useAppStore((s) => s.lang) === 'am';
  const area = useAppStore((s) => s.area);
  const filters = useAppStore((s) => s.filters);
  const filterCount = useAppStore((s) => s.activeFilterCount)();

  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const category = useCategory(id);
  const cat = category.data;
  // No sort control: the backend orders results itself and exposes no sort
  // param (contract matrix M-4), so the UI does not offer illusory sorting.
  const query = useMemo(() => ({ categoryId: id, area, filters }), [id, area, filters]);
  const providers = useProviders(query);
  const results = providers.data?.items ?? [];
  const total = providers.data?.total ?? results.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={cat ? (am ? cat.am : cat.name) : ''}
        subtitle={cat ? `${fmt(cat.count)} providers near ${area}` : `Providers near ${area}`}
        right={
          <Pressable style={styles.filterBtn} onPress={() => setShowFilter(true)} accessibilityRole="button" accessibilityLabel="Filters">
            <Icon name="ph-sliders-horizontal" size={15} color={colors.green800} weight="bold" />
            <Text style={styles.filterBtnText}>Filter</Text>
            {filterCount > 0 && <Badge label={filterCount} tone="count" />}
          </Pressable>
        }
      />

      {/* Subcategory chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow} style={{ flexGrow: 0 }}>
        {(cat?.subs || []).map((sub) => (
          <Chip key={sub} label={sub} active={activeSub === sub} onPress={() => setActiveSub(activeSub === sub ? null : sub)} />
        ))}
      </ScrollView>

      {/* Result count row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>
          <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{total}</Text> providers
        </Text>
      </View>

      {providers.isLoading ? (
        <View style={styles.list}>
          <SkeletonProviderList />
        </View>
      ) : providers.isError ? (
        <ErrorBlock
          title="Couldn't load providers"
          text="Please check your connection and try again."
          onRetry={() => providers.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {results.map((p) => <ProviderRow key={p.id} provider={p} />)}
          {results.length === 0 && (
            <EmptyState
              icon="ph-magnifying-glass"
              circle={colors.soft}
              title="No providers found"
              text="Try another area or request help and we will look for a provider."
            >
              <Button label="Request service" variant="gold" size="sm" onPress={() => router.push('/(tabs)/request')} style={styles.emptyCta} />
            </EmptyState>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} baseQuery={query} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.borderField, borderRadius: radius.sm + 2, backgroundColor: colors.surface },
  filterBtnText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.green800 },
  subRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  resultCount: { fontSize: 12.5, color: colors.muted, fontFamily: fonts.regular },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  emptyCta: { marginTop: 16 },
});
