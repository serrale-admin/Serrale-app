import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ListRow from '../src/components/ListRow';
import LocationSheet from '../src/components/LocationSheet';
import ScreenHeader from '../src/components/ScreenHeader';
import { colors } from '../src/lib/theme';
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
          <Card key={gi} variant="group">
            {rows.map((r, ri) => (
              <ListRow
                key={ri}
                label={r.label}
                value={r.value}
                onPress={r.onPress}
                labelColor={r.danger ? colors.danger : colors.text}
                divided={ri > 0}
              />
            ))}
          </Card>
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
});
