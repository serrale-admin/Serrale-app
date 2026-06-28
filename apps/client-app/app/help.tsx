import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../src/components/ScreenHeader';
import { Icon } from '../src/lib/icons';
import { colors, fonts, radius, shadowCard } from '../src/lib/theme';
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
        <View style={styles.card}>
          {rows.map((r, i) => (
            <Pressable key={i} style={[styles.row, i > 0 && styles.divider]} onPress={r.onPress}>
              <View style={styles.icon}>
                <Icon name={r.icon} size={18} color={colors.success} weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{r.label}</Text>
                <Text style={styles.sub}>{r.sub}</Text>
              </View>
              <Icon name="ph-caret-right" size={14} color="#cdd5cf" weight="bold" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingTop: 4 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.09)', borderRadius: radius.xl, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.04 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  icon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text },
  sub: { fontSize: 11.5, color: colors.faint, marginTop: 1, fontFamily: fonts.regular },
});
