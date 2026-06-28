import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../src/components/Avatar';
import { useProviderActions } from '../../src/hooks/useProviderActions';
import { useCategory, useProvider, useProviderReviews, useProviderWork } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

const PRICE_LABELS = ['Budget', 'Standard', 'Standard', 'Premium'];

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { save, call, whatsapp } = useProviderActions();
  const saved = useAppStore((s) => !!s.saved[id]);
  const showToast = useAppStore((s) => s.showToast);

  const provider = useProvider(id);
  const pv = provider.data;
  const category = useCategory(pv?.categoryId ?? '');
  const work = useProviderWork(id);
  const reviews = useProviderReviews(id);

  if (provider.isLoading || !pv) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top']}>
        <ActivityIndicator color={colors.green800} />
      </SafeAreaView>
    );
  }

  const services = (category.data?.subs || []).slice(0, 4).map((name, i) => ({ name, price: PRICE_LABELS[i] || pv.price }));
  const facts: { label: string; icon: string }[] = [];
  if (pv.availableToday) facts.push({ label: 'Available today', icon: 'ph-clock' });
  if (pv.adminReviewed) facts.push({ label: 'Admin reviewed', icon: 'ph-seal-check' });
  if (pv.exp) facts.push({ label: pv.exp + ' years experience', icon: 'ph-medal' });
  if (pv.hasPastWork) facts.push({ label: 'Has past work', icon: 'ph-image-square' });
  facts.push({ label: 'WhatsApp available', icon: 'ph-whatsapp-logo' });

  const about = `${pv.description} Trusted by local clients across ${pv.area}, with ${pv.exp} years of hands-on experience.`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back" hitSlop={6}>
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.iconBtn} onPress={() => showToast('Profile link copied', 'ph-link')} accessibilityLabel="Share">
          <Icon name="ph-share-network" size={19} color={colors.text} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => save(pv.id)} accessibilityLabel="Save">
          <Icon name="ph-bookmark-simple" size={21} color={saved ? colors.gold : colors.text} weight={saved ? 'fill' : 'regular'} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Avatar name={pv.name} size={74} radius={20} fontSize={27} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name}>{pv.name}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.service}>{pv.service}</Text>
              {pv.verified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="ph-seal-check" size={11} color={colors.success} weight="fill" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingRow}>
              <Icon name="ph-star" size={13} color={colors.gold} weight="fill" />
              <Text style={styles.ratingText}>{pv.rating.toFixed(1)}</Text>
              <Text style={styles.metaMuted}>· {pv.reviewCount} reviews ·</Text>
              <Icon name="ph-map-pin" size={12} color={colors.muted} />
              <Text style={styles.metaMuted}>{pv.area}</Text>
            </View>
          </View>
        </View>

        {/* Quick facts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facts}>
          {facts.map((f, i) => (
            <View key={i} style={styles.fact}>
              <Icon name={f.icon} size={14} color={colors.success} weight="fill" />
              <Text style={styles.factText}>{f.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about}>{about}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.card}>
            {services.map((sv, i) => (
              <View key={i} style={[styles.serviceRow, i < services.length - 1 && styles.serviceDivider]}>
                <Icon name="ph-check-circle" size={17} color={colors.success} />
                <Text style={styles.serviceName}>{sv.name}</Text>
                <Text style={styles.servicePrice}>{sv.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent work</Text>
          {work.data && work.data.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 11 }}>
              {work.data.map((w, i) => (
                <View key={i} style={styles.workCard}>
                  <View style={[styles.workThumb, { backgroundColor: w.bg }]}>
                    <Icon name={w.icon} size={32} color="rgba(255,255,255,0.85)" weight="fill" />
                  </View>
                  <View style={{ padding: 11, paddingVertical: 9 }}>
                    <Text style={styles.workTitle} numberOfLines={1}>{w.title}</Text>
                    <Text style={styles.workNote} numberOfLines={1}>{w.note}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noData}>No past work added yet.</Text>
          )}
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewHead}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.data && reviews.data.length > 0 && (
              <Pressable onPress={() => showToast('Showing all reviews', 'ph-chats')} hitSlop={8}>
                <Text style={styles.viewAll}>View all</Text>
              </Pressable>
            )}
          </View>
          {reviews.data && reviews.data.length > 0 ? (
            reviews.data.map((r, i) => (
              <View key={i} style={[styles.reviewCard, i > 0 && { marginTop: 10 }]}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{(r.userName || '?')[0]}</Text>
                  </View>
                  <Text style={styles.reviewName}>{r.userName}</Text>
                  <Text style={styles.reviewArea}>· {r.area}</Text>
                  <View style={{ flex: 1 }} />
                  <Icon name="ph-star" size={12} color={colors.gold} weight="fill" />
                  <Text style={styles.reviewRating}>{r.rating}</Text>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No reviews yet.</Text>
          )}
        </View>

        {/* Safety */}
        <View style={styles.safetyCard}>
          <Icon name="ph-shield-check" size={22} color={colors.goldText} weight="fill" />
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>Stay safe</Text>
            <Text style={styles.safetyText}>Agree on price, time, and work scope clearly before starting work.</Text>
            <Pressable style={styles.reportBtn} onPress={() => showToast('Report sent to SERRALE', 'ph-flag')}>
              <Icon name="ph-flag" size={13} color={colors.danger} />
              <Text style={styles.reportText}>Report provider</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Sticky Call / WhatsApp bar */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <Pressable style={styles.callBtn} onPress={() => call(pv)}>
          <Icon name="ph-phone-call" size={18} color="#fff" weight="fill" />
          <Text style={styles.callText}>Call</Text>
        </Pressable>
        <Pressable style={styles.waBtn} onPress={() => whatsapp(pv)}>
          <Icon name="ph-whatsapp-logo" size={19} color={colors.whatsapp} weight="fill" />
          <Text style={styles.waText}>WhatsApp</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 12, paddingBottom: 6 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingBottom: 10 },
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  name: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  service: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText: { color: colors.success, fontSize: 10.5, fontFamily: fonts.bold },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12.5 },
  metaMuted: { color: colors.muted, fontSize: 12.5, fontFamily: fonts.regular },
  facts: { gap: 7, marginTop: 16 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.1)' },
  factText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.text },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: colors.text, marginBottom: 9 },
  about: { fontSize: 13.5, color: colors.muted, lineHeight: 22, fontFamily: fonts.regular },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.1)', borderRadius: radius.lg + 1, overflow: 'hidden' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 14 },
  serviceDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  serviceName: { flex: 1, fontSize: 13.5, fontFamily: fonts.medium, color: colors.text },
  servicePrice: { fontSize: 11, fontFamily: fonts.bold, color: '#9a8a5a', backgroundColor: colors.goldSoft, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  workCard: { width: 158, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.1)', borderRadius: radius.lg + 1, overflow: 'hidden' },
  workThumb: { height: 90, alignItems: 'center', justifyContent: 'center' },
  workTitle: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.text },
  workNote: { fontSize: 11, color: colors.muted, marginTop: 3, fontFamily: fonts.regular },
  noData: { fontSize: 12.5, color: colors.faint, fontFamily: fonts.regular },
  reviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  viewAll: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.success },
  reviewCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.1)', borderRadius: radius.lg, padding: 12, paddingHorizontal: 14 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewAvatar: { width: 30, height: 30, borderRadius: 999, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  reviewInitial: { color: colors.green800, fontSize: 12, fontFamily: fonts.bold },
  reviewName: { fontSize: 13, fontFamily: fonts.bold, color: colors.text },
  reviewArea: { fontSize: 11, color: colors.faint, fontFamily: fonts.regular },
  reviewRating: { fontSize: 12, fontFamily: fonts.bold, color: colors.text, marginLeft: 2 },
  reviewText: { fontSize: 13, color: colors.muted, lineHeight: 20, marginTop: 8, fontFamily: fonts.regular },
  safetyCard: { marginTop: 20, backgroundColor: colors.ivory, borderWidth: 1, borderColor: 'rgba(246,185,59,0.32)', borderRadius: radius.lg + 1, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  safetyTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text },
  safetyText: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 3, fontFamily: fonts.regular },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  reportText: { fontSize: 12, fontFamily: fonts.bold, color: colors.danger },
  stickyBar: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingTop: 11, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: 'rgba(6,71,52,0.09)' },
  callBtn: { flex: 1, height: 50, borderRadius: radius.lg, backgroundColor: colors.green800, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  callText: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
  waBtn: { flex: 1, height: 50, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(22,135,95,0.3)', backgroundColor: colors.soft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  waText: { color: colors.whatsapp, fontSize: 15, fontFamily: fonts.bold },
});
