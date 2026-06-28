import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chip from '../../src/components/Chip';
import FilterSheet from '../../src/components/FilterSheet';
import HomeBanner from '../../src/components/HomeBanner';
import LocationSheet from '../../src/components/LocationSheet';
import Medallion from '../../src/components/Medallion';
import ProviderRow from '../../src/components/ProviderRow';
import SectionHeader from '../../src/components/SectionHeader';
import { CATS } from '../../src/data/mock';
import { useNearbyProviders, useRecentWork, useVerifiedProviders } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { useLabels } from '../../src/lib/labels';
import { colors, fonts, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';
import { useState } from 'react';

const QUICK_IDS = ['plumbers', 'electricians', 'cleaners', 'painters', 'nannies', 'carpenters', 'appliance'];

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

  const quickCats = QUICK_IDS.map((id) => CATS.find((c) => c.id === id)!);
  const popularCats = CATS.slice(0, 8);

  const goBookmarks = () => router.push('/bookmarks');

  const onBanner = (i: number) => {
    if (i === 0) router.push('/(tabs)/request');
    else if (i === 1) {
      if (!filters.trust.includes('Verified only')) toggleFilter('trust', 'Verified only');
      router.push('/(tabs)/search');
    } else router.push('/categories');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
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

        {/* Search + banner */}
        <View style={{ paddingHorizontal: 16 }}>
          <Pressable style={styles.search} onPress={() => router.push('/(tabs)/search')}>
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
            <Chip key={c.id} label={am ? c.am : c.name} iconName={c.icon} height={38} onPress={() => router.push(`/categories/${c.id}`)} />
          ))}
        </ScrollView>

        {/* Nearby providers */}
        <SectionHeader title={labels.nearbyTitle} actionLabel={labels.viewAll} onAction={() => router.push('/(tabs)/search')} />
        <View style={styles.list}>
          {nearby.data?.map((p) => <ProviderRow key={p.id} provider={p} />)}
        </View>

        {/* Popular categories */}
        <SectionHeader title={labels.popularTitle} actionLabel={labels.viewAll} onAction={() => router.push('/categories')} />
        <View style={styles.grid}>
          {popularCats.map((c) => (
            <Pressable key={c.id} style={styles.gridCell} onPress={() => router.push(`/categories/${c.id}`)}>
              <Medallion group={c.group} icon={c.icon} />
              <Text style={styles.gridLabel} numberOfLines={2}>
                {am ? c.am : c.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Verified providers */}
        <View style={styles.verifiedHead}>
          <Text style={styles.sectionTitle}>{labels.verifiedTitle}</Text>
          <View style={styles.adminBadge}>
            <Icon name="ph-seal-check" size={12} color={colors.success} weight="fill" />
            <Text style={styles.adminBadgeText}>Admin reviewed</Text>
          </View>
        </View>
        <View style={styles.list}>
          {verified.data?.map((p) => <ProviderRow key={p.id} provider={p} />)}
        </View>

        {/* Recent work */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 9 }]}>{labels.pastWorkTitle}</Text>
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
                <View style={styles.workMeta}>
                  <Icon name="ph-map-pin" size={11} color={colors.muted} />
                  <Text style={styles.workMetaText} numberOfLines={1}>
                    {w.area} · {w.category}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Safety card */}
        <Pressable style={styles.safetyCardWrap} onPress={() => router.push('/help')}>
          <LinearGradient colors={[colors.green800, colors.green700]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.safetyCard}>
            <View style={styles.safetyIcon}>
              <Icon name="ph-shield-check" size={21} color={colors.gold} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>Stay safe with SERRALE</Text>
              <Text style={styles.safetySub}>Agree on price, time, and work scope before starting.</Text>
            </View>
            <Icon name="ph-caret-right" size={16} color="rgba(255,255,255,0.8)" weight="bold" />
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} onApply={() => { setShowFilter(false); router.push('/(tabs)/search'); }} />
      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 8 },
  logo: { height: 21, width: 96 },
  locPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, ...shadowCard, shadowOpacity: 0.05 },
  locText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.text, maxWidth: 96 },
  iconBtn: { width: 38, height: 38, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 48, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingLeft: 14, paddingRight: 6, ...shadowCard },
  searchText: { flex: 1, fontSize: 14, color: colors.faint, fontFamily: fonts.regular },
  filterBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  chipRow: { gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  list: { paddingHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 9 },
  gridCell: { width: '22.6%', minHeight: 92, alignItems: 'center', justifyContent: 'center', gap: 9, paddingVertical: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.xl, ...shadowCard, shadowOpacity: 0.05 },
  gridLabel: { fontSize: 10.5, fontFamily: fonts.semibold, color: colors.text, textAlign: 'center', lineHeight: 13, paddingHorizontal: 4 },
  verifiedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 9 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.soft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  adminBadgeText: { fontSize: 11, fontFamily: fonts.bold, color: colors.success },
  workRow: { gap: 11, paddingHorizontal: 16, paddingBottom: 4 },
  workCard: { width: 172, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg + 2, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.05 },
  workThumb: { height: 96, alignItems: 'center', justifyContent: 'center' },
  workTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text },
  workMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  workMetaText: { fontSize: 11, color: colors.muted, fontFamily: fonts.regular },
  safetyCardWrap: { marginTop: 22, marginHorizontal: 16 },
  safetyCard: { padding: 14, borderRadius: radius.xl, flexDirection: 'row', alignItems: 'center', gap: 12 },
  safetyIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  safetyTitle: { fontSize: 13.5, fontFamily: fonts.bold, color: '#fff' },
  safetySub: { fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 2, lineHeight: 16, fontFamily: fonts.regular },
});
