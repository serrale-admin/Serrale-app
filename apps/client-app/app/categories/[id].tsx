import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chip from '../../src/components/Chip';
import FilterSheet from '../../src/components/FilterSheet';
import ProviderRow from '../../src/components/ProviderRow';
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
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={6} accessibilityLabel="Back">
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>
            {cat ? (am ? cat.am : cat.name) : ''}
          </Text>
          <Text style={styles.sub}>{cat ? fmt(cat.count) : ''} providers near {area}</Text>
        </View>
        <Pressable style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Icon name="ph-sliders-horizontal" size={15} color={colors.green800} weight="bold" />
          <Text style={styles.filterBtnText}>Filter</Text>
          {filterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

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
        <Pressable style={styles.sortBtn} onPress={cycleSort}>
          <Icon name="ph-sliders-horizontal" size={14} color={colors.green800} weight="bold" />
          <Text style={styles.sortText}>{sort}</Text>
        </Pressable>
      </View>

      {providers.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.green800} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {results.map((p) => <ProviderRow key={p.id} provider={p} />)}
          {results.length === 0 && (
            <View style={styles.empty}>
              <Icon name="ph-magnifying-glass" size={42} color="#bcc6bf" />
              <Text style={styles.emptyTitle}>No providers found</Text>
              <Text style={styles.emptyText}>Try another area or request help and we will look for a provider.</Text>
              <Pressable style={styles.goldBtn} onPress={() => router.push('/(tabs)/request')}>
                <Text style={styles.goldText}>Request service</Text>
              </Pressable>
            </View>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 8, paddingRight: 12, paddingBottom: 10 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  sub: { fontSize: 12, color: colors.muted, fontFamily: fonts.regular },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', borderRadius: radius.sm + 2, backgroundColor: colors.surface },
  filterBtnText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.green800 },
  badge: { minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 999, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#5e4708', fontSize: 10, fontFamily: fonts.bold },
  subRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  resultCount: { fontSize: 12.5, color: colors.muted, fontFamily: fonts.regular },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.green800 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, marginTop: 14 },
  emptyText: { fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 20, textAlign: 'center', fontFamily: fonts.regular },
  goldBtn: { marginTop: 16, height: 42, paddingHorizontal: 20, borderRadius: radius.md, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  goldText: { color: colors.text, fontSize: 13.5, fontFamily: fonts.bold },
});
