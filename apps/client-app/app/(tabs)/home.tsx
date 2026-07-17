import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../../src/components/CategoryCard';
import FilterSheet from '../../src/components/FilterSheet';
import HomeBanner from '../../src/components/HomeBanner';
import LocationSheet from '../../src/components/LocationSheet';
import ProviderCard from '../../src/components/ProviderCard';
import ProviderMini from '../../src/components/ProviderMini';
import SafetyCard from '../../src/components/SafetyCard';
import SectionHeader from '../../src/components/SectionHeader';
import { AREA_ALL, CATS, PASTWORK, PROV } from '../../src/data/mock';
import { useCategories, useNearbyProviders, useRecentWork, useVerifiedProviders } from '../../src/hooks/queries';
import { directoryRefreshProps, usePullToRefresh } from '../../src/lib/directory-refresh';
import { USE_MOCK } from '../../src/lib/env';
import { Icon } from '../../src/lib/icons';
import { fill, useLabels } from '../../src/lib/labels';
import { colors, fonts, layout, radius } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

const QUICK_IDS = ['plumbers', 'electricians', 'cleaners', 'painters'];

export default function HomeScreen() {
  const router = useRouter();
  const labels = useLabels();
  const area = useAppStore((state) => state.area);
  const lang = useAppStore((state) => state.lang);
  const setArea = useAppStore((state) => state.setArea);
  const engagement = useAppStore((state) => state.filters.engagement);
  const selectEngagementFilter = useAppStore((state) => state.selectEngagementFilter);
  const am = lang === 'am';

  const [showFilter, setShowFilter] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const nearby = useNearbyProviders(area, engagement);
  const verified = useVerifiedProviders(engagement);
  const recent = useRecentWork();
  const categories = useCategories();
  const { refreshing, onRefresh } = usePullToRefresh(
    () => nearby.refetch(),
    () => verified.refetch(),
    () => recent.refetch(),
    () => categories.refetch(),
  );

  const liveCats = categories.data?.length ? categories.data : CATS;
  const quickCats = QUICK_IDS.map((id) => liveCats.find((category) => category.id === id)).filter(
    (category): category is (typeof liveCats)[number] => Boolean(category),
  );
  const popularCats = liveCats.slice().sort((a, b) => b.count - a.count).slice(0, 8);
  const nearbyMock = PROV.filter((provider) => {
    if (area !== AREA_ALL && provider.area !== area) return false;
    if (engagement === 'temporary' || engagement === 'permanent') {
      return (provider.engagementTypes || []).includes(engagement);
    }
    return true;
  });
  const verifiedMock = PROV.filter((provider) => {
    if (!(provider.verified || provider.adminReviewed)) return false;
    if (engagement === 'temporary' || engagement === 'permanent') {
      return (provider.engagementTypes || []).includes(engagement);
    }
    return true;
  });
  const nearbySource = USE_MOCK && nearby.isLoading ? nearbyMock : nearby.data ?? [];
  const verifiedSource = USE_MOCK && verified.isLoading ? verifiedMock : verified.data ?? [];
  const recentWork = USE_MOCK && recent.isLoading ? PASTWORK : recent.data ?? [];
  const nearbyProviders = nearbySource.slice(0, 4);
  const verifiedProviders = verifiedSource.slice(0, 8);

  const onBanner = (index: number) => {
    // Banner 0 opens the provider list directly — the backend has no "verified"
    // filter param (contract matrix M-4), so no illusory filter state is set.
    if (index === 0) {
      router.push('/providers');
    } else if (index === 1) {
      router.push('/(tabs)/request');
    } else {
      router.push('/(tabs)/search');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} {...directoryRefreshProps} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SERRALE"
            />
            <Pressable
              style={({ pressed }) => [styles.location, pressed && styles.pressed]}
              onPress={() => setShowLocation(true)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={fill(labels.a11y.location, { area })}
            >
              <Icon name="ph-map-pin" size={15} color={colors.green700} weight="fill" />
              <Text style={styles.locationText} numberOfLines={1}>
                {area}
              </Text>
              <Icon name="ph-caret-down" size={11} color={colors.green800} weight="bold" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
              onPress={onRefresh}
              disabled={refreshing}
              hitSlop={2}
              accessibilityRole="button"
              accessibilityLabel={labels.a11y.refresh}
              accessibilityState={{ busy: refreshing }}
            >
              <Icon name="ph-arrow-clockwise" size={20} color={colors.green900} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
              onPress={() => router.push('/bookmarks')}
              hitSlop={2}
              accessibilityRole="button"
              accessibilityLabel={labels.common.savedProviders}
            >
              <Icon name="ph-bookmark-simple" size={21} color={colors.green900} />
            </Pressable>
          </View>

          <View style={styles.heroWrap}>
            <Pressable
              style={({ pressed }) => [styles.search, pressed && styles.searchPressed]}
              onPress={() => router.push('/providers')}
              accessibilityRole="search"
              accessibilityLabel={labels.searchPlaceholder}
            >
              <Icon name="ph-magnifying-glass" size={21} color={colors.text} />
              <Text style={styles.searchText} numberOfLines={1}>
                {labels.searchPlaceholder}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
                onPress={(event) => {
                  event.stopPropagation();
                  setShowFilter(true);
                }}
                hitSlop={2}
                accessibilityRole="button"
                accessibilityLabel={labels.common.filters}
              >
                <Icon name="ph-sliders-horizontal" size={19} color={colors.green800} weight="bold" />
              </Pressable>
            </Pressable>
            <HomeBanner onGo={onBanner} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            <CategoryCard
              name={labels.filter.engagementTemporary}
              icon="ph-calendar-check"
              variant="shortcut"
              tone="temporary"
              active={engagement === 'temporary'}
              onPress={() => selectEngagementFilter('temporary')}
            />
            <CategoryCard
              name={labels.filter.engagementPermanent}
              icon="ph-shield-check"
              variant="shortcut"
              tone="permanent"
              active={engagement === 'permanent'}
              onPress={() => selectEngagementFilter('permanent')}
            />
            {quickCats.map((category) => (
              <CategoryCard
                key={category.id}
                name={am ? category.am : category.name}
                icon={category.icon}
                imageKey={category.id}
                variant="shortcut"
                onPress={() => router.push(`/categories/${category.id}`)}
              />
            ))}
            <CategoryCard
              name={labels.more}
              icon="ph-squares-four"
              variant="shortcut"
              onPress={() => router.push('/(tabs)/search')}
            />
          </ScrollView>

          <SectionHeader
            title={labels.nearbyTitle}
            actionLabel={labels.viewAll}
            onAction={() => router.push('/providers')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerRail}>
            {nearbyProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                variant="nearby"
              />
            ))}
            {!nearby.isLoading && nearbyProviders.length === 0 && (
              <Pressable style={styles.inlineEmpty} onPress={() => router.push('/providers')}>
                <Icon name="ph-map-pin" size={18} color={colors.green700} weight="fill" />
                <Text style={styles.inlineEmptyText}>{fill(labels.home.browseNear, { area })}</Text>
                <Icon name="ph-caret-right" size={12} color={colors.green800} weight="bold" />
              </Pressable>
            )}
          </ScrollView>

          <SectionHeader
            title={labels.popularTitle}
            actionLabel={labels.viewAll}
            onAction={() => router.push('/(tabs)/search')}
          />
          <View style={styles.categoryGrid}>
            {popularCats.map((category) => (
              <CategoryCard
                key={category.id}
                name={am ? category.am : category.name}
                icon={category.icon}
                imageKey={category.id}
                variant="tile"
                style={styles.categoryTile}
                onPress={() => router.push(`/categories/${category.id}`)}
              />
            ))}
          </View>

          <SectionHeader
            title={labels.verifiedTitle}
            actionLabel={labels.viewAll}
            onAction={() => router.push('/providers')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.verifiedRail}
          >
            {verifiedProviders.map((provider) => (
              <ProviderMini key={provider.id} provider={provider} />
            ))}
          </ScrollView>

          <SectionHeader title={labels.pastWorkTitle} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workRail}>
            {recentWork.map((work, index) => (
              <View key={`${work.title}-${index}`} style={styles.workCard}>
                <View style={[styles.workThumb, { backgroundColor: work.bg }]}>
                  <Icon name={work.icon} size={28} color="rgba(255,255,255,0.88)" weight="fill" />
                </View>
                <View style={styles.workBody}>
                  <Text style={styles.workTitle} numberOfLines={1}>
                    {work.title}
                  </Text>
                  <View style={styles.statusRow}>
                    <Icon name="ph-check-circle" size={12} color={colors.success} weight="fill" />
                    <Text style={styles.statusText}>{labels.completed}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.safetyWrap}>
            <SafetyCard
              title={labels.safetyTitle}
              subtitle={labels.safetySubtitle}
              onPress={() => router.push('/help')}
            />
          </View>
        </View>
      </ScrollView>

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={() => {
          setShowFilter(false);
          router.push('/providers');
        }}
      />
      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { alignItems: 'center', paddingBottom: 20 },
  content: { width: '100%', maxWidth: layout.contentMaxWidth },
  pressed: { opacity: 0.64 },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: layout.gutter,
    paddingTop: 2,
    paddingBottom: 8,
  },
  logo: { width: 104, height: 40, tintColor: colors.green800 },
  location: {
    height: 36,
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    backgroundColor: colors.soft,
    borderRadius: radius.pill,
  },
  locationText: { maxWidth: 94, fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  heroWrap: { paddingHorizontal: layout.gutter },
  search: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 14,
    paddingRight: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.18)',
    borderRadius: radius.xl,
  },
  searchPressed: { backgroundColor: colors.ivory },
  searchText: { flex: 1, fontSize: 13.5, fontFamily: fonts.regular, color: colors.muted },
  filterButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  quickRow: { gap: 7, paddingHorizontal: layout.gutter, paddingTop: 6, paddingBottom: 1 },
  providerRail: { gap: 8, paddingHorizontal: layout.gutter, paddingBottom: 2 },
  inlineEmpty: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  inlineEmptyText: { flex: 1, fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: layout.gutter },
  categoryTile: { flexBasis: '23%', flexGrow: 1 },
  verifiedRail: { gap: 8, paddingHorizontal: layout.gutter, paddingBottom: 2 },
  workRail: { gap: 9, paddingHorizontal: layout.gutter, paddingBottom: 2 },
  workCard: {
    width: 154,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
  },
  workThumb: { height: 72, alignItems: 'center', justifyContent: 'center' },
  workBody: { paddingHorizontal: 9, paddingVertical: 8 },
  workTitle: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.text },
  statusRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 10.5, fontFamily: fonts.semibold, color: colors.success },
  safetyWrap: { marginTop: 16, marginHorizontal: layout.gutter },
});
