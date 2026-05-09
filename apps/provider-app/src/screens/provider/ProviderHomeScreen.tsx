import { useMemo, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { providerJobs, providerProfile, providerProposals } from "../../provider/data";
import { firstName } from "../../provider/format";
import { JobCard, ProposalCard, SummaryCard } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";
import { ProviderButton } from "../../provider/components/ProviderButton";

export function ProviderHomeScreen() {
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const recommendedJobs = useMemo(() => providerJobs.slice(0, 3), []);
  const recentProposals = useMemo(() => providerProposals.slice(0, 2), []);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader showNotification unread={2} />

      <View>
        <Text style={styles.greeting}>Welcome back, {firstName(providerProfile.name)}</Text>
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
        <Text style={styles.heroTitle}>Grow with Ethiopia's service community</Text>
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
          icon="briefcase-outline"
          number="12"
          label="New Jobs"
          hint="Matching your skills"
          iconBg={providerColors.sky}
        />
        <SummaryCard
          icon="document-text-outline"
          number="4"
          label="Active Proposals"
          hint="In progress"
          iconBg={providerColors.purpleSoft}
        />
        <SummaryCard
          icon="chatbubble-ellipses-outline"
          number="3"
          label="Messages"
          hint="Unread"
          iconBg={providerColors.successSoft}
        />
        <SummaryCard
          icon="rocket-outline"
          number="80%"
          label="Profile"
          hint="Almost there"
          iconBg={providerColors.warningSoft}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Jobs</Text>
        <Text style={styles.sectionAction} onPress={() => router.push("/tabs/jobs")}>
          View All
        </Text>
      </View>
      <View style={styles.stack}>
        {recommendedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            saved={Boolean(savedJobs[job.id])}
            onToggleSave={() => setSavedJobs((current) => ({ ...current, [job.id]: !current[job.id] }))}
            onOpen={() => router.push({ pathname: "/jobs/[jobId]", params: { jobId: job.id } })}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Proposals</Text>
        <Text style={styles.sectionAction} onPress={() => router.push("/tabs/proposals")}>
          View All
        </Text>
      </View>
      <View style={styles.stack}>
        {recentProposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            onView={() =>
              router.push({ pathname: "/proposals/[proposalId]", params: { proposalId: proposal.id } })
            }
          />
        ))}
      </View>

      <View style={styles.profileTip}>
        <Text style={styles.profileTipTag}>PROFILE COMPLETION - 80%</Text>
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
    marginTop: providerSpacing.xs
  },
  sectionTitle: {
    ...providerTypography.h3,
    color: providerColors.navy
  },
  sectionAction: {
    ...providerTypography.label,
    color: providerColors.blue
  },
  stack: {
    gap: providerSpacing.sm
  },
  profileTip: {
    borderRadius: providerRadius.xl,
    padding: providerSpacing.lg,
    backgroundColor: providerColors.blue,
    marginTop: providerSpacing.sm
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
  }
});
