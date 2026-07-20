import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../../src/api';
import { PROVIDER_REPORT_REASONS } from '../../src/api';
import Button from '../../src/components/Button';
import ErrorBlock from '../../src/components/ErrorBlock';
import ScreenHeader from '../../src/components/ScreenHeader';
import { SkeletonProviderList } from '../../src/components/Skeleton';
import { generateRequestId } from '../../src/lib/request-policy';
import { useLabels } from '../../src/lib/labels';
import { colors, fonts, radius } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

export default function CustomerTrustScreen() {
  const router = useRouter();
  const labels = useLabels();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const customerId = String(id || '');
  const activeSession = useAppStore((s) => s.activeSession);
  const showToast = useAppStore((s) => s.showToast);
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const trust = useQuery({
    queryKey: ['customer-trust', customerId],
    queryFn: () => api.fetchCustomerTrust(customerId),
    enabled: !!customerId,
  });

  const eligibility = useQuery({
    queryKey: ['customer-review-eligibility', customerId],
    queryFn: () => api.fetchCustomerReviewEligibility(customerId),
    enabled: !!customerId && activeSession === 'provider',
  });

  const submit = useMutation({
    mutationFn: () =>
      api.submitCustomerReview(
        customerId,
        { rating, comment: comment.trim() || undefined },
        generateRequestId(),
      ),
    onSuccess: () => {
      showToast(labels.rating.thanksTitle, 'ph-star');
      void qc.invalidateQueries({ queryKey: ['customer-trust', customerId] });
      void qc.invalidateQueries({ queryKey: ['customer-review-eligibility', customerId] });
    },
    onError: () => showToast(labels.errors.unknownMessage, 'ph-warning-circle'),
  });

  const report = () => {
    const reasonLabels: Record<string, string> = {
      spam: labels.provider.reportReasonSpam,
      scam: labels.provider.reportReasonScam,
      inappropriate: labels.provider.reportReasonInappropriate,
      wrong_info: labels.provider.reportReasonWrongInfo,
      not_reachable: labels.provider.reportReasonNotReachable,
      other: labels.provider.reportReasonOther,
    };
    Alert.alert(labels.provider.reportChooseReason, undefined, [
      ...PROVIDER_REPORT_REASONS.map((reason) => ({
        text: reasonLabels[reason] || reason,
        onPress: () => {
          void api
            .reportCustomer(customerId, { reason, source_flow: 'customer_trust' })
            .then(() => showToast(labels.provider.reportSent, 'ph-check-circle'))
            .catch(() => showToast(labels.errors.unknownMessage, 'ph-warning-circle'));
        },
      })),
      { text: labels.common.cancel, style: 'cancel' as const },
    ]);
  };

  const c = trust.data?.customer;
  const isCompany = c?.client_type === 'company';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={c?.display_name || 'Client'} onBack={() => router.back()} />
      {trust.isLoading ? (
        <View style={styles.pad}>
          <SkeletonProviderList count={3} />
        </View>
      ) : trust.isError || !c ? (
        <View style={styles.pad}>
          <ErrorBlock error={trust.error} onRetry={() => trust.refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.name}>{c.display_name}</Text>
          {isCompany && c.company_name ? <Text style={styles.badge}>Company · {c.company_name}</Text> : null}
          <Text style={styles.meta}>
            {[c.area_slug, c.review_count ? `${c.avg_rating ?? '—'}★ (${c.review_count})` : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>

          {activeSession === 'provider' ? (
            <View style={styles.card}>
              <Text style={styles.section}>Rate this client</Text>
              {eligibility.data?.status === 'already_rated' ? (
                <Text style={styles.meta}>You already rated this client.</Text>
              ) : eligibility.data?.status === 'need_contact' ? (
                <Text style={styles.meta}>Contact them via Call or WhatsApp first.</Text>
              ) : (
                <>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable key={n} onPress={() => setRating(n)}>
                        <Text style={[styles.star, n <= rating && styles.starOn]}>{n <= rating ? '★' : '☆'}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Optional comment"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <Button label={labels.rating.submit} loading={submit.isPending} onPress={() => submit.mutate()} />
                </>
              )}
              <Button label={labels.provider.reportProvider} variant="secondary" onPress={report} style={{ marginTop: 10 }} />
            </View>
          ) : null}

          <Text style={styles.section}>Reviews</Text>
          {(trust.data?.reviews ?? []).length === 0 ? (
            <Text style={styles.meta}>No reviews yet.</Text>
          ) : (
            trust.data!.reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <Text style={styles.reviewTitle}>
                  {r.display_name} · {r.rating}★
                </Text>
                {r.comment ? <Text style={styles.meta}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 16, gap: 12 },
  name: { fontFamily: fonts.sansBold, fontSize: 22, color: colors.ink },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldSoft,
    color: colors.goldText,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  section: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink, marginTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 28, color: colors.muted },
  starOn: { color: colors.gold },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    fontFamily: fonts.sans,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  review: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  reviewTitle: { fontFamily: fonts.sansSemi, color: colors.ink },
});
