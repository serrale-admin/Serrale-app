import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../src/components/Button';
import ErrorBlock from '../../../src/components/ErrorBlock';
import ScreenHeader from '../../../src/components/ScreenHeader';
import { SkeletonProviderList } from '../../../src/components/Skeleton';
import * as api from '../../../src/api';
import type { ActivityType, DisplayStatus } from '../../../src/api/serrale/activity';
import { useLabels } from '../../../src/lib/labels';
import { colors, fonts, radius } from '../../../src/lib/theme';

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ActivityDetailScreen() {
  const router = useRouter();
  const labels = useLabels();
  const a = labels.activity;
  const params = useLocalSearchParams<{ type?: string; id?: string }>();
  const type = (params.type === 'job' ? 'job' : 'request') as ActivityType;
  const id = String(params.id || '');

  const query = useQuery({
    queryKey: ['customer-activity', type, id],
    queryFn: () => api.fetchActivityDetail(type, id),
    enabled: !!id,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={a.detailTitle} onBack={() => router.back()} />
      {query.isLoading ? (
        <View style={styles.pad}>
          <SkeletonProviderList count={3} />
        </View>
      ) : query.isError || !query.data ? (
        <View style={styles.pad}>
          <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{query.data.title}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {a.displayStatus[query.data.display_status as DisplayStatus] ?? query.data.display_status}
              </Text>
            </View>
            {query.data.engagement ? (
              <View style={[styles.pill, styles.pillMuted]}>
                <Text style={styles.pillMutedText}>
                  {query.data.engagement === 'temporary' ? a.temporary : a.permanent}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.meta}>
            {[query.data.location, formatDateTime(query.data.created_at)].filter(Boolean).join(' · ')}
          </Text>
          {query.data.note || query.data.description ? (
            <Text style={styles.body}>{query.data.note || query.data.description}</Text>
          ) : null}

          <Text style={styles.section}>{a.timeline}</Text>
          <View style={styles.timeline}>
            {(query.data.timeline ?? []).map((evt, idx) => (
              <View key={evt.id} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={styles.dot} />
                  {idx < (query.data.timeline?.length ?? 0) - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>
                    {evt.display_status
                      ? a.displayStatus[evt.display_status as DisplayStatus] ?? evt.display_status
                      : evt.to_status}
                  </Text>
                  <Text style={styles.timelineMeta}>{formatDateTime(evt.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>

          <Button
            label={a.postAnother}
            variant="secondary"
            onPress={() => router.push('/(tabs)/request')}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: { fontFamily: fonts.bold, fontSize: 12, color: colors.goldText },
  pillMuted: { backgroundColor: colors.soft },
  pillMutedText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 20 },
  section: {
    marginTop: 12,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timeline: { marginTop: 4 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 52 },
  timelineRail: { width: 16, alignItems: 'center' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green700,
    marginTop: 4,
  },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  timelineBody: { flex: 1, paddingBottom: 14 },
  timelineTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  timelineMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
});
