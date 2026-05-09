import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getJobById, toggleSaveJob } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { MatchBadge } from "../../provider/components/ProviderBadges";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";
import { formatEtbRange } from "../../provider/format";

interface ProviderJobDetailScreenProps {
  jobId: string;
}

export function ProviderJobDetailScreen({ jobId }: ProviderJobDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);

  const jobQuery = useQuery({
    queryKey: ["provider-job-detail", jobId],
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId)
  });

  const toggleSaveMutation = useMutation({
    mutationFn: ({ save }: { save: boolean }) => toggleSaveJob(jobId, save),
    onMutate: async ({ save }) => {
      setOptimisticSaved(save);
    },
    onError: () => {
      setOptimisticSaved(null); // Revert on error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-job-detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["provider-home-open-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
    }
  });

  if (jobQuery.isLoading) {
    return (
      <View style={styles.root}>
        <ProviderScreen contentContainerStyle={styles.centerState}>
          <ActivityIndicator size="large" color={providerColors.blue} />
          <Text style={styles.loadingText}>Loading project details...</Text>
        </ProviderScreen>
      </View>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <View style={styles.root}>
        <ProviderScreen contentContainerStyle={styles.centerState}>
          <Text style={styles.errorText}>Unable to load project.</Text>
          <ProviderButton label="Go Back" onPress={() => router.back()} full={false} />
        </ProviderScreen>
      </View>
    );
  }

  const rawJob = jobQuery.data.job || jobQuery.data;
  const alreadyApplied = Boolean(jobQuery.data.alreadyApplied);
  const job = mapBackendJobToProviderJob(rawJob);
  
  // Use optimistic state if present, otherwise use real saved state from rawJob (assuming rawJob has a saved field)
  // If backend doesn't return saved state on detail yet, we fallback to false
  const isSaved = optimisticSaved !== null ? optimisticSaved : Boolean(rawJob.saved);

  const handleToggleSave = () => {
    toggleSaveMutation.mutate({ save: !isSaved });
  };

  const handleApply = () => {
    if (!alreadyApplied) {
      router.push({ pathname: "/jobs/apply" as any, params: { jobId: job.id } });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
          </Pressable>
          <Pressable onPress={handleToggleSave} style={styles.navButton}>
            <IconSymbol
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isSaved ? providerColors.blue : providerColors.title}
            />
          </Pressable>
        </View>

        <View style={styles.glassHeader}>
          <MatchBadge percentage={job.match} />
          <Text style={styles.title}>{job.title}</Text>

          <View style={styles.clientRow}>
            <View style={[styles.clientBadge, { backgroundColor: job.catBg }]}>
              <Text style={[styles.clientBadgeText, { color: job.catColor }]}>
                {job.client.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <View style={styles.clientNameRow}>
                <Text style={styles.clientName}>{job.client}</Text>
                {job.clientVerified && (
                  <IconSymbol name="shield-checkmark" size={14} color={providerColors.blue} />
                )}
              </View>
              <Text style={styles.clientMeta}>{job.location}</Text>
            </View>
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

        {job.skills && job.skills.length > 0 && (
          <Section title="Skills Needed">
            <View style={styles.skillWrap}>
              {job.skills.map((skill: string) => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillLabel}>{skill}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {rawJob.screening_questions && rawJob.screening_questions.length > 0 && (
          <Section title="Screening Questions">
            {rawJob.screening_questions.map((question: string, index: number) => (
              <View key={index} style={styles.requirementRow}>
                <IconSymbol name="help-circle-outline" size={16} color={providerColors.blue} />
                <Text style={styles.body}>{question}</Text>
              </View>
            ))}
          </Section>
        )}

        {rawJob.attachments && rawJob.attachments.length > 0 && (
          <Section title="Attachments">
            <View style={styles.requirementRow}>
              <IconSymbol name="document-attach-outline" size={16} color={providerColors.muted} />
              <Text style={styles.body}>{rawJob.attachments.length} file(s) attached</Text>
            </View>
          </Section>
        )}

      </ScrollView>

      <View style={styles.stickyBar}>
        <ProviderButton
          label={isSaved ? "Saved" : "Save"}
          variant="secondary"
          full={false}
          style={styles.saveButton}
          onPress={handleToggleSave}
        />
        <ProviderButton
          label={alreadyApplied ? "Proposal Sent" : "Send Proposal"}
          full
          disabled={alreadyApplied}
          onPress={handleApply}
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
  clientNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.xs
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
    gap: providerSpacing.sm,
    marginTop: providerSpacing.md
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
    gap: providerSpacing.sm,
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    borderRadius: providerRadius.md,
    ...providerShadows.card
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
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: providerSpacing.xl,
    gap: providerSpacing.md
  },
  loadingText: {
    ...providerTypography.body,
    color: providerColors.muted
  },
  errorText: {
    ...providerTypography.body,
    color: providerColors.dangerRed
  },
  glassHeader: {
    backgroundColor: providerColors.white,
    borderRadius: providerRadius.xl,
    padding: providerSpacing.lg,
    gap: providerSpacing.sm,
    marginTop: providerSpacing.md,
    ...providerShadows.elevated
  }
});
