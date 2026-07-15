import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../src/components/Avatar';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import ListRow from '../../src/components/ListRow';
import { CATS } from '../../src/data/mock';
import { areaLabel, categoryLabel } from '../../src/lib/directory-display';
import { Icon } from '../../src/lib/icons';
import { useLabels } from '../../src/lib/labels';
import { displayEthiopianPhone } from '../../src/lib/phone';
import { switchToProviderAccount } from '../../src/lib/session-manager';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

interface Row {
  label: string;
  icon: string;
  onPress(): void;
  tint?: string;
  iconColor?: string;
  labelColor?: string;
  sub?: string;
  chevron?: boolean;
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {children}
    </View>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <View style={styles.identityBanner}>
      <View style={styles.identityRow}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonTextCol}>
          <View style={[styles.skeletonLineOnGreen, { width: '58%' }]} />
          <View style={[styles.skeletonLineOnGreen, { width: '42%', marginTop: 8 }]} />
        </View>
      </View>
      <View style={styles.skeletonEditStrip} />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const labels = useLabels();
  const p = labels.profile;
  const sessionReady = useAppStore((s) => s.sessionReady);
  const loggedIn = useAppStore((s) => s.loggedIn);
  const user = useAppStore((s) => s.user);
  const activeSession = useAppStore((s) => s.activeSession);
  const providerProfile = useAppStore((s) => s.providerProfile);
  const phoneHasProvider = useAppStore((s) => s.phoneHasProvider);
  const lang = useAppStore((s) => s.lang);
  const am = lang === 'am';
  const showToast = useAppStore((s) => s.showToast);

  const isProviderSession = activeSession === 'provider' && !!providerProfile;
  const isCustomerSession = activeSession === 'customer' && loggedIn && !!user;
  const isAuthenticated = sessionReady && (isProviderSession || isCustomerSession);

  const displayName = isProviderSession
    ? providerProfile!.full_name?.trim() || ''
    : user?.name?.trim() || '';
  const phoneRaw = isProviderSession ? providerProfile!.phone : user?.phone || '';
  const phoneDisplay = phoneRaw ? displayEthiopianPhone(phoneRaw) : '';
  const profilePhoto = isProviderSession ? providerProfile!.photo_url ?? undefined : undefined;
  const profileArea = isProviderSession ? providerProfile!.area ?? null : null;
  const categorySlug = isProviderSession ? providerProfile!.category_slug : null;
  const category = categorySlug ? CATS.find((c) => c.id === categorySlug) : undefined;
  const categoryText = category ? categoryLabel(category, am) : categorySlug || '';

  const onLogout = async () => {
    const { handleLogout } = require('../../src/lib/session-manager');
    await handleLogout();
  };

  const onSwitchToProvider = async () => {
    const result = await switchToProviderAccount();
    if (result === 'switched') {
      showToast(p.switchToProvider, 'ph-briefcase');
      return;
    }
    showToast(p.switchToProviderRelogin, 'ph-warning-circle');
  };

  const becomeProvider: Row = {
    label: p.becomeProvider,
    icon: 'ph-storefront',
    onPress: () => router.push('/provider/join'),
    tint: colors.goldSoft,
    iconColor: colors.goldText,
  };

  const switchProvider: Row = {
    label: p.switchToProvider,
    icon: 'ph-briefcase',
    onPress: onSwitchToProvider,
    tint: colors.frost,
    iconColor: colors.green700,
    sub: p.switchToProviderSub,
  };

  const accountRows: Row[] = isAuthenticated
    ? [
        ...(isCustomerSession
          ? [
              {
                label: p.myRequests,
                icon: 'ph-tray',
                onPress: () => router.push('/(tabs)/request'),
              } as Row,
              {
                label: labels.common.savedProviders,
                icon: 'ph-bookmark-simple',
                onPress: () => router.push('/bookmarks'),
              } as Row,
            ]
          : []),
        ...(isCustomerSession && phoneHasProvider ? [switchProvider] : []),
        ...(isCustomerSession && !phoneHasProvider ? [becomeProvider] : []),
      ]
    : [becomeProvider];

  const appSettingsRows: Row[] = [
    {
      label: labels.common.language,
      icon: 'ph-translate',
      onPress: () => router.push('/language'),
      sub: lang === 'am' ? labels.language.amharic : 'English',
    },
    {
      label: labels.common.settings,
      icon: 'ph-sliders-horizontal',
      onPress: () => router.push('/settings'),
      sub: p.appSettingsSub,
    },
  ];

  const supportRows: Row[] = [
    { label: labels.common.helpSupport, icon: 'ph-question', onPress: () => router.push('/help') },
    { label: labels.common.safetyTips, icon: 'ph-shield-check', onPress: () => router.push('/safety') },
  ];

  const guestSupportRows: Row[] = [
    ...supportRows,
    { label: labels.common.language, icon: 'ph-translate', onPress: () => router.push('/language') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.h1}>{labels.tabs.profile}</Text>

          {!sessionReady && <ProfileHeaderSkeleton />}

          {sessionReady && !isAuthenticated && (
            <>
              <View style={styles.signInCard}>
                <Text style={styles.signInTitle}>{labels.common.welcomeToSerrale}</Text>
                <Text style={styles.signInSub}>{p.guestText}</Text>
                <Button
                  label={labels.common.loginWithPhone}
                  icon="ph-phone"
                  iconWeight="fill"
                  variant="gold"
                  size="md"
                  fullWidth
                  onPress={() => router.push({ pathname: '/auth/login', params: { next: '/(tabs)/profile' } })}
                  style={styles.signInBtn}
                />
              </View>

              <SectionBlock title={p.sectionAccount}>
                <Card variant="group">
                  <ListRow
                    label={p.becomeProvider}
                    icon="ph-storefront"
                    iconColor={colors.goldText}
                    iconTint={colors.goldSoft}
                    onPress={() => router.push('/provider/join')}
                  />
                </Card>
              </SectionBlock>
            </>
          )}

          {sessionReady && isAuthenticated && (
            <>
              <LinearGradient
                colors={[colors.green800, colors.green700]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.identityBanner}
              >
                <View style={styles.identityRow}>
                  <Avatar
                    name={displayName || phoneDisplay}
                    size={56}
                    radius={18}
                    fontSize={22}
                    imageUrl={profilePhoto}
                    gradient={['#0a5d3f', '#13845a']}
                  />
                  <View style={styles.identityMeta}>
                    <Text style={styles.identityNameOnGreen} numberOfLines={2}>
                      {displayName || phoneDisplay}
                    </Text>
                    {!!phoneDisplay && displayName ? (
                      <Text style={styles.identityPhoneOnGreen}>{phoneDisplay}</Text>
                    ) : null}
                    {isProviderSession && (
                      <View style={styles.providerPill}>
                        <Text style={styles.providerPillText}>{p.roleProvider}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.identityEditStrip, pressed && { opacity: 0.92 }]}
                  onPress={() => router.push('/profile/edit')}
                  accessibilityRole="button"
                  accessibilityLabel={p.editProfile}
                >
                  <Text style={styles.identityEditText}>{p.editProfile}</Text>
                  <Icon name="ph-caret-right" size={14} color={colors.goldText} weight="bold" />
                </Pressable>
              </LinearGradient>

              {isCustomerSession && user?.profileComplete === false && (
                <Pressable
                  style={({ pressed }) => [styles.promptCard, pressed && { opacity: 0.92 }]}
                  onPress={() => router.push('/auth/profile-setup')}
                >
                  <View style={styles.promptCopy}>
                    <Text style={styles.promptTitle}>{p.completeProfileTitle}</Text>
                    <Text style={styles.promptBody}>{p.completeProfileBody}</Text>
                  </View>
                  <Icon name="ph-caret-right" size={16} color={colors.green700} weight="bold" />
                </Pressable>
              )}

              {isProviderSession && (
                <View style={styles.listingCard}>
                  <LinearGradient
                    colors={[colors.green800, colors.green700]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.listingHeader}
                  >
                    <View style={styles.listingHeaderRow}>
                      <View style={styles.listingHeaderCopy}>
                        <Text style={styles.listingHeaderTitle}>{p.manageListing}</Text>
                        <Text style={styles.listingHeaderMeta} numberOfLines={1}>
                          {[categoryText, profileArea ? areaLabel(profileArea, am) : null]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </Text>
                      </View>
                      <View style={styles.listingGoldDot} />
                    </View>
                  </LinearGradient>
                  <Pressable
                    style={({ pressed }) => [styles.listingAction, pressed && { opacity: 0.92 }]}
                    onPress={() => router.push(`/provider/${providerProfile!.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={p.viewPublicProfile}
                  >
                    <Icon name="ph-eye" size={15} color={colors.green700} weight="bold" />
                    <Text style={styles.listingActionText}>{p.viewPublicProfile}</Text>
                    <Icon name="ph-caret-right" size={14} color={colors.muted} weight="bold" />
                  </Pressable>
                </View>
              )}
            </>
          )}

          {isAuthenticated ? (
            <>
              <SectionBlock title={p.sectionAccount}>
                <Card variant="group">
                  {accountRows.map((r, ri) => (
                    <ListRow
                      key={r.label}
                      {...r}
                      iconColor={r.iconColor || colors.green700}
                      iconTint={r.tint || colors.soft}
                      divided={ri > 0}
                    />
                  ))}
                </Card>
              </SectionBlock>

              <SectionBlock title={p.sectionAppSettings}>
                <Card variant="group">
                  {appSettingsRows.map((r, ri) => (
                    <ListRow
                      key={r.label}
                      {...r}
                      iconColor={colors.green700}
                      iconTint={colors.soft}
                      divided={ri > 0}
                    />
                  ))}
                </Card>
              </SectionBlock>

              <SectionBlock title={p.sectionSupport}>
                <Card variant="group">
                  {supportRows.map((r, ri) => (
                    <ListRow key={r.label} {...r} iconColor={colors.green700} iconTint={colors.soft} divided={ri > 0} />
                  ))}
                </Card>
              </SectionBlock>

              <Card variant="group" style={styles.logoutCard}>
                <ListRow
                  label={p.logout}
                  icon="ph-sign-out"
                  iconColor={colors.danger}
                  iconTint={colors.dangerSoft}
                  labelColor={colors.danger}
                  chevron={false}
                  onPress={onLogout}
                />
              </Card>
            </>
          ) : (
            sessionReady && (
              <SectionBlock title={p.sectionSupport}>
                <Card variant="group">
                  {guestSupportRows.map((r, ri) => (
                    <ListRow key={r.label} {...r} iconColor={colors.green700} iconTint={colors.soft} divided={ri > 0} />
                  ))}
                </Card>
              </SectionBlock>
            )
          )}

          <Text style={styles.version}>SERRALE Basic · v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 28 },
  content: {
    paddingHorizontal: layout.gutter,
    gap: layout.sectionGap,
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.green900,
    paddingTop: 6,
    lineHeight: 36,
  },
  signInCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    ...shadowCard,
    shadowOpacity: 0.05,
  },
  signInTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.green900,
    lineHeight: 22,
  },
  signInSub: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  signInBtn: { marginTop: 14 },
  identityBanner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.green800,
    ...shadowCard,
    shadowOpacity: 0.08,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  identityMeta: { flex: 1, minWidth: 0, gap: 2 },
  identityNameOnGreen: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#fff',
    lineHeight: 24,
  },
  identityPhoneOnGreen: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  providerPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  providerPillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.goldSoftText,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  identityEditStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,244,216,0.18)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  identityEditText: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.goldSoft,
  },
  listingCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadowCard,
    shadowOpacity: 0.06,
  },
  listingHeader: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  listingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listingHeaderCopy: { flex: 1, minWidth: 0, gap: 2 },
  listingHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: '#fff',
    lineHeight: 18,
  },
  listingHeaderMeta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 16,
  },
  listingGoldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.goldSoft,
  },
  listingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  listingActionText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.green800,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  skeletonTextCol: { flex: 1 },
  skeletonLineOnGreen: { height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.22)' },
  skeletonEditStrip: {
    height: 42,
    backgroundColor: 'rgba(255,244,216,0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  promptCopy: { flex: 1, minWidth: 0 },
  promptTitle: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.green900, lineHeight: 18 },
  promptBody: { marginTop: 3, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 14,
    ...shadowCard,
    shadowOpacity: 0.05,
  },
  sectionCardTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.green900,
    marginBottom: 10,
    lineHeight: 18,
  },
  sectionBlock: { gap: 8 },
  sectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.green900,
    marginLeft: 2,
    lineHeight: 18,
  },
  logoutCard: { marginTop: -4 },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.faint,
    paddingTop: 4,
    fontFamily: fonts.regular,
  },
});
