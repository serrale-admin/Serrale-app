import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../src/api';
import Button from '../src/components/Button';
import EmptyState from '../src/components/EmptyState';
import ErrorBlock from '../src/components/ErrorBlock';
import ScreenHeader from '../src/components/ScreenHeader';
import { useLabels } from '../src/lib/labels';
import { colors, fonts, radius } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const labels = useLabels();
  const loggedIn = useAppStore((s) => s.loggedIn);
  const sessionReady = useAppStore((s) => s.sessionReady);
  const activeSession = useAppStore((s) => s.activeSession);
  const providerProfile = useAppStore((s) => s.providerProfile);
  const showToast = useAppStore((s) => s.showToast);
  const qc = useQueryClient();
  // Same hybrid gate as request history — provider sessions count as signed in.
  const canLoad =
    sessionReady &&
    (loggedIn || activeSession === 'provider' || !!providerProfile);

  const query = useQuery({
    queryKey: ['directory-notifications', activeSession],
    queryFn: () => api.fetchNotifications({ limit: 50 }),
    enabled: canLoad,
  });

  const markAll = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['directory-notifications'] });
      showToast(labels.completed, 'ph-check-circle');
    },
  });

  const onOpen = async (id: string, payload: Record<string, unknown>) => {
    try {
      await api.markNotificationRead(id);
      void qc.invalidateQueries({ queryKey: ['directory-notifications'] });
    } catch {
      // non-blocking
    }
    const actorCustomerId = payload.actor_customer_id ? String(payload.actor_customer_id) : '';
    const actorProviderId = payload.actor_provider_id ? String(payload.actor_provider_id) : '';
    if (activeSession === 'provider' && actorCustomerId) {
      router.push({ pathname: '/customer/[id]', params: { id: actorCustomerId } });
      return;
    }
    if (activeSession === 'customer' && actorProviderId) {
      router.push({ pathname: '/provider/[id]', params: { id: actorProviderId } });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={labels.common.notifications}
        onBack={() => router.back()}
        right={
          canLoad && (query.data?.unread_count ?? 0) > 0 ? (
            <Pressable onPress={() => markAll.mutate()} hitSlop={8}>
              <Text style={styles.markAll}>{labels.errors.retry}</Text>
            </Pressable>
          ) : null
        }
      />

      {!canLoad ? (
        <View style={styles.pad}>
          <EmptyState
            icon="ph-bell"
            circle={colors.goldSoft}
            iconColor={colors.goldText}
            title={labels.activity.loginTitle}
            text={labels.activity.loginText}
          >
            <Button
              label={labels.common.loginWithPhone}
              onPress={() =>
                router.replace({
                  pathname: '/auth/login',
                  params: { next: '/notifications' },
                })
              }
            />
          </EmptyState>
        </View>
      ) : query.isLoading ? (
        <Text style={styles.loading}>…</Text>
      ) : query.isError ? (
        <View style={styles.pad}>
          <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
        </View>
      ) : (query.data?.items.length ?? 0) === 0 ? (
        <View style={styles.pad}>
          <EmptyState
            icon="ph-bell"
            circle={colors.goldSoft}
            iconColor={colors.goldText}
            title={labels.common.notifications}
            text={labels.settings.notificationsToast}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {query.data!.items.map((item) => {
            const unread = !item.read_at;
            return (
              <Pressable
                key={item.id}
                style={[styles.row, unread && styles.rowUnread]}
                onPress={() => void onOpen(item.id, item.payload)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.meta}>{formatWhen(item.created_at)}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 20 },
  list: { padding: 16, gap: 10 },
  loading: { padding: 20, color: colors.muted, fontFamily: fonts.regular },
  markAll: { color: colors.green800, fontFamily: fonts.semibold, fontSize: 13 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowUnread: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  rowText: { gap: 4 },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, lineHeight: 18 },
  meta: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 4 },
});
