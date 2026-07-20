import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchSharedLeads, logLeadContact } from '../src/api';
import EmptyState from '../src/components/EmptyState';
import ErrorBlock from '../src/components/ErrorBlock';
import ScreenHeader from '../src/components/ScreenHeader';
import { SkeletonProviderList } from '../src/components/Skeleton';
import { Icon } from '../src/lib/icons';
import { useLabels } from '../src/lib/labels';
import { colors, fonts, radius } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

const waDigits = (phone: string) => phone.replace(/[^0-9]/g, '');
const telNumber = (phone: string) => {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  const plus = cleaned.startsWith('+') ? '+' : '';
  return plus + cleaned.replace(/\+/g, '');
};

export default function SharedLeadsScreen() {
  const router = useRouter();
  const labels = useLabels();
  const activeSession = useAppStore((s) => s.activeSession);
  const showToast = useAppStore((s) => s.showToast);

  const query = useQuery({
    queryKey: ['shared-leads'],
    queryFn: () => fetchSharedLeads(),
    enabled: activeSession === 'provider',
  });

  const contact = async (leadId: string, phone: string, kind: 'phone_click' | 'whatsapp_click') => {
    try {
      await logLeadContact({ leadId, eventType: kind, sourceFlow: 'shared_leads' });
    } catch {
      // still open dialer
    }
    if (kind === 'phone_click') {
      Linking.openURL(`tel:${telNumber(phone)}`).catch(() => {});
      showToast(labels.contact.calling.replace('{name}', ''), 'ph-phone-call');
    } else {
      Linking.openURL(`whatsapp://send?phone=${waDigits(phone)}`).catch(() => {});
      showToast(labels.contact.openingWhatsapp, 'ph-whatsapp-logo');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Shared requests" onBack={() => router.back()} />
      {activeSession !== 'provider' ? (
        <View style={styles.pad}>
          <EmptyState
            icon="ph-tray"
            circle={colors.goldSoft}
            iconColor={colors.goldText}
            title="Provider login required"
            text="Switch to your provider account to see shared customer requests."
          />
        </View>
      ) : query.isLoading ? (
        <View style={styles.pad}>
          <SkeletonProviderList count={3} />
        </View>
      ) : query.isError ? (
        <View style={styles.pad}>
          <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
        </View>
      ) : (query.data?.leads.length ?? 0) === 0 ? (
        <View style={styles.pad}>
          <EmptyState
            icon="ph-tray"
            circle={colors.goldSoft}
            iconColor={colors.goldText}
            title="No shared requests"
            text="When admin shares a request with you, it appears here so you can Call or WhatsApp the client."
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {query.data!.leads.map((lead) => (
            <View key={lead.share_id} style={styles.card}>
              <Pressable
                onPress={() =>
                  lead.customer_id
                    ? router.push({ pathname: '/customer/[id]', params: { id: lead.customer_id } })
                    : undefined
                }
              >
                <Text style={styles.title}>{lead.display_name || lead.phone}</Text>
                <Text style={styles.meta}>
                  {[lead.service_need || lead.service_category, lead.location].filter(Boolean).join(' · ')}
                </Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable style={styles.call} onPress={() => void contact(lead.lead_id, lead.phone, 'phone_click')}>
                  <Icon name="ph-phone-call" size={16} color="#fff" weight="fill" />
                  <Text style={styles.actionText}>Call</Text>
                </Pressable>
                <Pressable
                  style={styles.wa}
                  onPress={() => void contact(lead.lead_id, lead.phone, 'whatsapp_click')}
                >
                  <Icon name="ph-whatsapp-logo" size={16} color="#fff" weight="fill" />
                  <Text style={styles.actionText}>WhatsApp</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 20 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  call: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green800,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  wa: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#128C7E',
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  actionText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 13 },
});
