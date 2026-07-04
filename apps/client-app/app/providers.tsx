import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../src/components/Badge';
import Button from '../src/components/Button';
import Chip from '../src/components/Chip';
import EmptyState from '../src/components/EmptyState';
import ErrorBlock from '../src/components/ErrorBlock';
import { TextField } from '../src/components/Field';
import FilterSheet from '../src/components/FilterSheet';
import LocationSheet from '../src/components/LocationSheet';
import ProviderRow from '../src/components/ProviderRow';
import { SkeletonProviderList } from '../src/components/Skeleton';
import { useProviders } from '../src/hooks/queries';
import { Icon } from '../src/lib/icons';
import { colors, fonts } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

const QUICK = [
  { kind: 'verified', label: 'Verified', icon: 'ph-seal-check' },
  { kind: 'today', label: 'Available today', icon: 'ph-clock' },
  { kind: 'near', label: 'Near me', icon: 'ph-map-pin' },
  { kind: 'rating4', label: 'Rating 4+', icon: 'ph-star' },
  { kind: 'whatsapp', label: 'WhatsApp', icon: 'ph-whatsapp-logo' },
];

/**
 * Provider results list (free-text search + filters across all providers).
 * Relocated here from the Search tab, which now hosts the Categories browser.
 * Same API hooks, filters, and provider actions — no behavior change.
 */
export default function ProvidersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; categoryId?: string }>();
  const area = useAppStore((s) => s.area);
  const setArea = useAppStore((s) => s.setArea);
  const filters = useAppStore((s) => s.filters);
  const toggleQuick = useAppStore((s) => s.toggleQuick);
  const filterCount = useAppStore((s) => s.activeFilterCount)();

  const [search, setSearch] = useState(typeof params.q === 'string' ? params.q : '');
  const [showFilter, setShowFilter] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  const query = useMemo(
    () => ({ search, categoryId, area, filters, sort: 'Recommended' as const }),
    [search, categoryId, area, filters],
  );
  const providers = useProviders(query);
  const results = providers.data?.items ?? [];
  const total = providers.data?.total ?? 0;
  const suffix = search ? ` for "${search}"` : ` near ${area}`;

  const isQuickOn = (kind: string): boolean => {
    if (kind === 'verified') return filters.trust.includes('Verified only');
    if (kind === 'today') return filters.avail.includes('Available today');
    if (kind === 'near') return filters.areas.includes(area);
    if (kind === 'rating4') return filters.rating === '4.0+';
    if (kind === 'whatsapp') return filters.contact.includes('WhatsApp available');
    return false;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search field with back */}
      <View style={styles.headerWrap}>
        <View style={styles.searchRow}>
          <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
            <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
          </Pressable>
          <TextField
            icon="ph-magnifying-glass"
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search plumber, painter, nanny…"
            autoFocus={!search}
            returnKeyType="search"
            containerStyle={styles.field}
          />
        </View>
        <View style={styles.filterRow}>
          <Pressable style={styles.softChip} onPress={() => setShowLocation(true)}>
            <Icon name="ph-map-pin" size={13} color={colors.success} weight="fill" />
            <Text style={styles.softChipText}>{area}</Text>
            <Icon name="ph-caret-down" size={10} color={colors.muted} weight="bold" />
          </Pressable>
          <Pressable style={styles.softChip} onPress={() => setShowFilter(true)} accessibilityRole="button" accessibilityLabel="Filters">
            <Icon name="ph-sliders-horizontal" size={14} color={colors.green800} weight="bold" />
            <Text style={[styles.softChipText, { color: colors.green800 }]}>Filter</Text>
            {filterCount > 0 && <Badge label={filterCount} tone="count" />}
          </Pressable>
        </View>
      </View>

      {/* Count + quick chips */}
      <View style={styles.countWrap}>
        <Text style={styles.count}>
          <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{total}</Text> providers{suffix}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
          {QUICK.map((q) => (
            <Chip key={q.kind} label={q.label} iconName={q.icon} active={isQuickOn(q.kind)} height={30} onPress={() => toggleQuick(q.kind)} />
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {providers.isLoading ? (
        <View style={styles.results}>
          <SkeletonProviderList />
        </View>
      ) : providers.isError ? (
        <ErrorBlock
          title="Couldn't load providers"
          text="Please check your connection and try again."
          onRetry={() => providers.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
          {results.map((p) => <ProviderRow key={p.id} provider={p} />)}
          {results.length === 0 && (
            <EmptyState
              icon="ph-magnifying-glass"
              circle={colors.soft}
              title="No providers found yet"
              text="Try another area or request help and we will look for a provider."
            >
              <View style={styles.emptyActions}>
                <Button label="Change filters" variant="secondary" size="sm" onPress={() => setShowFilter(true)} />
                <Button label="Request service" variant="gold" size="sm" onPress={() => router.push('/(tabs)/request')} />
              </View>
            </EmptyState>
          )}
        </ScrollView>
      )}

      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} baseQuery={query} />
      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  back: { width: 36, height: 44, marginLeft: -8, alignItems: 'center', justifyContent: 'center' },
  field: { flex: 1, height: 46 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  softChip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.borderField, backgroundColor: colors.surface },
  softChipText: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text },
  countWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  count: { fontSize: 13.5, color: colors.muted, marginBottom: 9, fontFamily: fonts.regular },
  results: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 10 },
  emptyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center', marginTop: 18 },
});
