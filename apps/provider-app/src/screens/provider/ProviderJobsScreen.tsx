import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { providerJobs } from "../../provider/data";
import { JobCard } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";
import { IconSymbol } from "../../provider/components/IconSymbol";

const filters = ["All", "Best Match", "Nearby", "Remote", "New", "High Budget"] as const;

export function ProviderJobsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Best Match");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  const jobs = useMemo(() => [...providerJobs, ...providerJobs], []);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader title="Jobs" showNotification />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <IconSymbol name="search-outline" size={18} color={providerColors.muted} />
          <Text style={styles.searchPlaceholder}>Search jobs...</Text>
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

      <Text style={styles.countText}>{jobs.length} jobs available</Text>

      <View style={styles.stack}>
        {jobs.map((job, index) => (
          <JobCard
            key={`${job.id}-${index}`}
            job={job}
            saved={Boolean(savedJobs[`${job.id}-${index}`])}
            onToggleSave={() =>
              setSavedJobs((current) => ({
                ...current,
                [`${job.id}-${index}`]: !current[`${job.id}-${index}`]
              }))
            }
            onOpen={() => router.push({ pathname: "/jobs/[jobId]", params: { jobId: job.id } })}
          />
        ))}
      </View>
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
  countText: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  stack: {
    gap: providerSpacing.sm
  }
});
