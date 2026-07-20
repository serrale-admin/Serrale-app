import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../src/components/Button';
import EmptyState from '../src/components/EmptyState';
import ErrorBlock from '../src/components/ErrorBlock';
import ProviderRow from '../src/components/ProviderRow';
import ScreenHeader from '../src/components/ScreenHeader';
import { SkeletonProviderList } from '../src/components/Skeleton';
import * as api from '../src/api';
import type { CustomerActivityItem, DisplayStatus } from '../src/api/serrale/activity';
import { resolveCustomerFeatureAccess } from '../src/lib/customerFeatureAccess';
import { presentError } from '../src/lib/error-presentation';
import { useLabels } from '../src/lib/labels';
import { colors, fonts, radius } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

type TabKey = 'requests' | 'saved';

function displayStatusLabel(status: DisplayStatus, labels: ReturnType<typeof useLabels>): string {
  const map = labels.activity?.displayStatus;
  if (!map) return status;
  return map[status] ?? status;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function SegmentControl({
  value,
  onChange,
  requestsLabel,
  savedLabel,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
  requestsLabel: string;
  savedLabel: string;
}) {
  return (
    <View style={styles.segmentTrack} accessibilityRole="tablist">
      {(
        [
          { key: 'requests' as const, label: requestsLabel },
          { key: 'saved' as const, label: savedLabel },
        ] as const
      ).map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.key)}
            style={[styles.segmentBtn, active && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActivityRow({
  item,
  onPress,
  statusLabel,
  temporaryLabel,
  permanentLabel,
}: {
  item: CustomerActivityItem;
  onPress: () => void;
  statusLabel: string;
  temporaryLabel: string;
  permanentLabel: string;
}) {
  const engagement =
    item.engagement === 'temporary'
      ? temporaryLabel
      : item.engagement === 'permanent'
        ? permanentLabel
        : null;
  return (
    <Pressable onPress={onPress} style={styles.activityCard}>
      <View style={styles.activityTop}>
        <Text style={styles.activityTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.activityMeta} numberOfLines={1}>
        {[engagement, item.location, formatDate(item.created_at)].filter(Boolean).join(' · ')}
      </Text>
    </Pressable>
  );
}

function RequestsPane() {
  const router = useRouter();
  const labels = useLabels();
  const sessionReady = useAppStore((s) => s.sessionReady);
  const loggedIn = useAppStore((s) => s.loggedIn);
  const activeSession = useAppStore((s) => s.activeSession);
  const providerProfile = useAppStore((s) => s.providerProfile);
  const access = resolveCustomerFeatureAccess({
    sessionReady,
    loggedIn,
    activeSession,
    hasProviderProfile: !!providerProfile,
  });
  const a = labels.activity;

  const query = useQuery({
    queryKey: ['customer-activity'],
    queryFn: () => api.fetchMyActivity({ limit: 50 }),
    enabled: access === 'allowed',
  });

  if (access === 'loading') {
    return (
      <View style={styles.list}>
        <SkeletonProviderList count={4} />
      </View>
    );
  }

  if (access === 'need_login') {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          icon="ph-tray"
          circle={colors.goldSoft}
          iconColor={colors.goldText}
          title={a.loginTitle}
          text={a.loginText}
        >
          <Button
            label={labels.common.loginWithPhone}
            onPress={() =>
              router.replace({
                pathname: '/auth/login',
                params: { next: '/bookmarks?tab=requests', reason: labels.auth.reasonRequest },
              })
            }
            style={styles.cta}
          />
        </EmptyState>
      </View>
    );
  }

  if (query.isLoading) {
    return (
      <View style={styles.list}>
        <SkeletonProviderList count={4} />
      </View>
    );
  }

  if (query.isError) {
    // Provider/customer still signed in — never frame a load failure as "Signed out".
    const mapped = presentError(query.error, labels);
    const isFalseSignOut =
      mapped.kind === 'session-expired' &&
      (loggedIn || activeSession === 'provider' || !!providerProfile);
    return (
      <View style={styles.emptyWrap}>
        <ErrorBlock
          error={query.error}
          title={isFalseSignOut ? labels.errors.unknownTitle : undefined}
          text={isFalseSignOut ? labels.errors.unknownMessage : undefined}
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  const items = query.data?.items ?? [];
  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          icon="ph-tray"
          circle={colors.goldSoft}
          iconColor={colors.goldText}
          title={a.emptyTitle}
          text={a.emptyText}
        >
          <Button label={a.postRequest} onPress={() => router.push('/(tabs)/request')} style={styles.cta} />
        </EmptyState>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {items.map((item) => (
        <ActivityRow
          key={`${item.type}:${item.id}`}
          item={item}
          statusLabel={displayStatusLabel(item.display_status, labels)}
          temporaryLabel={a.temporary}
          permanentLabel={a.permanent}
          onPress={() =>
            router.push({
              pathname: '/activity/[type]/[id]',
              params: { type: item.type, id: item.id },
            })
          }
        />
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function SavedPane() {
  const router = useRouter();
  const labels = useLabels();
  const saved = useAppStore((s) => s.saved);
  const savedIds = Object.keys(saved);
  const providerQueries = useQueries({
    queries: savedIds.map((id) => ({
      queryKey: ['provider', id],
      queryFn: () => api.getProvider(id),
      enabled: !!id,
    })),
  });
  const list = providerQueries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const isLoading = savedIds.length > 0 && providerQueries.some((q) => q.isLoading);
  const isError = savedIds.length > 0 && list.length === 0 && providerQueries.some((q) => q.isError);

  if (isLoading) {
    return (
      <View style={styles.list}>
        <SkeletonProviderList count={4} />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.emptyWrap}>
        <ErrorBlock
          error={providerQueries.find((q) => q.isError)?.error}
          onRetry={() => providerQueries.forEach((q) => q.refetch())}
          onAction={() => router.replace({ pathname: '/auth/login', params: { next: '/bookmarks?tab=saved' } })}
        />
      </View>
    );
  }
  if (list.length > 0) {
    return (
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {list.map((p) => (
          <ProviderRow key={p.id} provider={p} />
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }
  return (
    <View style={styles.emptyWrap}>
      <EmptyState
        icon="ph-bookmark-simple"
        circle={colors.goldSoft}
        iconColor={colors.goldText}
        title={labels.bookmarks.emptyTitle}
        text={labels.bookmarks.emptyText}
      >
        <Button label={labels.common.browseProviders} onPress={() => router.push('/providers')} style={styles.cta} />
      </EmptyState>
    </View>
  );
}

export default function BookmarksScreen() {
  const labels = useLabels();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initial: TabKey = params.tab === 'requests' ? 'requests' : 'saved';
  const [tab, setTab] = useState<TabKey>(initial);

  useEffect(() => {
    if (params.tab === 'requests' || params.tab === 'saved') {
      setTab(params.tab);
    }
  }, [params.tab]);

  const title = useMemo(
    () => (tab === 'requests' ? labels.activity.screenTitle : labels.common.savedProviders),
    [tab, labels],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={title} />
      <View style={styles.segmentWrap}>
        <SegmentControl
          value={tab}
          onChange={setTab}
          requestsLabel={labels.activity.tabRequests}
          savedLabel={labels.activity.tabSaved}
        />
      </View>
      {tab === 'requests' ? <RequestsPane /> : <SavedPane />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  segmentWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: colors.soft,
    borderRadius: radius.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.text,
  },
  list: { paddingHorizontal: 16, gap: 10 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  cta: { marginTop: 20, paddingHorizontal: 22 },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 6,
  },
  activityTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  activityTitle: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  statusPill: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillText: { fontFamily: fonts.bold, fontSize: 11, color: colors.goldText },
  activityMeta: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
});
