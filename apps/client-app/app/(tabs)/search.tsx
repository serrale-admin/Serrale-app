import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../src/components/CategoryCard';
import CategoryFilterSheet, { CategorySort } from '../../src/components/CategoryFilterSheet';
import Chip from '../../src/components/Chip';
import EngagementSegment from '../../src/components/EngagementSegment';
import LocationSheet from '../../src/components/LocationSheet';
import PromoBanner from '../../src/components/PromoBanner';
import { CATS, GROUP_NAMES } from '../../src/data/mock';
import { useCategories } from '../../src/hooks/queries';
import { areaLabel, categoryLabel, serviceGroupLabel } from '../../src/lib/directory-display';
import { directoryRefreshProps, usePullToRefresh } from '../../src/lib/directory-refresh';
import { Icon } from '../../src/lib/icons';
import { fill, useLabels } from '../../src/lib/labels';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';
import type { Category } from '../../src/types';

const categoriesBannerArt = require('../../assets/categories-banner.png');

/** Plain provider-count line ("126 providers"). Real API counts; demo data fallback. */
function countLabel(n: number, word: string): string {
  return `${n.toLocaleString('en-US')} ${word}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const labels = useLabels();
  const area = useAppStore((s) => s.area);
  const setArea = useAppStore((s) => s.setArea);
  const am = useAppStore((s) => s.lang) === 'am';

  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [sort, setSort] = useState<CategorySort>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const categories = useCategories();
  const { refreshing, onRefresh } = usePullToRefresh(() => categories.refetch());
  const source: Category[] = categories.data?.length ? categories.data : CATS;

  const groupLabel = (group: string): string => serviceGroupLabel(group, labels);

  const chips = [
    { key: '', label: labels.categories.allServices, icon: 'ph-squares-four' },
    ...GROUP_NAMES.map((group) => ({
      key: group,
      label: groupLabel(group),
      icon:
        group === 'Home Services'
          ? 'ph-house'
          : group === 'Moving & Transport'
            ? 'ph-truck'
            : group === 'Health & Wellness'
              ? 'ph-heartbeat'
              : 'ph-wrench',
    })),
  ];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = source.filter((c) => !q || c.name.toLowerCase().includes(q) || c.am.includes(query.trim()));
    if (selectedGroup) items = items.filter((c) => c.group === selectedGroup);
    items = items.slice().sort(
      sort === 'popular'
        ? (a, b) => b.count - a.count
        : (a, b) => categoryLabel(a, am).localeCompare(categoryLabel(b, am)),
    );
    return items;
  }, [source, query, selectedGroup, sort, am]);

  const rows = chunk(list, 2);
  const activeFilterCount = (selectedGroup ? 1 : 0) + (sort === 'alphabetical' ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} {...directoryRefreshProps} />
        }
      >
        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Pressable style={styles.locPill} onPress={() => setShowLocation(true)}>
            <Icon name="ph-map-pin" size={14} color={colors.success} weight="fill" />
            <Text style={styles.locText} numberOfLines={1}>
              {areaLabel(area, am)}
            </Text>
            <Icon name="ph-caret-down" size={11} color={colors.muted} weight="bold" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.64 }]}
            onPress={onRefresh}
            disabled={refreshing}
            hitSlop={2}
            accessibilityRole="button"
            accessibilityLabel={labels.a11y.refresh}
            accessibilityState={{ busy: refreshing }}
          >
            <Icon name="ph-arrow-clockwise" size={20} color={colors.green900} />
          </Pressable>
        </View>

        {/* Title */}
        <Text style={styles.h1}>{labels.categories.title}</Text>

        <View style={styles.engagementWrap}>
          <EngagementSegment />
        </View>

        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.field}>
            <Icon name="ph-magnifying-glass" size={19} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={labels.categories.searchPlaceholder}
              placeholderTextColor={colors.faint}
              style={styles.input}
              returnKeyType="search"
            />
            {!!query && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Icon name="ph-x-circle" size={18} color="#bcc6bf" weight="fill" />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters(true)}
            accessibilityLabel={labels.a11y.filterCategories}
          >
            <Icon name="ph-sliders-horizontal" size={19} color={colors.green800} weight="bold" />
            {activeFilterCount > 0 ? (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {chips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              iconName={c.icon}
              iconColor={colors.green700}
              active={selectedGroup === c.key}
              height={42}
              onPress={() => setSelectedGroup(c.key)}
            />
          ))}
        </ScrollView>

        {/* Promo banner — same 112px footprint as Home */}
        <View style={styles.section}>
          <PromoBanner
            photo={categoriesBannerArt}
            title={labels.categories.needHelpFast}
            subtitle={labels.categories.needHelpFastSub}
            cta={labels.categories.requestService}
            onPress={() => router.push('/(tabs)/request')}
          />
        </View>

        {/* Category grid */}
        <View style={[styles.section, { gap: 12 }]}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((c) => (
                <CategoryCard
                  key={c.id}
                  name={categoryLabel(c, am)}
                  icon={c.icon}
                  imageKey={c.id}
                  count={countLabel(c.count, labels.providersWord)}
                  variant="row"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/categories/${c.id}`)}
                />
              ))}
              {row.length < 2 && <View style={{ flex: 1 }} />}
            </View>
          ))}
          {list.length === 0 && (
            <Text style={styles.empty}>{fill(labels.search.noMatch, { q: query })}</Text>
          )}
        </View>
        </View>
      </ScrollView>

      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
      <CategoryFilterSheet
        visible={showFilters}
        categories={source}
        selectedGroup={selectedGroup}
        sort={sort}
        onClose={() => setShowFilters(false)}
        onApply={(group, nextSort) => {
          setSelectedGroup(group);
          setSort(nextSort);
          setShowFilters(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { alignItems: 'center', paddingBottom: 28 },
  content: { width: '100%', maxWidth: layout.contentMaxWidth },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 6 },
  logo: { height: 38, width: 104, tintColor: colors.green800 },
  locPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, ...shadowCard, shadowOpacity: 0.05 },
  locText: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, maxWidth: 110 },
  refreshBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  h1: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    color: colors.green900,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  engagementWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, paddingHorizontal: 16, ...shadowCard },
  input: { flex: 1, fontSize: 14.5, fontFamily: fonts.regular, color: colors.text, padding: 0 },
  filterBtn: { width: 54, height: 54, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', ...shadowCard },
  filterBtnActive: { backgroundColor: colors.frost, borderColor: colors.green700 },
  filterCount: {
    position: 'absolute',
    top: 7,
    right: 7,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  filterCountText: { fontSize: 9.5, fontFamily: fonts.bold, color: colors.onGold },
  chipRow: { gap: 9, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  gridRow: { flexDirection: 'row', gap: 10 },
  empty: { fontSize: 13.5, fontFamily: fonts.regular, color: colors.muted, paddingVertical: 24, textAlign: 'center' },
});
