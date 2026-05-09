import { useMemo, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getProviderDashboard } from "@serrale/api";

import { JobCard, ProposalCard, SummaryCard } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderLoadingScreen } from "./ProviderLoadingScreen";

export function ProviderHomeScreen() {
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const dashboardQuery = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: getProviderDashboard,
  });

  if (dashboardQuery.isLoading) {
    return <ProviderLoadingScreen message="Loading dashboard..." />;
  }

  if (dashboardQuery.isError) {
    return (
      <ProviderScreen>
        <Text style={styles.errorText}>Unable to load dashboard. Please try again.</Text>
        <ProviderButton label="Retry" onPress={() => dashboardQuery.refetch()} />
      </ProviderScreen>
    );
  }

  const dashboard = dashboardQuery.data!;

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader showNotification unread={0} />

      <View>
        <Text style={styles.greeting}>Welcome back, {dashboard.provider_name}</Text>
        <Text style={styles.subheading}>
          Find opportunities, manage proposals, and grow your work.
        </Text>
      </View>

      <View style={styles.availabilityCard}>
        <View style={[styles.statusPulseWrap, available ? styles.statusOn : styles.statusOff]}>
          <View style={[styles.statusPulse, available ? styles.pulseOn : styles.pulseOff]} />
        </View>
        <View style={styles.availabilityTextWrap}>
          <Text style={styles.availabilityTitle}>{available ? "Available for work" : "Busy"}</Text>
          <Text style={styles.availabilitySubtitle}>
            {available
              ? "You are visible to potential clients."
              : "Clients can still view your profile."}
          </Text>
        </View>
        <Switch
          value={available}
          onValueChange={setAvailable}
          trackColor={{ false: "#CBD5E1", true: providerColors.blue }}
          thumbColor={providerColors.white}
        />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>COMMUNITY</Text>
        <Text style={styles.heroTitle}>Grow with Ethiopia&apos;s service community</Text>
        <Text style={styles.heroBody}>Connect. Grow. Succeed together.</Text>
        <ProviderButton
          label="Explore Jobs"
          full={false}
          variant="secondary"
          style={styles.heroCta}
          onPress={() => router.push("/tabs/jobs")}
        />
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard
          icon="document-text-outline"
          number={dashboard.skills_count.toString()}
          label="Skills"
          hint="Verified"
          iconBg={providerColors.sky}
        />
        <SummaryCard
          icon="folder-outline"
          number={dashboard.portfolio_count.toString()}
          label="Portfolio"
          hint="Items"
          iconBg={providerColors.purpleSoft}
        />
        <SummaryCard
          icon="layers-outline"
          number={dashboard.services_count.toString()}
          label="Services"
          hint="Offered"
          iconBg={providerColors.successSoft}
        />
        <SummaryCard
          icon="rocket-outline"
          number={`${dashboard.profile_completion}%`}
          label="Profile"
          hint="Completion"
          iconBg={providerColors.warningSoft}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verification Status</Text>
      </View>
      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>
          {dashboard.verification_status === "verified" ? "✅ Verified" : 
           dashboard.verification_status === "pending" ? "⏳ Pending Review" :
           "❌ Not Verified"}
        </Text>
      </View>

      {dashboard.next_actions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Actions</Text>
          </View>
          <View style={styles.stack}>
            {dashboard.next_actions.map((action, idx) => (
              <View key={idx} style={styles.actionItem}>
                <Text style={styles.actionText}>• {action}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.profileTip}>
        <Text style={styles.profileTipTag}>PROFILE COMPLETION - {dashboard.profile_completion}%</Text>
        <Text style={styles.profileTipTitle}>Complete your profile to get more visibility</Text>
        <Text style={styles.profileTipBody}>
          Add portfolio items, services, and pricing to increase trust.
        </Text>
        <ProviderButton
          label="Improve Profile"
          full={false}
          variant="secondary"
          style={styles.tipCta}
          onPress={() => router.push("/tabs/profile")}
        />
      </View>
      
      <View style={{ height: 40 }} />
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  greeting: {
    ...providerTypography.h1,
    color: providerColors.navy,
    letterSpacing: -0.6
  },
  subheading: {
    ...providerTypography.body,
    color: providerColors.body,
    marginTop: providerSpacing.xs
  },
  availabilityCard: {
    backgroundColor: providerColors.white,
    borderRadius: providerRadius.lg,
    padding: providerSpacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm,
    ...providerShadows.card
  },
  statusPulseWrap: {
    width: 44,
    height: 44,
    borderRadius: providerRadius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  statusOn: {
    backgroundColor: providerColors.successSoft
  },
  statusOff: {
    backgroundColor: providerColors.warningSoft
  },
  statusPulse: {
    width: 12,
    height: 12,
    borderRadius: providerRadius.full
  },
  pulseOn: {
    backgroundColor: providerColors.successGreen
  },
  pulseOff: {
    backgroundColor: providerColors.warningOrange
  },
  availabilityTextWrap: {
    flex: 1
  },
  availabilityTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  availabilitySubtitle: {
    ...providerTypography.caption,
    color: providerColors.muted,
    marginTop: 2
  },
  heroCard: {
    borderRadius: providerRadius.xxl,
    padding: providerSpacing.xl,
    backgroundColor: providerColors.blueDark,
    ...providerShadows.elevated
  },
  heroTag: {
    ...providerTypography.caption,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.4
  },
  heroTitle: {
    ...providerTypography.h2,
    color: providerColors.white,
    marginTop: providerSpacing.xs
  },
  heroBody: {
    ...providerTypography.body,
    color: "rgba(255,255,255,0.92)",
    marginTop: providerSpacing.xs
  },
  heroCta: {
    marginTop: providerSpacing.md
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: providerSpacing.sm
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: providerSpacing.md
  },
  sectionTitle: {
    ...providerTypography.h3,
    color: providerColors.navy
  },
  statusBox: {
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    borderRadius: providerRadius.lg,
    marginTop: providerSpacing.xs,
    ...providerShadows.card
  },
  statusLabel: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  stack: {
    gap: providerSpacing.xs,
    marginTop: providerSpacing.xs
  },
  actionItem: {
    backgroundColor: providerColors.white,
    padding: providerSpacing.sm,
    paddingHorizontal: providerSpacing.md,
    borderRadius: providerRadius.md,
    ...providerShadows.card
  },
  actionText: {
    ...providerTypography.body,
    color: providerColors.body
  },
  profileTip: {
    borderRadius: providerRadius.xl,
    padding: providerSpacing.lg,
    backgroundColor: providerColors.blue,
    marginTop: providerSpacing.lg
  },
  profileTipTag: {
    ...providerTypography.caption,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.1
  },
  profileTipTitle: {
    ...providerTypography.h3,
    color: providerColors.white,
    marginTop: providerSpacing.xs
  },
  profileTipBody: {
    ...providerTypography.body,
    color: "rgba(255,255,255,0.9)",
    marginTop: providerSpacing.xs
  },
  tipCta: {
    marginTop: providerSpacing.md
  },
  errorText: {
    ...providerTypography.body,
    color: providerColors.dangerRed,
    textAlign: 'center',
    marginVertical: providerSpacing.xl
  }
});
