import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { providerJobs } from "../../provider/data";
import type { ProviderJob } from "../../provider/types";
import { formatEtbRange } from "../../provider/format";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { MatchBadge } from "../../provider/components/ProviderBadges";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

interface ProviderJobDetailScreenProps {
  jobId: string;
}

export function ProviderJobDetailScreen({ jobId }: ProviderJobDetailScreenProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const job: ProviderJob = useMemo(
    () => providerJobs.find((entry) => entry.id === jobId) ?? providerJobs[0],
    [jobId]
  );

  return (
    <View style={styles.root}>
      <ProviderScreen contentContainerStyle={styles.content}>
        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
          </Pressable>
          <Pressable onPress={() => setSaved((value) => !value)} style={styles.navButton}>
            <IconSymbol
              name={saved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={saved ? providerColors.blue : providerColors.title}
            />
          </Pressable>
        </View>

        <MatchBadge percentage={job.match} />
        <Text style={styles.title}>{job.title}</Text>

        <View style={styles.clientRow}>
          <View style={[styles.clientBadge, { backgroundColor: job.catBg }]}>
            <Text style={[styles.clientBadgeText, { color: job.catColor }]}>
              {job.client.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.clientName}>
              {job.client}
              {job.clientVerified ? " - Verified" : ""}
            </Text>
            <Text style={styles.clientMeta}>{job.location}</Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          <StatCard label="Budget" value={formatEtbRange(job.budgetMin, job.budgetMax)} icon="wallet-outline" />
          <StatCard label="Timeline" value={job.timeline} icon="calendar-outline" />
          <StatCard label="Proposals" value={`${job.proposals} sent`} icon="document-text-outline" />
        </View>

        <Section title="Project Overview">
          <Text style={styles.body}>{job.description}</Text>
        </Section>

        <Section title="Skills Needed">
          <View style={styles.skillWrap}>
            {job.skills.map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillLabel}>{skill}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Requirements">
          {[
            "Portfolio of recent brand work",
            "Available to start within 1 week",
            "2+ rounds of revisions included",
            "Provide source files (.ai / .fig)"
          ].map((requirement) => (
            <View key={requirement} style={styles.requirementRow}>
              <IconSymbol name="checkmark" size={14} color={providerColors.successGreen} />
              <Text style={styles.body}>{requirement}</Text>
            </View>
          ))}
        </Section>

        <Section title="About the client">
          <Text style={styles.body}>
            Buna House is a new specialty coffee concept based in Bole, opening three locations
            in 2026. The team values local craftsmanship and modern design.
          </Text>
          <Text style={styles.clientFoot}>* 4.8 rating - 6 hires - Member since 2024</Text>
        </Section>
      </ProviderScreen>

      <View style={styles.stickyBar}>
        <ProviderButton
          label="Save"
          variant="secondary"
          full={false}
          style={styles.saveButton}
          onPress={() => setSaved((value) => !value)}
        />
        <ProviderButton
          label="Send Proposal"
          full
          onPress={() => router.push({ pathname: "/jobs/apply", params: { jobId: job.id } })}
        />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: "wallet-outline" | "calendar-outline" | "document-text-outline";
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statLabelRow}>
        <IconSymbol name={icon} size={14} color={providerColors.blue} />
        <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: providerColors.appBg
  },
  content: {
    paddingTop: providerSpacing.md,
    paddingBottom: 128
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center",
    ...providerShadows.card
  },
  title: {
    ...providerTypography.h2,
    color: providerColors.navy,
    lineHeight: 30
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  clientBadge: {
    width: 40,
    height: 40,
    borderRadius: providerRadius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  clientBadgeText: {
    ...providerTypography.label
  },
  clientName: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  clientMeta: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  statGrid: {
    backgroundColor: providerColors.white,
    borderRadius: providerRadius.lg,
    padding: providerSpacing.md,
    gap: providerSpacing.sm,
    ...providerShadows.card
  },
  statCard: {
    gap: providerSpacing.xxs
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.xs
  },
  statLabel: {
    ...providerTypography.caption,
    color: providerColors.muted,
    letterSpacing: 0.4
  },
  statValue: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  section: {
    gap: providerSpacing.sm
  },
  sectionTitle: {
    ...providerTypography.h3,
    color: providerColors.navy
  },
  sectionContent: {
    gap: providerSpacing.sm
  },
  body: {
    ...providerTypography.body,
    color: providerColors.body,
    lineHeight: 22
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: providerSpacing.sm
  },
  skillChip: {
    borderRadius: providerRadius.full,
    backgroundColor: providerColors.softCard,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.xs
  },
  skillLabel: {
    ...providerTypography.caption,
    color: providerColors.blue
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: providerSpacing.sm
  },
  clientFoot: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  stickyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: providerColors.border,
    paddingHorizontal: providerSpacing.xl,
    paddingTop: providerSpacing.sm,
    paddingBottom: providerSpacing.xxl,
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  saveButton: {
    minHeight: 50,
    paddingHorizontal: providerSpacing.md
  }
});
