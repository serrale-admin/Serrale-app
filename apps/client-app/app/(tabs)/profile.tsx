import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../src/components/Avatar';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import ListRow from '../../src/components/ListRow';
import { Icon } from '../../src/lib/icons';
import { useLabels } from '../../src/lib/labels';
import { colors, fonts, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

interface Row {
  label: string;
  icon: string;
  onPress(): void;
  tint?: string;
  iconColor?: string;
  labelColor?: string;
  chevron?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const labels = useLabels();
  const loggedIn = useAppStore((s) => s.loggedIn);
  const user = useAppStore((s) => s.user);
  const area = useAppStore((s) => s.area);
  const showToast = useAppStore((s) => s.showToast);

  const onLogout = async () => {
    const { handleLogout } = require('../../src/lib/session-manager');
    await handleLogout();
  };

  const becomeProvider: Row = {
    label: labels.profile.becomeProvider,
    icon: 'ph-storefront',
    onPress: () => showToast(labels.profile.becomeProviderToast, 'ph-storefront'),
    tint: colors.goldSoft,
    iconColor: colors.goldText,
  };

  const groups: Row[][] = loggedIn
    ? [
        [
          { label: labels.profile.myRequests, icon: 'ph-tray', onPress: () => showToast(labels.profile.noRequests, 'ph-tray') },
          { label: labels.common.savedProviders, icon: 'ph-bookmark-simple', onPress: () => router.push('/bookmarks') },
          { label: labels.common.notifications, icon: 'ph-bell', onPress: () => showToast(labels.profile.noNotifications, 'ph-bell') },
        ],
        [
          { label: labels.common.language, icon: 'ph-translate', onPress: () => router.push('/language') },
          { label: labels.common.helpSupport, icon: 'ph-question', onPress: () => router.push('/help') },
          { label: labels.common.safetyTips, icon: 'ph-shield-check', onPress: () => router.push('/safety') },
        ],
        [
          becomeProvider,
          { label: labels.common.settings, icon: 'ph-gear', onPress: () => router.push('/settings') },
          { label: labels.profile.logout, icon: 'ph-sign-out', onPress: onLogout, tint: colors.dangerSoft, iconColor: colors.danger, labelColor: colors.danger, chevron: false },
        ],
      ]
    : [
        [
          { label: labels.common.helpSupport, icon: 'ph-question', onPress: () => router.push('/help') },
          { label: labels.common.language, icon: 'ph-translate', onPress: () => router.push('/language') },
          { label: labels.common.safetyTips, icon: 'ph-shield-check', onPress: () => router.push('/safety') },
        ],
        [becomeProvider],
      ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.h1}>{labels.tabs.profile}</Text>

        {!loggedIn && (
          <LinearGradient colors={[colors.green800, colors.green700]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <Icon name="ph-user" size={30} color="#fff" weight="fill" />
            </View>
            <Text style={styles.guestTitle}>{labels.common.welcomeToSerrale}</Text>
            <Text style={styles.guestText}>{labels.profile.guestText}</Text>
            <Button
              label={labels.common.loginWithPhone}
              icon="ph-phone"
              iconWeight="fill"
              variant="gold"
              size="md"
              fullWidth
              onPress={() => router.replace({ pathname: '/auth/login', params: { reason: labels.auth.reasonProfile, next: '/(tabs)/profile' } })}
              style={styles.guestBtn}
            />
          </LinearGradient>
        )}

        {loggedIn && user && (
          <View style={styles.userCard}>
            <Avatar name={user.name} size={56} radius={18} fontSize={22} gradient={['#0a5d3f', '#13845a']} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              <View style={styles.userArea}>
                <Icon name="ph-map-pin" size={12} color={colors.success} weight="fill" />
                <Text style={styles.userAreaText}>{area}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.groups}>
          {groups.map((rows, gi) => (
            <Card key={gi} variant="group">
              {rows.map((r, ri) => (
                <ListRow
                  key={ri}
                  label={r.label}
                  icon={r.icon}
                  iconColor={r.iconColor || colors.success}
                  iconTint={r.tint || colors.soft}
                  labelColor={r.labelColor || colors.text}
                  chevron={r.chevron !== false}
                  onPress={r.onPress}
                  divided={ri > 0}
                />
              ))}
            </Card>
          ))}
          <Text style={styles.version}>SERRALE Basic · v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 14 },
  guestCard: { marginHorizontal: 16, borderRadius: radius.xl + 2, padding: 22, paddingHorizontal: 18, alignItems: 'center' },
  guestAvatar: { width: 62, height: 62, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  guestTitle: { fontFamily: fonts.heading, fontSize: 18, color: '#fff', marginTop: 12 },
  guestText: { fontSize: 12.5, color: 'rgba(255,255,255,0.72)', lineHeight: 18, marginTop: 5, textAlign: 'center', fontFamily: fonts.regular },
  guestBtn: { marginTop: 16 },
  userCard: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.1)', borderRadius: radius.xl + 2, padding: 16, ...shadowCard, shadowOpacity: 0.05 },
  userName: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  userPhone: { fontSize: 12.5, color: colors.muted, marginTop: 2, fontFamily: fonts.regular },
  userArea: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  userAreaText: { fontSize: 11.5, color: colors.success, fontFamily: fonts.semibold },
  groups: { paddingHorizontal: 16, paddingTop: 18, gap: 13 },
  version: { textAlign: 'center', fontSize: 11, color: '#aab4ac', paddingVertical: 6, fontFamily: fonts.regular },
});
