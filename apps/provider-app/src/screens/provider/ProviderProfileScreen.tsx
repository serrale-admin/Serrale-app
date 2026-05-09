import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { clearSession } from "@serrale/auth";

import { providerProfile } from "../../provider/data";
import { ProfileMenuRow } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderProfileScreen() {
  const router = useRouter();

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader title="Profile" />

      <View style={styles.profileCard}>
        <View style={styles.topRow}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>SD</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.mainText}>
            <Text style={styles.name}>{providerProfile.name} - Verified</Text>
            <Text style={styles.specialty}>{providerProfile.specialty}</Text>
            <Text style={styles.subMeta}>
              * {providerProfile.rating} ({providerProfile.reviews}) - {providerProfile.location}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <ProfileStat label="Jobs" value={String(providerProfile.jobsCompleted)} />
          <ProfileStat label="Reviews" value={String(providerProfile.reviews)} />
          <ProfileStat label="Success" value={`${providerProfile.successRate}%`} />
          <ProfileStat label="Earnings" value={providerProfile.earnings} />
        </View>
      </View>

      <View style={styles.completionCard}>
        <Text style={styles.completionValue}>{providerProfile.profileCompletion}%</Text>
        <View style={styles.completionTextWrap}>
          <Text style={styles.completionTitle}>Profile completion</Text>
          <Text style={styles.completionSubtitle}>Add 2 more skills to reach 100%</Text>
        </View>
        <Pressable style={styles.completionButton} onPress={() => router.push("/settings/profile")}>
          <Text style={styles.completionButtonText}>Improve</Text>
        </Pressable>
      </View>

      <View style={styles.menuCard}>
        <ProfileMenuRow
          icon="person-outline"
          title="Business Profile"
          subtitle="Public details, bio, services"
          onPress={() => router.push("/settings/profile")}
        />
        <ProfileMenuRow
          icon="images-outline"
          title="Portfolio"
          subtitle="3 items - updated recently"
          onPress={() => router.push("/portfolio")}
        />
        <ProfileMenuRow
          icon="construct-outline"
          title="Services & Skills"
          subtitle="12 skills - 5 services"
          onPress={() => router.push("/settings/profile")}
        />
        <ProfileMenuRow
          icon="calendar-outline"
          title="Availability"
          subtitle="Open weekdays"
          onPress={() => router.push("/settings/availability")}
        />
        <ProfileMenuRow
          icon="wallet-outline"
          title="Pricing & Payouts"
          subtitle="Bank - Telebirr"
          onPress={() => router.push("/settings/pricing")}
        />
        <ProfileMenuRow
          icon="document-text-outline"
          title="Proposals"
          subtitle="Manage edits and updates"
          onPress={() => router.push("/proposals/edit")}
        />
        <ProfileMenuRow
          icon="notifications-outline"
          title="Notifications"
          onPress={() => Alert.alert("Coming soon", "Notification preferences are in progress.")}
        />
        <ProfileMenuRow
          icon="shield-outline"
          title="Security"
          onPress={() => Alert.alert("Coming soon", "Security controls are in progress.")}
        />
        <ProfileMenuRow
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => Alert.alert("Coming soon", "Support center is in progress.")}
        />
        <ProfileMenuRow
          icon="settings-outline"
          title="App Preferences"
          onPress={() => Alert.alert("Coming soon", "App preferences are in progress.")}
        />
        <ProfileMenuRow
          icon="log-out-outline"
          title="Log Out"
          danger
          onPress={async () => {
            await clearSession();
            router.replace("/auth/login");
          }}
        />
      </View>
    </ProviderScreen>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  profileCard: {
    borderRadius: providerRadius.xl,
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    gap: providerSpacing.md,
    ...providerShadows.card
  },
  topRow: {
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  avatarWrap: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: providerColors.blueCard,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  avatarText: {
    ...providerTypography.h3,
    color: providerColors.blue
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: providerColors.white,
    backgroundColor: providerColors.successGreen
  },
  mainText: {
    flex: 1,
    gap: 2
  },
  name: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  specialty: {
    ...providerTypography.body,
    color: providerColors.body
  },
  subMeta: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: providerColors.border,
    paddingTop: providerSpacing.md
  },
  statItem: {
    alignItems: "center",
    flex: 1
  },
  statValue: {
    ...providerTypography.label,
    color: providerColors.navy
  },
  statLabel: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  completionCard: {
    borderRadius: providerRadius.lg,
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    ...providerShadows.card,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  completionValue: {
    ...providerTypography.h3,
    color: providerColors.blue
  },
  completionTextWrap: {
    flex: 1
  },
  completionTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  completionSubtitle: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  completionButton: {
    borderRadius: providerRadius.sm,
    backgroundColor: providerColors.blue,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm
  },
  completionButtonText: {
    ...providerTypography.caption,
    color: providerColors.white
  },
  menuCard: {
    borderRadius: providerRadius.xl,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm,
    ...providerShadows.card
  }
});
