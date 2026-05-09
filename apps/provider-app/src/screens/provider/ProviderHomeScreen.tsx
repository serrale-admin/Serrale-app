import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProviderDashboard, getHotJobs, getOpenJobs, toggleSaveJob } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";
import { IconSymbol } from "../../provider/components/IconSymbol";

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

  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: getProviderDashboard,
  });

  const hotJobsQuery = useQuery({
    queryKey: ["provider-hot-jobs"],
    queryFn: () => getHotJobs(5),
  });

  const openJobsQuery = useQuery({
    queryKey: ["provider-home-open-jobs"],
    queryFn: () => getOpenJobs({ limit: 5 }),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: ({ jobId, save }: { jobId: string; save: boolean }) => toggleSaveJob(jobId, save),
    onSuccess: (_, variables) => {
      setSavedJobs(prev => ({ ...prev, [variables.jobId]: variables.save }));
    }
  });

  const handleToggleSave = (jobId: string) => {
    const isSaved = savedJobs[jobId] || false;
    toggleSaveMutation.mutate({ jobId, save: !isSaved });
  };

  if (dashboardQuery.isLoading) {
    return <ProviderLoadingScreen message="Loading dashboard..." />;
  }

  if (dashboardQuery.isError) {
    return (
      <ProviderScreen>
        <Text style={styles.errorText}>Unable to load dashboard. Please try again.</Text>
        <ProviderButton label="Retry" onPress={() => {
          dashboardQuery.refetch();
          hotJobsQuery.refetch();
          openJobsQuery.refetch();
        }} />
      </ProviderScreen>
    );
  }

  const dashboard = dashboardQuery.data!;
  const hotJobs = (hotJobsQuery.data || []).map(mapBackendJobToProviderJob);
  const openJobs = (openJobsQuery.data || []).map(mapBackendJobToProviderJob);

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
          number={(dashboard?.skills_count ?? 0).toString()}
          label="Skills"
          hint="Verified"
          iconBg={providerColors.sky}
        />
        <SummaryCard
          icon="folder-outline"
          number={(dashboard?.portfolio_count ?? 0).toString()}
          label="Portfolio"
          hint="Items"
          iconBg={providerColors.purpleSoft}
        />
        <SummaryCard
          icon="layers-outline"
          number={(dashboard?.services_count ?? 0).toString()}
          label="Services"
          hint="Offered"
          iconBg={providerColors.successSoft}
        />
        <SummaryCard
          icon="rocket-outline"
          number={`${dashboard?.profile_completion ?? 0}%`}
          label="Profile"
          hint="Completion"
          iconBg={providerColors.warningSoft}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verification Status</Text>
      </View>
      <View style={styles.statusBox}>
        {dashboard.verification_status === "verified" ? (
          <View style={styles.badgeRow}>
            <IconSymbol name="shield-checkmark" size={20} color={providerColors.blue} />
            <Text style={styles.statusLabel}>Verified Professional</Text>
          </View>
        ) : dashboard.verification_status === "pending" ? (
          <View style={styles.badgeRow}>
            <IconSymbol name="time-outline" size={20} color={providerColors.warningOrange} />
            <Text style={[styles.statusLabel, { color: providerColors.warningOrange }]}>Pending Review</Text>
          </View>
        ) : (
          <View style={styles.badgeRow}>
            <IconSymbol name="shield-outline" size={20} color={providerColors.muted} />
            <Text style={[styles.statusLabel, { color: providerColors.muted }]}>Not Verified</Text>
          </View>
        )}
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

      {hotJobs.length > 0 && (
        <View style={styles.horizontalSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hot Projects</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {hotJobs.map(job => (
              <View key={job.id} style={styles.horizontalCardWrap}>
                <JobCard
                  job={job}
                  saved={savedJobs[job.id] || false}
                  onToggleSave={() => handleToggleSave(job.id)}
                  onOpen={() => router.push(`/jobs/${job.id}` as any)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {openJobs.length > 0 && (
        <View style={styles.verticalSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Pressable onPress={() => router.push("/tabs/jobs")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          <View style={styles.stack}>
            {openJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedJobs[job.id] || false}
                onToggleSave={() => handleToggleSave(job.id)}
                onOpen={() => router.push(`/jobs/${job.id}` as any)}
              />
            ))}
          </View>
        </View>
      )}
      
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
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.xs
  },
  horizontalSection: {
    marginTop: providerSpacing.lg,
    marginHorizontal: -providerSpacing.md
  },
  scrollContent: {
    paddingHorizontal: providerSpacing.md,
    gap: providerSpacing.md,
    paddingVertical: providerSpacing.xs
  },
  horizontalCardWrap: {
    width: 300
  },
  verticalSection: {
    marginTop: providerSpacing.lg
  },
  seeAllText: {
    ...providerTypography.label,
    color: providerColors.blue
  }
});
