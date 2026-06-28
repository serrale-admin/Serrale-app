import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationSheet from '../src/components/LocationSheet';
import ScreenHeader from '../src/components/ScreenHeader';
import { Icon } from '../src/lib/icons';
import { colors, fonts, radius, shadowCard } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

interface SRow {
  label: string;
  value?: string;
  onPress(): void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const area = useAppStore((s) => s.area);
  const setArea = useAppStore((s) => s.setArea);
  const lang = useAppStore((s) => s.lang);
  const showToast = useAppStore((s) => s.showToast);
  const [showLocation, setShowLocation] = useState(false);

  const groups: SRow[][] = [
    [
      { label: 'Account information', value: user ? user.name : 'Guest', onPress: () => showToast('Account info', 'ph-user') },
      { label: 'Phone number', value: user ? user.phone : 'Not set', onPress: () => showToast('Phone number', 'ph-phone') },
      { label: 'Default area', value: area, onPress: () => setShowLocation(true) },
    ],
    [
      { label: 'Language', value: lang === 'am' ? 'አማርኛ' : 'English', onPress: () => router.push('/language') },
      { label: 'Notifications', value: 'On', onPress: () => showToast('Notification settings', 'ph-bell') },
      { label: 'Privacy', onPress: () => showToast('Privacy settings', 'ph-lock') },
    ],
    [
      { label: 'Terms & policies', onPress: () => showToast('Terms', 'ph-file-text') },
      { label: 'Delete account', onPress: () => showToast('Contact support to delete', 'ph-warning'), danger: true },
    ],
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {groups.map((rows, gi) => (
          <View key={gi} style={styles.card}>
            {rows.map((r, ri) => (
              <Pressable key={ri} style={[styles.row, ri > 0 && styles.divider]} onPress={r.onPress}>
                <Text style={[styles.label, r.danger && { color: colors.danger }]}>{r.label}</Text>
                {!!r.value && <Text style={styles.value}>{r.value}</Text>}
                <Icon name="ph-caret-right" size={14} color="#cdd5cf" weight="bold" />
              </Pressable>
            ))}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
      <LocationSheet visible={showLocation} onClose={() => setShowLocation(false)} value={area} onSelect={setArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingTop: 4, gap: 13 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.09)', borderRadius: radius.xl, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.04 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  label: { flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.text },
  value: { fontSize: 13, color: colors.faint, fontFamily: fonts.regular },
});
