import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as api from '../../src/api';
import Avatar from '../../src/components/Avatar';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import ErrorBlock from '../../src/components/ErrorBlock';
import RateProviderSheet from '../../src/components/RateProviderSheet';
import { useProviderActions } from '../../src/hooks/useProviderActions';
import { keys, useCategory, useProvider, useProviderReviews, useProviderWork, useReviewEligibility } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { fill, useLabels } from '../../src/lib/labels';
import { colors, fonts, radius } from '../../src/lib/theme';
import { ApiBusinessError, HttpError } from '../../src/lib/http';
import { mapRateEligibilityCta } from '../../src/lib/rateEligibilityCta';
import { reviewErrorMessage } from '../../src/lib/reviewSubmitErrors';
import { secureSession } from '../../src/lib/secure-session';
import { useAppStore } from '../../src/store/appStore';
import type { Review } from '../../src/types';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const labels = useLabels();
  const queryClient = useQueryClient();
  const { save, call, whatsapp } = useProviderActions();
  const saved = useAppStore((s) => !!s.saved[id]);
  const showToast = useAppStore((s) => s.showToast);
  const loggedIn = useAppStore((s) => s.loggedIn);
  const sessionReady = useAppStore((s) => s.sessionReady);
  const activeSession = useAppStore((s) => s.activeSession);

  const userArea = useAppStore((s) => s.area);
  const provider = useProvider(id);
  const pv = provider.data;
  const category = useCategory(pv?.categoryId ?? '');
  const work = useProviderWork(id);
  const reviews = useProviderReviews(id);
  // Wait for session hydrate so we don't cache a need_login result without Bearer.
  const eligibility = useReviewEligibility(id, !!id && sessionReady);
  const [rateOpen, setRateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<Review[] | null>(null);
  const [localRating, setLocalRating] = useState<{ rating: number; reviewCount: number } | null>(null);
  const [localMyRating, setLocalMyRating] = useState<number | null>(null);
  // Ratings POST needs a customer Bearer. Provider-only sessions look "logged in"
  // but cannot submit — detect missing customer tokens for CTA + submit gating.
  const [hasCustomerToken, setHasCustomerToken] = useState(true);
  useEffect(() => {
    if (!sessionReady) return;
    let cancelled = false;
    void secureSession.read().then((tokens) => {
      if (!cancelled) setHasCustomerToken(!!tokens?.accessToken);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionReady, loggedIn, activeSession]);

  // Log a profile_view once the provider loads (once per id). Fire-and-forget —
  // logProviderContact never throws and is never awaited. (Contract matrix M-6.)
  const viewedRef = useRef<string | null>(null);
  useEffect(() => {
    if (pv && viewedRef.current !== pv.id) {
      viewedRef.current = pv.id;
      void api.logProviderContact({ providerId: pv.id, eventType: 'profile_view', sourceFlow: 'provider_detail', userArea });
    }
  }, [pv, userArea]);

  if (provider.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={labels.common.back} hitSlop={6}>
            <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
          </Pressable>
        </View>
        <ErrorBlock
          error={provider.error}
          onRetry={() => provider.refetch()}
          onAction={() => router.replace({ pathname: '/auth/login', params: { next: `/provider/${id}` } })}
        />
      </SafeAreaView>
    );
  }

  if (provider.isLoading || !pv) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top']}>
        <ActivityIndicator color={colors.green800} accessibilityLabel={labels.a11y.loadingProvider} />
      </SafeAreaView>
    );
  }

  const services = (category.data?.subs || []).slice(0, 4);
  const facts: { label: string; icon: string }[] = [];
  if (pv.availableToday) facts.push({ label: labels.provider.availableToday, icon: 'ph-clock' });
  if (pv.adminReviewed) facts.push({ label: labels.adminReviewed, icon: 'ph-seal-check' });
  if (pv.exp) facts.push({ label: fill(labels.provider.yearsExperience, { n: pv.exp }), icon: 'ph-medal' });
  if (pv.hasPastWork) facts.push({ label: labels.provider.hasPastWork, icon: 'ph-image-square' });
  if (pv.whatsapp) facts.push({ label: labels.provider.whatsappAvailable, icon: 'ph-whatsapp-logo' });
  if (pv.engagementTypes?.includes('temporary')) facts.push({ label: labels.provider.temporaryAvailable, icon: 'ph-calendar-check' });
  if (pv.engagementTypes?.includes('permanent')) facts.push({ label: labels.provider.permanentAvailable, icon: 'ph-shield-check' });
  if (pv.providerType === 'business') facts.push({ label: labels.provider.businessProvider, icon: 'ph-buildings' });

  const aboutParts = [
    pv.description,
    pv.exp
      ? fill(labels.provider.aboutExp, { n: pv.exp, area: pv.area })
      : fill(labels.provider.aboutServing, { area: pv.area }),
  ].filter(Boolean);
  const about = aboutParts.join(' ');

  const displayRating = localRating?.rating ?? pv.rating;
  const displayReviewCount = localRating?.reviewCount ?? pv.reviewCount;
  const hasRating = displayReviewCount > 0 && displayRating > 0;
  const reviewList = localReviews ?? reviews.data ?? [];

  // Guests → Sign in. Provider-only → customer login. Soft-fail never overrides local session.
  const providerOnlySession = loggedIn && activeSession === 'provider' && !hasCustomerToken;
  const eligibilityStatus = mapRateEligibilityCta({
    sessionReady,
    loggedIn,
    alreadyRated: localMyRating != null || eligibility.data?.status === 'already_rated',
    providerOnlySession,
  });

  const goCustomerLogin = () => {
    router.push({
      pathname: '/auth/login',
      params: { next: `/provider/${id}`, role: 'customer' },
    });
  };

  const onRateCta = () => {
    if (eligibilityStatus === 'need_login') {
      goCustomerLogin();
      return;
    }
    if (eligibilityStatus === 'need_customer') {
      showToast(labels.rating.errorCustomerRequired, 'ph-user');
      goCustomerLogin();
      return;
    }
    if (eligibilityStatus === 'already_rated') {
      const n = localMyRating ?? eligibility.data?.existing_rating ?? displayRating;
      showToast(fill(labels.rating.ctaAlready, { n: n || '' }), 'ph-star');
      return;
    }
    setSubmitError(null);
    setRateOpen(true);
  };

  const reviewLabels = {
    ctaSignIn: labels.rating.ctaSignIn,
    errorGeneric: labels.rating.errorGeneric,
    errorVelocity: labels.rating.errorVelocity,
    errorComment: labels.rating.errorComment,
    errorRateLimited: labels.rating.errorRateLimited,
    errorAlready: labels.rating.errorAlready,
    errorUnavailable: labels.rating.errorUnavailable,
    errorCustomerRequired: labels.rating.errorCustomerRequired,
    connectionMessage: labels.errors.connectionMessage,
  };

  const onSubmitReview = async (input: { rating: number; comment: string }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Fail fast when there is no customer Bearer (provider-only / logged-out edge).
      const tokens = await secureSession.read();
      if (!tokens?.accessToken) {
        const message =
          activeSession === 'provider'
            ? labels.rating.errorCustomerRequired
            : labels.rating.ctaSignIn;
        setHasCustomerToken(false);
        setSubmitError(message);
        setRateOpen(false);
        setTimeout(() => {
          showToast(message, 'ph-user');
          goCustomerLogin();
        }, 120);
        return;
      }

      const result = await api.submitProviderReview(pv.id, {
        rating: input.rating,
        comment: input.comment || undefined,
      });
      const nextCount = Math.max(1, Number(result.review_count) || (displayReviewCount || 0) + 1);
      const nextAvg = result.avg_rating != null && Number.isFinite(result.avg_rating)
        ? Number(result.avg_rating)
        : result.review.rating;
      setLocalReviews([result.review, ...reviewList.filter((r) => r.userName !== result.review.userName || r.text !== result.review.text)]);
      setLocalRating({ rating: nextAvg, reviewCount: nextCount });
      setLocalMyRating(result.review.rating);
      setRateOpen(false);
      setSubmitError(null);
      // Toast after close so it is not trapped under the sheet Modal.
      setTimeout(() => showToast(labels.rating.success, 'ph-star'), 120);
      void queryClient.invalidateQueries({ queryKey: keys.reviews(pv.id) });
      void queryClient.invalidateQueries({ queryKey: keys.provider(pv.id) });
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'eligibility', pv.id] });
      void queryClient.invalidateQueries({ queryKey: ['providers'] });
    } catch (err) {
      const message = reviewErrorMessage(err, reviewLabels, { activeSession });
      setSubmitError(message);
      const status = err instanceof HttpError ? err.status : 0;
      const code =
        err instanceof HttpError || err instanceof ApiBusinessError ? String(err.code || '') : '';
      if (status === 401 || code === 'UNAUTHORIZED' || code === 'SESSION_EXPIRED') {
        setRateOpen(false);
        setTimeout(() => {
          showToast(message, 'ph-user');
          goCustomerLogin();
        }, 120);
      } else if (code === 'ALREADY_RATED') {
        setLocalMyRating(input.rating);
        setRateOpen(false);
        setTimeout(() => showToast(message, 'ph-star'), 120);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const shareProvider = async () => {
    try {
      const url = `https://serrale.com/provider/${encodeURIComponent(pv.id)}`;
      const message = `${pv.name} · ${pv.service} · ${pv.area}\n${url}`;
      await Share.share({ message, url });
    } catch {
      showToast(labels.errors.unknownMessage, 'ph-warning-circle');
    }
  };

  const rateCtaLabel =
    eligibilityStatus === 'need_login'
      ? labels.rating.ctaSignIn
      : eligibilityStatus === 'need_customer'
        ? labels.rating.errorCustomerRequired
        : eligibilityStatus === 'already_rated'
          ? fill(labels.rating.ctaAlready, {
              n: localMyRating ?? eligibility.data?.existing_rating ?? '',
            })
          : labels.rating.ctaRate;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={labels.common.back} hitSlop={6}>
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.iconBtn} onPress={shareProvider} accessibilityRole="button" accessibilityLabel={labels.common.share}>
          <Icon name="ph-share-network" size={19} color={colors.text} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => save(pv.id)} accessibilityRole="button" accessibilityLabel={saved ? labels.common.saved : labels.common.save}>
          <Icon name="ph-bookmark-simple" size={21} color={saved ? colors.gold : colors.text} weight={saved ? 'fill' : 'regular'} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Avatar name={pv.name} size={74} radius={20} fontSize={27} imageUrl={pv.imageUrl} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name}>{pv.name}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.service}>{pv.service}</Text>
              {pv.verified && <Badge label={labels.common.verified} tone="trust" icon="ph-seal-check" />}
            </View>
            <View style={styles.ratingRow}>
              {hasRating ? (
                <View style={styles.ratingPill}>
                  <Icon name="ph-star" size={12} color={colors.gold} weight="fill" />
                  <Text style={styles.ratingText}>{displayRating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({displayReviewCount})</Text>
                </View>
              ) : null}
              <Icon name="ph-map-pin" size={12} color={colors.muted} />
              <Text style={styles.metaMuted}>{pv.area}</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facts}>
          {facts.map((f, i) => (
            <View key={i} style={styles.fact}>
              <Icon name={f.icon} size={14} color={colors.success} weight="fill" />
              <Text style={styles.factText}>{f.label}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.rateCta} onPress={onRateCta} accessibilityRole="button" accessibilityLabel={rateCtaLabel}>
          <Icon name="ph-star" size={18} color={colors.gold} weight="fill" />
          <Text style={styles.rateCtaText}>{rateCtaLabel}</Text>
          <Icon name="ph-caret-right" size={16} color={colors.muted} />
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.provider.about}</Text>
          <Text style={styles.about}>{about}</Text>
        </View>

        {services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.provider.services}</Text>
            <View style={styles.card}>
              {services.map((name, i) => (
                <View key={i} style={[styles.serviceRow, i < services.length - 1 && styles.serviceDivider]}>
                  <Icon name="ph-check-circle" size={17} color={colors.success} />
                  <Text style={styles.serviceName}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.pastWorkTitle}</Text>
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
            <Text style={styles.noData}>{labels.provider.noPastWork}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.reviewHead}>
            <Text style={styles.sectionTitle}>
              {labels.provider.reviews}
              {displayReviewCount > 0 ? ` · ${displayReviewCount}` : ''}
            </Text>
            {hasRating ? (
              <View style={styles.ratingPill}>
                <Icon name="ph-star" size={11} color={colors.gold} weight="fill" />
                <Text style={styles.ratingText}>{displayRating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
          {reviewList.length > 0 ? (
            reviewList.map((r, i) => (
              <View key={`${r.userName}-${i}`} style={[styles.reviewCard, i > 0 && { marginTop: 10 }]}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{(r.userName || '?')[0]}</Text>
                  </View>
                  <Text style={styles.reviewName}>{r.userName}</Text>
                  {!!r.area && <Text style={styles.reviewArea}>· {r.area}</Text>}
                  <View style={{ flex: 1 }} />
                  <Icon name="ph-star" size={12} color={colors.gold} weight="fill" />
                  <Text style={styles.reviewRating}>{r.rating}</Text>
                </View>
                {!!r.text && <Text style={styles.reviewText}>{r.text}</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.noData}>{labels.provider.noReviews}</Text>
          )}
        </View>

        <View style={styles.safetyCard}>
          <Icon name="ph-shield-check" size={22} color={colors.goldText} weight="fill" />
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>{labels.provider.staySafe}</Text>
            <Text style={styles.safetyText}>{labels.provider.safetyText}</Text>
            <Pressable style={styles.reportBtn} onPress={() => showToast(labels.provider.reportSent, 'ph-flag')} hitSlop={8} accessibilityRole="button" accessibilityLabel={labels.provider.reportProvider}>
              <Icon name="ph-flag" size={13} color={colors.danger} />
              <Text style={styles.reportText}>{labels.provider.reportProvider}</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <Button label={labels.common.call} icon="ph-phone-call" iconWeight="fill" onPress={() => call(pv)} style={styles.stickyBtn} />
        <Button label={labels.common.whatsapp} variant="whatsapp" icon="ph-whatsapp-logo" iconWeight="fill" onPress={() => whatsapp(pv)} style={styles.stickyBtn} />
      </View>

      <RateProviderSheet
        visible={rateOpen}
        providerName={pv.name}
        submitting={submitting}
        errorText={submitError}
        onClose={() => {
          if (submitting) return;
          setRateOpen(false);
          setSubmitError(null);
        }}
        onSubmit={onSubmitReview}
      />
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
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(246,185,59,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,185,59,0.28)',
  },
  ratingText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12.5 },
  ratingCount: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11.5 },
  metaMuted: { color: colors.muted, fontSize: 12.5, fontFamily: fonts.regular },
  facts: { gap: 7, marginTop: 16 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  factText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.text },
  rateCta: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(241,251,245,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.10)',
  },
  rateCtaText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13.5, color: colors.text },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontFamily: fonts.bold, color: colors.text, marginBottom: 9 },
  about: { fontSize: 13.5, color: colors.muted, lineHeight: 22, fontFamily: fonts.regular },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg + 1, overflow: 'hidden' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 14 },
  serviceDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  serviceName: { flex: 1, fontSize: 13.5, fontFamily: fonts.medium, color: colors.text },
  workCard: { width: 158, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg + 1, overflow: 'hidden' },
  workThumb: { height: 90, alignItems: 'center', justifyContent: 'center' },
  workTitle: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.text },
  workNote: { fontSize: 11, color: colors.muted, marginTop: 3, fontFamily: fonts.regular },
  noData: { fontSize: 12.5, color: colors.faint, fontFamily: fonts.regular },
  reviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  viewAll: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.success },
  reviewCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 12, paddingHorizontal: 14 },
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
  stickyBtn: { flex: 1 },
});
