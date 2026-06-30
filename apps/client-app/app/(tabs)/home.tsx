import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../src/components/CategoryCard';
import Chip from '../../src/components/Chip';
import FilterSheet from '../../src/components/FilterSheet';
import HomeBanner from '../../src/components/HomeBanner';
import LocationSheet from '../../src/components/LocationSheet';
import ProviderCard from '../../src/components/ProviderCard';
import ProviderMini from '../../src/components/ProviderMini';
import SafetyCard from '../../src/components/SafetyCard';
import SectionHeader from '../../src/components/SectionHeader';
import { CATS } from '../../src/data/mock';
import { useCategories, useNearbyProviders, useRecentWork, useVerifiedProviders } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { useLabels } from '../../src/lib/labels';
import { colors, fonts, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

const QUICK_IDS = ['plumbers', 'electricians', 'cleaners', 'painters'];

/** Splits an array into fixed-size chunks (used for the 4-column category grid). */
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function HomeScreen() {
  const router = useRouter();
  const labels = useLabels();
  const area = useAppStore((s) => s.area);
  const lang = useAppStore((s) => s.lang);
  const setArea = useAppStore((s) => s.setArea);
  const filters = useAppStore((s) => s.filters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);
  const am = lang === 'am';

  const [showFilter, setShowFilter] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const nearby = useNearbyProviders(area);
  const verified = useVerifiedProviders();
  const recent = useRecentWork();
  const categories = useCategories();

  const liveCats = categories.data?.length ? categories.data : CATS;
  const quickCats = QUICK_IDS
    .map((id) => liveCats.find((c) => c.id === id))
    .filter((c): c is (typeof liveCats)[number] => Boolean(c));
  const popularCats = liveCats.slice().sort((a, b) => b.count - a.count).slice(0, 8);
  const popularRows = chunk(popularCats, 4);

  const goBookmarks = () => router.push('/bookmarks');

  const onBanner = (i: number) => {
    if (i === 0) router.push('/(tabs)/request');
    else if (i === 1) {
      if (!filters.trust.includes('Verified only')) toggleFilter('trust', 'Verified only');
      router.push('/providers');
    } else router.push('/(tabs)/search');
  };

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
          <Pressable style={styles.iconBtn} onPress={goBookmarks} accessibilityLabel="Saved providers">
            <Icon name="ph-bookmark-simple" size={18} color={colors.text} />
          </Pressable>
        </View>

        {/* Search + hero banner */}
        <View style={{ paddingHorizontal: 16 }}>
          <Pressable style={styles.search} onPress={() => router.push('/providers')}>
            <Icon name="ph-magnifying-glass" size={19} color={colors.muted} />
            <Text style={styles.searchText} numberOfLines={1}>
              {labels.searchPlaceholder}
            </Text>
            <Pressable style={styles.filterBtn} onPress={() => setShowFilter(true)} accessibilityLabel="Filters">
              <Icon name="ph-sliders-horizontal" size={17} color={colors.green800} weight="bold" />
            </Pressable>
          </Pressable>
          <HomeBanner onGo={onBanner} />
        </View>

        {/* Quick category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {quickCats.map((c) => (
            <Chip
              key={c.id}
              label={am ? c.am : c.name}
              iconName={c.icon}
              iconColor={colors.green700}
              iconWeight="fill"
              height={42}
              onPress={() => router.push(`/categories/${c.id}`)}
            />
          ))}
          <Chip
            key="more"
            label={labels.more}
            iconName="ph-squares-four"
            iconColor={colors.green700}
            iconWeight="fill"
            height={42}
            onPress={() => router.push('/(tabs)/search')}
          />
        </ScrollView>

        {/* Nearby providers */}
        <SectionHeader title={labels.nearbyTitle} actionLabel={labels.viewAll} onAction={() => router.push('/providers')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {nearby.data?.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </ScrollView>

        {/* Popular categories */}
        <SectionHeader title={labels.popularTitle} actionLabel={labels.viewAll} onAction={() => router.push('/(tabs)/search')} />
        <View style={styles.grid}>
          {popularRows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((c) => (
                <CategoryCard
                  key={c.id}
                  name={am ? c.am : c.name}
                  icon={c.icon}
                  variant="tile"
                  onPress={() => router.push(`/categories/${c.id}`)}
                />
              ))}
              {/* keep last partial row aligned to 4 columns */}
              {row.length < 4 &&
                Array.from({ length: 4 - row.length }).map((_, i) => <View key={`sp-${i}`} style={{ flex: 1 }} />)}
            </View>
          ))}
        </View>

        {/* Verified providers */}
        <View style={styles.verifiedHead}>
          <Text style={styles.sectionTitle}>{labels.verifiedTitle}</Text>
          <View style={styles.adminBadge}>
            <Icon name="ph-seal-check" size={12} color={colors.success} weight="fill" />
            <Text style={styles.adminBadgeText}>{labels.adminReviewed}</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {verified.data?.map((p) => <ProviderMini key={p.id} provider={p} />)}
        </ScrollView>

        {/* Recent work */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 11 }]}>{labels.pastWorkTitle}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workRow}>
          {recent.data?.map((w, i) => (
            <View key={i} style={styles.workCard}>
              <View style={[styles.workThumb, { backgroundColor: w.bg }]}>
                <Icon name={w.icon} size={34} color="rgba(255,255,255,0.85)" weight="fill" />
              </View>
              <View style={{ padding: 11, paddingTop: 9 }}>
                <Text style={styles.workTitle} numberOfLines={1}>
                  {w.title}
                </Text>
                <View style={styles.statusPill}>
                  <Icon name="ph-check-circle" size={12} color={colors.success} weight="fill" />
                  <Text style={styles.statusText}>{labels.completed}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Safety card */}
        <View style={styles.safetyWrap}>
          <SafetyCard title={labels.safetyTitle} subtitle={labels.safetySubtitle} onPress={() => router.push('/help')} />
        </View>
      </ScrollView>

      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={() => { setShowFilter(false); router.push('/providers'); }} />
      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10 },
  logo: { height: 22, width: 100 },
  locPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, ...shadowCard, shadowOpacity: 0.05 },
  locText: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, maxWidth: 110 },
  iconBtn: { width: 40, height: 40, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingLeft: 16, paddingRight: 12, ...shadowCard },
  searchText: { flex: 1, fontSize: 14.5, color: colors.faint, fontFamily: fonts.regular },
  filterBtn: { width: 30, height: 40, alignItems: 'center', justifyContent: 'center' },
  chipRow: { gap: 9, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  cardRow: { gap: 12, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 4 },
  grid: { paddingHorizontal: 16, gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },
  verifiedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 11 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.soft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  adminBadgeText: { fontSize: 11, fontFamily: fonts.bold, color: colors.success },
  workRow: { gap: 12, paddingHorizontal: 16, paddingBottom: 4 },
  workCard: { width: 176, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.05 },
  workThumb: { height: 96, alignItems: 'center', justifyContent: 'center' },
  workTitle: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.text },
  statusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 7 },
  statusText: { fontSize: 12, fontFamily: fonts.bold, color: colors.success },
  safetyWrap: { marginTop: 24, marginHorizontal: 16 },
});
