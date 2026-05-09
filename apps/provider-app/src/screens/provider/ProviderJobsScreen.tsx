import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getOpenJobs, toggleSaveJob } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";

import { JobCard } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";

const filters = ["All", "Best Match", "Nearby", "Remote", "New", "High Budget"] as const;

export function ProviderJobsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Best Match");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const jobsQuery = useQuery({
    queryKey: ["provider-jobs", activeFilter, searchTerm],
    queryFn: () =>
      getOpenJobs({
        limit: 30,
        search: searchTerm || undefined,
        budgetMin: activeFilter === "High Budget" ? 10000 : undefined
      })
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

  const jobs = (jobsQuery.data || []).map(mapBackendJobToProviderJob);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader title="Jobs" showNotification />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <IconSymbol name="search-outline" size={18} color={providerColors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor={providerColors.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <IconSymbol name="options-outline" size={18} color={providerColors.title} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
        {filters.map((filter) => {
          const active = filter === activeFilter;

          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, active ? styles.activeChip : null]}
            >
              <Text style={[styles.filterLabel, active ? styles.activeChipLabel : null]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.countText}>{jobs.length} jobs available</Text>
        {jobsQuery.isFetching && <ActivityIndicator size="small" color={providerColors.blue} />}
      </View>

      {jobsQuery.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Failed to load jobs.</Text>
          <ProviderButton label="Retry" onPress={() => jobsQuery.refetch()} full={false} />
        </View>
      ) : jobsQuery.isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={providerColors.blue} />
          <Text style={styles.loadingText}>Finding best matches...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.centerState}>
          <IconSymbol name="document-text-outline" size={48} color={providerColors.border} />
          <Text style={styles.emptyText}>No jobs found matching your criteria.</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={Boolean(savedJobs[job.id])}
              onToggleSave={() => handleToggleSave(job.id)}
              onOpen={() => router.push({ pathname: "/jobs/[jobId]" as any, params: { jobId: job.id } })}
            />
          ))}
        </View>
      )}
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  searchRow: {
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  searchBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: providerSpacing.md,
    gap: providerSpacing.sm
  },
  searchPlaceholder: {
    ...providerTypography.body,
    color: providerColors.muted
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  filterList: {
    gap: providerSpacing.sm,
    paddingVertical: providerSpacing.sm
  },
  filterChip: {
    borderRadius: providerRadius.full,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm
  },
  activeChip: {
    borderColor: providerColors.blue,
    backgroundColor: providerColors.blue
  },
  filterLabel: {
    ...providerTypography.caption,
    color: providerColors.body
  },
  activeChipLabel: {
    color: providerColors.white
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: providerSpacing.xs
  },
  countText: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  stack: {
    gap: providerSpacing.sm
  },
  searchInput: {
    flex: 1,
    ...providerTypography.body,
    color: providerColors.navy,
    paddingVertical: 0
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: providerSpacing.xxl,
    gap: providerSpacing.md
  },
  errorText: {
    ...providerTypography.body,
    color: providerColors.dangerRed
  },
  loadingText: {
    ...providerTypography.body,
    color: providerColors.muted
  },
  emptyText: {
    ...providerTypography.body,
    color: providerColors.muted,
    textAlign: 'center'
  }
});
