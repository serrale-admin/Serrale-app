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
import type { SortKey } from '../../src/types';

const SORTS: SortKey[] = ['Recommended', 'Rating', 'Nearest', 'Recently added'];

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const am = useAppStore((s) => s.lang) === 'am';
  const area = useAppStore((s) => s.area);
  const filters = useAppStore((s) => s.filters);
  const filterCount = useAppStore((s) => s.activeFilterCount)();
  const showToast = useAppStore((s) => s.showToast);

  const [sort, setSort] = useState<SortKey>('Recommended');
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const category = useCategory(id);
  const cat = category.data;
  const query = useMemo(() => ({ categoryId: id, area, filters, sort }), [id, area, filters, sort]);
  const providers = useProviders(query);
  const results = providers.data?.items ?? [];

  const cycleSort = () => {
    const next = SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length];
    setSort(next);
    showToast('Sorted by ' + next, 'ph-sliders-horizontal');
  };

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

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>
          <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{results.length}</Text> providers
        </Text>
        <Pressable style={styles.sortBtn} onPress={cycleSort} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Sort: ${sort}`}>
          <Icon name="ph-sliders-horizontal" size={14} color={colors.green800} weight="bold" />
          <Text style={styles.sortText}>{sort}</Text>
        </Pressable>
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
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.green800 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  emptyCta: { marginTop: 16 },
});
