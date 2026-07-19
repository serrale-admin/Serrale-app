import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ListRow from '../src/components/ListRow';
import LocationSheet from '../src/components/LocationSheet';
import ScreenHeader from '../src/components/ScreenHeader';
import { areaLabel } from '../src/lib/directory-display';
import { useLabels } from '../src/lib/labels';
import { displayEthiopianPhone } from '../src/lib/phone';
import { colors } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

const TERMS_URL = 'https://serrale.com/terms';
const PRIVACY_URL = 'https://serrale.com/privacy';

interface SRow {
  label: string;
  value?: string;
  sub?: string;
  onPress(): void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const labels = useLabels();
  const t = labels.settings;
  const user = useAppStore((s) => s.user);
  const activeSession = useAppStore((s) => s.activeSession);
  const providerProfile = useAppStore((s) => s.providerProfile);
  const loggedIn = useAppStore((s) => s.loggedIn);
  const area = useAppStore((s) => s.area);
  const lang = useAppStore((s) => s.lang);
  const am = lang === 'am';
  const setArea = useAppStore((s) => s.setArea);
  const showToast = useAppStore((s) => s.showToast);
  const [showLocation, setShowLocation] = useState(false);

  const isProvider = activeSession === 'provider' && !!providerProfile;
  const phoneRaw = isProvider ? providerProfile!.phone : user?.phone || '';
  const phoneDisplay = phoneRaw ? displayEthiopianPhone(phoneRaw) : t.notSet;

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else showToast(labels.errors.unknownMessage, 'ph-warning-circle');
    } catch {
      showToast(labels.errors.unknownMessage, 'ph-warning-circle');
    }
  };

  const profileGroups: SRow[][] = loggedIn
    ? [
        [
          {
            label: t.phoneNumber,
            value: phoneDisplay,
            sub: t.phoneReadOnly,
            onPress: () => showToast(t.phoneReadOnly, 'ph-lock'),
          },
          {
            label: t.defaultArea,
            value: areaLabel(area, am),
            sub: t.defaultAreaHint,
            onPress: () => setShowLocation(true),
          },
        ],
        [
          { label: labels.common.language, value: lang === 'am' ? 'አማርኛ' : 'English', onPress: () => router.push('/language') },
          { label: labels.common.notifications, value: t.on, onPress: () => router.push('/notifications') },
          { label: t.privacy, onPress: () => openUrl(PRIVACY_URL) },
        ],
        [
          { label: t.terms, onPress: () => openUrl(TERMS_URL) },
          { label: t.deleteAccount, onPress: () => showToast(t.deleteToast, 'ph-warning'), danger: true },
        ],
      ]
    : [
        [
          { label: labels.common.language, value: lang === 'am' ? 'አማርኛ' : 'English', onPress: () => router.push('/language') },
          {
            label: t.defaultArea,
            value: areaLabel(area, am),
            sub: t.defaultAreaHint,
            onPress: () => setShowLocation(true),
          },
        ],
        [
          { label: t.terms, onPress: () => openUrl(TERMS_URL) },
          { label: labels.common.helpSupport, onPress: () => router.push('/help') },
        ],
      ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={labels.common.settings} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {profileGroups.map((rows, gi) => (
          <Card key={gi} variant="group">
            {rows.map((r, ri) => (
              <ListRow
                key={ri}
                label={r.label}
                value={r.value}
                sub={r.sub}
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
