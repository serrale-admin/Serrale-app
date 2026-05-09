import { Alert, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { clearSession } from "@serrale/auth";
import { useQuery } from "@tanstack/react-query";
import { getProviderBootstrap } from "@serrale/api";

import { ProfileMenuRow } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderLoadingScreen } from "./ProviderLoadingScreen";

export function ProviderProfileScreen() {
  const router = useRouter();

  const bootstrapQuery = useQuery({
    queryKey: ["provider-bootstrap"],
    queryFn: getProviderBootstrap,
  });

  if (bootstrapQuery.isLoading) {
    return <ProviderLoadingScreen message="Loading profile..." />;
  }

  if (bootstrapQuery.isError) {
    return (
      <ProviderScreen>
        <Text style={styles.errorText}>Unable to load profile. Please try again.</Text>
        <ProviderButton label="Retry" onPress={() => bootstrapQuery.refetch()} />
      </ProviderScreen>
    );
  }

  const { user, profile, completeness, skills, portfolio, services } = bootstrapQuery.data!;

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader title="Profile" />

      <View style={styles.profileCard}>
        <View style={styles.topRow}>
          <View style={styles.avatarWrap}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user.full_name.split(" ").map(n => n[0]).join("")}
              </Text>
            )}
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.mainText}>
            <Text style={styles.name}>{user.full_name} {profile.is_verified ? "- Verified" : ""}</Text>
            <Text style={styles.specialty}>{profile.title || "Professional Provider"}</Text>
            <Text style={styles.subMeta}>
              {profile.rating ? `* ${profile.rating} (${profile.review_count})` : "No reviews yet"}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <ProfileStat label="Jobs" value={String(profile.review_count || 0)} />
          <ProfileStat label="Portfolio" value={String(portfolio.length)} />
          <ProfileStat label="Services" value={String(services.length)} />
          <ProfileStat label="Rate" value={profile.hourly_rate ? `${profile.hourly_rate} ETB` : "N/A"} />
        </View>
      </View>

      <View style={styles.completionCard}>
        <Text style={styles.completionValue}>{completeness.score || profile.completeness_score || 0}%</Text>
        <View style={styles.completionTextWrap}>
          <Text style={styles.completionTitle}>Profile status</Text>
          <Text style={styles.completionSubtitle}>
            {profile.is_verified ? "Verified Professional" : "Complete verification to reach 100%"}
          </Text>
        </View>
        {!profile.is_verified && (
          <Pressable style={styles.completionButton} onPress={() => router.push("/settings/profile")}>
            <Text style={styles.completionButtonText}>Verify</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.quickActionsRow}>
        <ProviderButton
          label="Edit Profile"
          variant="secondary"
          full={false}
          onPress={() => router.push("/settings/profile")}
          style={styles.quickActionBtn}
        />
        <ProviderButton
          label="Add Portfolio"
          variant="secondary"
          full={false}
          onPress={() => router.push("/portfolio")}
          style={styles.quickActionBtn}
        />
        <ProviderButton
          label="Add Service"
          variant="secondary"
          full={false}
          onPress={() => router.push("/settings/profile")}
          style={styles.quickActionBtn}
        />
      </View>

      <View style={styles.menuCard}>
        <ProfileMenuRow
          icon="person-outline"
          title="Business Profile"
          subtitle={profile.bio ? "Edit your bio and details" : "Add a bio to your profile"}
          onPress={() => router.push("/settings/profile")}
        />
        <ProfileMenuRow
          icon="images-outline"
          title="Portfolio"
          subtitle={`${portfolio.length} items showcased`}
          onPress={() => router.push("/portfolio")}
        />
        <ProfileMenuRow
          icon="construct-outline"
          title="Services & Skills"
          subtitle={`${skills.length} skills - ${services.length} services`}
          onPress={() => router.push("/settings/profile")}
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
      
      <View style={{ height: 40 }} />
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
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 24,
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
  },
  errorText: {
    ...providerTypography.body,
    color: providerColors.dangerRed,
    textAlign: 'center',
    marginVertical: providerSpacing.xl
  },
  menuDangerText: {
    color: providerColors.dangerRed
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: providerSpacing.xs,
    justifyContent: "space-between",
    paddingHorizontal: providerSpacing.xs
  },
  quickActionBtn: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: providerSpacing.xs
  }
});
