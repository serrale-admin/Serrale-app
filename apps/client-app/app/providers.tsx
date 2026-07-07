import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MIN_SUGGEST_LENGTH } from '../src/api';
import type { SearchSuggestion } from '../src/api';
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
import { useSearchSuggest } from '../src/hooks/useSearchSuggest';
import { AREA_ALL } from '../src/data/mock';
import { Icon } from '../src/lib/icons';
import { colors, fonts, radius } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

/**
 * Provider results list (free-text search + area filter across all providers).
 *
 * Search assistance: the input drives GET /search/suggest (300 ms debounce,
 * cancellation, six results, brief cache — see useSearchSuggest); submitting or
 * picking a suggestion commits the query that drives the results list. Quick
 * chips only expose what the backend can really filter ("Near me" → area);
 * rating/availability/WhatsApp chips were removed with contract matrix M-4.
 */
export default function ProvidersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; categoryId?: string }>();
  const area = useAppStore((s) => s.area);
  const setArea = useAppStore((s) => s.setArea);
  const filters = useAppStore((s) => s.filters);
  const toggleQuick = useAppStore((s) => s.toggleQuick);
  const filterCount = useAppStore((s) => s.activeFilterCount)();

  const initialQ = typeof params.q === 'string' ? params.q : '';
  // `search` is the live input (drives suggestions); `submitted` is the
  // committed query (drives the results list).
  const [search, setSearch] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);
  const [showFilter, setShowFilter] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  const query = useMemo(
    () => ({ search: submitted, categoryId, area, filters }),
    [submitted, categoryId, area, filters],
  );
  const providers = useProviders(query);
  const results = providers.data?.items ?? [];
  const total = providers.data?.total ?? 0;
  const suffix = submitted ? ` for "${submitted}"` : ` near ${area}`;

  // Suggestions show while the input differs from the committed query.
  const assist = useSearchSuggest(search);
  const assistOpen = search.trim().length >= MIN_SUGGEST_LENGTH && search.trim() !== submitted.trim();

  const commit = (value: string) => {
    setSearch(value);
    setSubmitted(value);
  };

  const onSuggestion = (s: SearchSuggestion) => {
    if (s.type === 'fallback_request_help') {
      router.push('/(tabs)/request');
      return;
    }
    if (s.categorySlug) {
      router.push(`/categories/${s.categorySlug}`);
      return;
    }
    commit(s.label);
  };

  const suggestionA11y = (s: SearchSuggestion): string => {
    const count = typeof s.providerCount === 'number' ? `, ${s.providerCount} providers` : '';
    if (s.type === 'fallback_request_help') return `${s.label}. Opens the service request form`;
    return `Search suggestion: ${s.label}${count}`;
  };

  const nearOn = filters.areas[0] === area;

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
            onClear={() => commit('')}
            onSubmitEditing={() => commit(search.trim())}
            placeholder="Search plumber, painter, nanny…"
            autoFocus={!search}
            returnKeyType="search"
            containerStyle={styles.field}
            accessibilityLabel="Search providers"
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

      {/* Search assistance */}
      {assistOpen && (assist.loading || assist.suggestions.length > 0) && (
        <View style={styles.assistCard} accessibilityLabel="Search suggestions">
          {assist.loading && assist.suggestions.length === 0 && (
            <View style={styles.assistLoading}>
              <ActivityIndicator size="small" color={colors.green800} accessibilityLabel="Loading suggestions" />
              <Text style={styles.assistLoadingText}>Searching…</Text>
            </View>
          )}
          {assist.suggestions.map((s, i) => (
            <Pressable
              key={`${s.type}-${s.label}-${i}`}
              style={({ pressed }) => [styles.assistRow, pressed && styles.assistRowPressed, i > 0 && styles.assistDivider]}
              onPress={() => onSuggestion(s)}
              accessibilityRole="button"
              accessibilityLabel={suggestionA11y(s)}
            >
              <Icon
                name={s.type === 'fallback_request_help' ? 'ph-hand-heart' : 'ph-magnifying-glass'}
                size={15}
                color={s.type === 'fallback_request_help' ? colors.goldText : colors.muted}
                weight={s.type === 'fallback_request_help' ? 'fill' : 'regular'}
              />
              <View style={styles.assistTextWrap}>
                <Text style={styles.assistLabel} numberOfLines={1}>{s.label}</Text>
                {!!s.reason && <Text style={styles.assistReason} numberOfLines={1}>{s.reason}</Text>}
              </View>
              {typeof s.providerCount === 'number' && s.providerCount > 0 && (
                <Text style={styles.assistCount}>{s.providerCount}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Count + quick chips */}
      <View style={styles.countWrap}>
        <Text style={styles.count}>
          <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{total}</Text> providers{suffix}
        </Text>
        {area !== AREA_ALL && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
            <Chip label={`Near me (${area})`} iconName="ph-map-pin" active={nearOn} height={30} onPress={() => toggleQuick('near')} />
          </ScrollView>
        )}
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
        <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
  assistCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderField,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  assistLoading: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, paddingVertical: 12 },
  assistLoadingText: { fontSize: 12.5, color: colors.muted, fontFamily: fonts.regular },
  assistRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  assistRowPressed: { backgroundColor: colors.soft },
  assistDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  assistTextWrap: { flex: 1, minWidth: 0 },
  assistLabel: { fontSize: 13.5, fontFamily: fonts.semibold, color: colors.text },
  assistReason: { fontSize: 11.5, fontFamily: fonts.regular, color: colors.muted, marginTop: 1 },
  assistCount: { fontSize: 12, fontFamily: fonts.bold, color: colors.green800 },
  countWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  count: { fontSize: 13.5, color: colors.muted, marginBottom: 9, fontFamily: fonts.regular },
  results: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 10 },
  emptyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center', marginTop: 18 },
});
