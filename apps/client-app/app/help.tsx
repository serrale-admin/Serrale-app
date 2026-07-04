import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ListRow from '../src/components/ListRow';
import ScreenHeader from '../src/components/ScreenHeader';
import { colors } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

export default function HelpScreen() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);

  const rows = [
    { label: 'Call SERRALE support', sub: '+251 11 000 0000', icon: 'ph-phone-call', onPress: () => showToast('Calling SERRALE support…', 'ph-phone-call') },
    { label: 'WhatsApp support', sub: 'Chat with our team', icon: 'ph-whatsapp-logo', onPress: () => showToast('Opening WhatsApp…', 'ph-whatsapp-logo') },
    { label: 'Frequently asked questions', sub: 'Common questions', icon: 'ph-question', onPress: () => showToast('Opening FAQ…', 'ph-question') },
    { label: 'Safety tips', sub: 'Stay safe with SERRALE', icon: 'ph-shield-check', onPress: () => router.push('/safety') },
    { label: 'Report an issue', sub: 'Tell us what went wrong', icon: 'ph-flag', onPress: () => showToast('Report form opening…', 'ph-flag') },
    { label: 'Telegram community', sub: 'Join the community', icon: 'ph-telegram-logo', onPress: () => showToast('Opening Telegram…', 'ph-telegram-logo') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Help & Support" />
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
