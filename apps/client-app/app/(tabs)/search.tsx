import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chip from '../../src/components/Chip';
import EmptyState from '../../src/components/EmptyState';
import FilterSheet from '../../src/components/FilterSheet';
import LocationSheet from '../../src/components/LocationSheet';
import ProviderRow from '../../src/components/ProviderRow';
import { useProviders } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

const QUICK = [
  { kind: 'verified', label: 'Verified', icon: 'ph-seal-check' },
  { kind: 'today', label: 'Available today', icon: 'ph-clock' },
  { kind: 'near', label: 'Near me', icon: 'ph-map-pin' },
  { kind: 'rating4', label: 'Rating 4+', icon: 'ph-star' },
  { kind: 'whatsapp', label: 'WhatsApp', icon: 'ph-whatsapp-logo' },
];

export default function SearchScreen() {
  const router = useRouter();
  const area = useAppStore((s) => s.area);
  const setArea = useAppStore((s) => s.setArea);
  const filters = useAppStore((s) => s.filters);
  const toggleQuick = useAppStore((s) => s.toggleQuick);
  const filterCount = useAppStore((s) => s.activeFilterCount)();

  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const query = useMemo(() => ({ search, area, filters, sort: 'Recommended' as const }), [search, area, filters]);
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
      {/* Search field */}
      <View style={styles.headerWrap}>
        <View style={styles.searchRow}>
          <View style={styles.field}>
            <Icon name="ph-magnifying-glass" size={17} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search services"
              placeholderTextColor={colors.faint}
              style={styles.input}
              autoFocus
              returnKeyType="search"
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Icon name="ph-x-circle" size={17} color="#bcc6bf" weight="fill" />
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.filterRow}>
          <Pressable style={styles.softChip} onPress={() => setShowLocation(true)}>
            <Icon name="ph-map-pin" size={13} color={colors.success} weight="fill" />
            <Text style={styles.softChipText}>{area}</Text>
            <Icon name="ph-caret-down" size={10} color={colors.muted} weight="bold" />
          </Pressable>
          <Pressable style={styles.softChip} onPress={() => setShowFilter(true)}>
            <Icon name="ph-sliders-horizontal" size={14} color={colors.green800} weight="bold" />
            <Text style={[styles.softChipText, { color: colors.green800 }]}>Filter</Text>
            {filterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filterCount}</Text>
              </View>
            )}
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
        <View style={styles.loading}>
          <ActivityIndicator color={colors.green800} />
        </View>
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
                <Pressable style={styles.outlineBtn} onPress={() => setShowFilter(true)}>
                  <Text style={styles.outlineText}>Change filters</Text>
                </Pressable>
                <Pressable style={styles.goldBtn} onPress={() => router.push('/(tabs)/request')}>
                  <Text style={styles.goldText}>Request service</Text>
                </Pressable>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', borderRadius: radius.md, paddingHorizontal: 12 },
  input: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colors.text, padding: 0 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  softChip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', backgroundColor: colors.surface },
  softChipText: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text },
  badge: { minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 999, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#5e4708', fontSize: 10, fontFamily: fonts.bold },
  countWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  count: { fontSize: 13.5, color: colors.muted, marginBottom: 9, fontFamily: fonts.regular },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  results: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 10 },
  emptyActions: { flexDirection: 'row', gap: 9, justifyContent: 'center', marginTop: 18 },
  outlineBtn: { height: 42, paddingHorizontal: 17, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(6,71,52,0.16)', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  outlineText: { color: colors.green800, fontSize: 13, fontFamily: fonts.bold },
  goldBtn: { height: 42, paddingHorizontal: 17, borderRadius: radius.md, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  goldText: { color: colors.text, fontSize: 13, fontFamily: fonts.bold },
});
