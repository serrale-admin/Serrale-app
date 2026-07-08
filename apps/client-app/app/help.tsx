import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ListRow from '../src/components/ListRow';
import ScreenHeader from '../src/components/ScreenHeader';
import { useLabels } from '../src/lib/labels';
import { colors } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

export default function HelpScreen() {
  const router = useRouter();
  const labels = useLabels();
  const t = labels.help;
  const showToast = useAppStore((s) => s.showToast);

  const rows = [
    { label: t.callSupport, sub: '+251 11 000 0000', icon: 'ph-phone-call', onPress: () => showToast(t.callingSupport, 'ph-phone-call') },
    { label: t.whatsappSupport, sub: t.chatWithTeam, icon: 'ph-whatsapp-logo', onPress: () => showToast(labels.contact.openingWhatsapp, 'ph-whatsapp-logo') },
    { label: t.faq, sub: t.commonQuestions, icon: 'ph-question', onPress: () => showToast(t.openingFaq, 'ph-question') },
    { label: labels.common.safetyTips, sub: labels.safetyTitle, icon: 'ph-shield-check', onPress: () => router.push('/safety') },
    { label: t.reportIssue, sub: t.reportIssueSub, icon: 'ph-flag', onPress: () => showToast(t.openingReport, 'ph-flag') },
    { label: t.telegram, sub: t.joinCommunity, icon: 'ph-telegram-logo', onPress: () => showToast(t.openingTelegram, 'ph-telegram-logo') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={labels.common.helpSupport} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card variant="group">
          {rows.map((r, i) => (
            <ListRow key={i} label={r.label} sub={r.sub} icon={r.icon} onPress={r.onPress} divided={i > 0} />
          ))}
        </Card>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingTop: 4 },
});
