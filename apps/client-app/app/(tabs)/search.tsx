import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../src/components/CategoryCard';
import Chip from '../../src/components/Chip';
import IconBubble from '../../src/components/IconBubble';
import LocationSheet from '../../src/components/LocationSheet';
import PromoBanner from '../../src/components/PromoBanner';
import { CATS } from '../../src/data/mock';
import { useCategories } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { useLabels } from '../../src/lib/labels';
import { colors, fonts, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';
import type { Category } from '../../src/types';

type FilterKey = 'popular' | 'home' | 'admin' | 'top';
const HOME_GROUPS = ['Home & Repair', 'Cleaning & Care'];

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
  const [filter, setFilter] = useState<FilterKey>('popular');
  const [showLocation, setShowLocation] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const categories = useCategories();
  const source: Category[] = categories.data?.length ? categories.data : CATS;

  const chips: { key: FilterKey; label: string; icon: string }[] = [
    { key: 'popular', label: labels.categories.popular, icon: 'ph-star' },
    { key: 'home', label: labels.categories.homeServices, icon: 'ph-house' },
    { key: 'admin', label: labels.categories.adminReviewed, icon: 'ph-shield-check' },
    { key: 'top', label: labels.categories.topRated, icon: 'ph-seal-check' },
  ];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = source.filter((c) => !q || c.name.toLowerCase().includes(q) || c.am.includes(query.trim()));
    if (filter === 'home') items = items.filter((c) => HOME_GROUPS.includes(c.group));
    if (filter === 'popular' || filter === 'top' || filter === 'admin') {
      items = items.slice().sort((a, b) => b.count - a.count);
    }
    return items;
  }, [source, query, filter]);

  const rows = chunk(list, 2);

  const smallCards = [
    {
      title: labels.categories.adminReviewedProviders,
      sub: labels.categories.adminReviewedProvidersSub,
      cta: labels.categories.explore,
      icon: 'ph-shield-check',
      onPress: () => router.push('/providers'),
    },
    {
      title: labels.categories.postRecentWork,
      sub: labels.categories.postRecentWorkSub,
      cta: labels.categories.addWork,
      icon: 'ph-file-text',
      onPress: () => router.push('/(tabs)/request'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Pressable style={styles.locPill} onPress={() => setShowLocation(true)}>
            <Icon name="ph-map-pin" size={14} color={colors.success} weight="fill" />
            <Text style={styles.locText} numberOfLines={1}>
              {area}
            </Text>
            <Icon name="ph-caret-down" size={11} color={colors.muted} weight="bold" />
          </Pressable>
        </View>

        {/* Title */}
        <Text style={styles.h1}>{labels.categories.title}</Text>

        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.field}>
            <Icon name="ph-magnifying-glass" size={19} color={colors.muted} />
            <TextInput
              ref={inputRef}
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
          <Pressable style={styles.filterBtn} onPress={() => inputRef.current?.focus()} accessibilityLabel="Filter categories">
            <Icon name="ph-sliders-horizontal" size={19} color={colors.green800} weight="bold" />
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
              active={filter === c.key}
              height={42}
              onPress={() => setFilter(c.key)}
            />
          ))}
        </ScrollView>

        {/* Promo banner */}
        <View style={styles.section}>
          <PromoBanner
            badge={labels.categories.fastReliable}
            title={labels.categories.needHelpFast}
            subtitle={labels.categories.needHelpFastSub}
            cta={labels.categories.requestService}
            onPress={() => router.push('/(tabs)/request')}
          />
        </View>

        {/* Two small promo cards */}
        <View style={[styles.section, styles.smallRow]}>
          {smallCards.map((c) => (
            <Pressable key={c.title} style={styles.smallCard} onPress={c.onPress}>
              <IconBubble icon={c.icon} size={40} iconSize={20} style={{ marginTop: 2 }} />
              <View style={styles.smallContent}>
                <Text style={styles.smallTitle} numberOfLines={2}>
                  {c.title}
                </Text>
                <Text style={styles.smallSub} numberOfLines={3}>
                  {c.sub}
                </Text>
                <View style={styles.smallCta}>
                  <Text style={styles.smallCtaText}>{c.cta}</Text>
                  <Icon name="ph-arrow-right" size={12} color="#fff" weight="bold" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Category grid */}
        <View style={[styles.section, { gap: 12 }]}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((c) => (
                <CategoryCard
                  key={c.id}
                  name={am ? c.am : c.name}
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
            <Text style={styles.empty}>No categories match “{query}”.</Text>
          )}
        </View>
      </ScrollView>

      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 6 },
  logo: { height: 38, width: 104, tintColor: colors.green800 },
  locPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, ...shadowCard, shadowOpacity: 0.05 },
  locText: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, maxWidth: 110 },
  h1: { fontFamily: fonts.heading, fontSize: 30, color: colors.green900, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, paddingHorizontal: 16, ...shadowCard },
  input: { flex: 1, fontSize: 14.5, fontFamily: fonts.regular, color: colors.text, padding: 0 },
  filterBtn: { width: 54, height: 54, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', ...shadowCard },
  chipRow: { gap: 9, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  section: { paddingHorizontal: 16, paddingTop: 18 },
  smallRow: { flexDirection: 'row', gap: 12 },
  smallCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.xxl,
    padding: 12,
    minHeight: 152,
    shadowColor: '#064734',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  smallContent: { flex: 1, minWidth: 0, gap: 4 },
  smallTitle: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.green900, lineHeight: 15 },
  smallSub: { fontSize: 10.5, fontFamily: fonts.regular, color: colors.muted, lineHeight: 14.5 },
  smallCta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 4, backgroundColor: colors.green800, paddingHorizontal: 13, height: 34, borderRadius: 11 },
  smallCtaText: { fontSize: 12.5, fontFamily: fonts.bold, color: '#fff' },
  gridRow: { flexDirection: 'row', gap: 12 },
  empty: { fontSize: 13.5, fontFamily: fonts.regular, color: colors.muted, paddingVertical: 24, textAlign: 'center' },
});
