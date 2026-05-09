import { useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getOpenJobs, toggleSaveJob } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerShadows } from "../../provider/theme";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Writing", "Photo & Video", "Business", "More"];

export function ProviderJobsScreen() {
  const router = useRouter();
  
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const jobsQuery = useQuery({
    queryKey: ["provider-jobs", searchTerm, selectedCategory],
    queryFn: () =>
      getOpenJobs({
        limit: 30,
        search: searchTerm || undefined,
        category: selectedCategory === "All" ? undefined : selectedCategory
      })
  });

  const toggleSaveMutation = useMutation({
    mutationFn: ({ jobId, save }: { jobId: string; save: boolean }) => toggleSaveJob(jobId, save),
    onSuccess: (_, variables) => {
      setSavedJobs(prev => ({ ...prev, [variables.jobId]: variables.save }));
    }
  });

  const handleToggleSave = (jobId: string, currentSavedState: boolean) => {
    const isCurrentlySaved = savedJobs[jobId] !== undefined ? savedJobs[jobId] : currentSavedState;
    setSavedJobs(prev => ({ ...prev, [jobId]: !isCurrentlySaved }));
    toggleSaveMutation.mutate({ jobId, save: !isCurrentlySaved });
  };

  const jobs = (jobsQuery.data || []).map(mapBackendJobToProviderJob);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.pageTitle}>Jobs</Text>
          <Text style={styles.pageSubtitle}>Find projects that match your skills.</Text>
        </View>
        <Pressable style={styles.notificationBtn}>
          <IconSymbol name="notifications-outline" size={24} color={providerColors.navy} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <IconSymbol name="search-outline" size={20} color={providerColors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, skills, or clients..."
            placeholderTextColor={providerColors.muted}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <IconSymbol name="options-outline" size={20} color={providerColors.navy} />
          <Text style={styles.filterBtnText}>Filters</Text>
        </Pressable>
      </View>

      <View style={styles.categoryWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryChip, active && styles.activeCategoryChip]}
              >
                <Text style={[styles.categoryChipText, active && styles.activeCategoryText]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.countText}>{jobs.length} jobs found</Text>
        <Pressable style={styles.sortBtn}>
          <Text style={styles.sortBtnText}>Sort: Newest</Text>
          <IconSymbol name="chevron-down" size={14} color={providerColors.muted} />
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        {jobsQuery.isFetching && !jobsQuery.isError && jobs.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={providerColors.blue} />
            <Text style={styles.loadingText}>Finding jobs for you...</Text>
          </View>
        ) : jobsQuery.isError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Couldn't load jobs.</Text>
            <Text style={styles.errorSubText}>Check your connection and try again.</Text>
            <ProviderButton label="Retry" onPress={() => jobsQuery.refetch()} full={false} style={{ marginTop: 12 }} />
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubText}>Try another search or category.</Text>
            <ProviderButton label="Clear filters" onPress={() => { setSearchInput(""); setSelectedCategory("All"); }} full={false} variant="secondary" style={{ marginTop: 12 }} />
          </View>
        ) : (
          <View style={styles.stack}>
            {jobs.map((job) => {
              const isSaved = savedJobs[job.id] !== undefined ? savedJobs[job.id] : (job as any).saved || false;
              return (
                <JobFullCard
                  key={job.id}
                  job={job}
                  saved={isSaved}
                  onToggleSave={() => handleToggleSave(job.id, (job as any).saved || false)}
                  onOpen={() => router.push({ pathname: "/jobs/[jobId]" as any, params: { jobId: job.id } })}
                />
              );
            })}
          </View>
        )}
      </View>
    </ProviderScreen>
  );
}

function JobFullCard({ job, saved, onToggleSave, onOpen }: { job: any; saved: boolean; onToggleSave: () => void; onOpen: () => void }) {
  const formattedBudget = new Intl.NumberFormat("en-US").format(Number(job.budgetMax || job.budgetMin || 0));

  return (
    <Pressable style={styles.jobCard} onPress={onOpen}>
      <View style={styles.jobTopRow}>
        <View style={styles.jobInfoWrap}>
          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          <View style={styles.jobMetaRow}>
            <Text style={styles.jobCategory}>{job.category || "General"}</Text>
            <Text style={styles.jobMetaDivider}>•</Text>
            <Text style={styles.jobMetaText}>{job.location || "Remote"}</Text>
            <Text style={styles.jobMetaDivider}>•</Text>
            <Text style={styles.jobMetaText}>{job.postedAt || "Recently"}</Text>
          </View>
        </View>
        <Pressable onPress={onToggleSave} style={styles.jobBookmark}>
          <IconSymbol name={saved ? "bookmark" : "bookmark-outline"} size={18} color={saved ? providerColors.blue : providerColors.muted} />
        </Pressable>
      </View>

      <View style={styles.jobBottomRow}>
        <View style={styles.jobPills}>
          <Text style={styles.budgetText}>ETB {formattedBudget}</Text>
          {job.experienceLevel && (
            <View style={styles.expChip}>
              <Text style={styles.expChipText}>{job.experienceLevel === "Entry Levl" ? "Entry Level" : job.experienceLevel}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.jobActions}>
          {job.matchScore ? (
            <Text style={[styles.matchScore, { color: job.matchScore >= 85 ? providerColors.successGreen : providerColors.warningOrange }]}>
              {job.matchScore}% Match
            </Text>
          ) : null}
          <ProviderButton label="View" onPress={onOpen} style={styles.viewBtn} full={false} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
    backgroundColor: providerColors.appBg
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  headerTitles: {
    flex: 1
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: providerColors.navy
  },
  pageSubtitle: {
    fontSize: 12,
    color: providerColors.muted,
    marginTop: 2
  },
  notificationBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    position: "relative"
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: providerColors.dangerRed,
    borderWidth: 2,
    borderColor: providerColors.appBg
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  searchBox: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 6
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: providerColors.navy,
    paddingVertical: 0
  },
  filterButton: {
    width: 90,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: providerColors.navy
  },
  categoryWrap: {
    marginHorizontal: -12,
    marginBottom: 8
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingRight: 24,
    gap: 6
  },
  categoryChip: {
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: 12,
    justifyContent: "center"
  },
  activeCategoryChip: {
    backgroundColor: providerColors.blue,
    borderColor: providerColors.blue
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: providerColors.navy
  },
  activeCategoryText: {
    color: providerColors.white
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  countText: {
    fontSize: 12,
    color: providerColors.muted
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  sortBtnText: {
    fontSize: 12,
    color: providerColors.navy,
    fontWeight: "500"
  },
  listContainer: {
    minHeight: 300
  },
  stack: {
    gap: 8
  },
  jobCard: {
    backgroundColor: providerColors.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: providerColors.border,
    marginBottom: 6,
    ...providerShadows.card
  },
  jobTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6
  },
  jobInfoWrap: {
    flex: 1
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: providerColors.navy,
    lineHeight: 18
  },
  jobCategory: {
    fontSize: 11,
    fontWeight: "600",
    color: providerColors.blue
  },
  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2
  },
  jobMetaText: {
    fontSize: 11,
    color: providerColors.muted
  },
  jobMetaDivider: {
    fontSize: 10,
    color: providerColors.border,
    marginHorizontal: 2
  },
  jobBookmark: {
    padding: 2
  },
  jobBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  jobPills: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  budgetText: {
    fontSize: 13,
    fontWeight: "700",
    color: providerColors.successGreen
  },
  expChip: {
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: providerColors.border,
    paddingHorizontal: 8,
    justifyContent: "center"
  },
  expChipText: {
    fontSize: 10,
    color: providerColors.muted,
    fontWeight: "500"
  },
  jobActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  matchScore: {
    fontSize: 11,
    fontWeight: "700"
  },
  viewBtn: {
    height: 30,
    minWidth: 70,
    borderRadius: 8,
    paddingHorizontal: 10
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10
  },
  loadingText: {
    fontSize: 13,
    color: providerColors.muted
  },
  errorCard: {
    backgroundColor: providerColors.white,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: providerColors.border,
    ...providerShadows.card
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.navy
  },
  errorSubText: {
    fontSize: 12,
    color: providerColors.muted,
    marginTop: 2
  },
  emptyCard: {
    backgroundColor: providerColors.white,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: providerColors.border,
    ...providerShadows.card
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.navy
  },
  emptySubText: {
    fontSize: 12,
    color: providerColors.muted,
    marginTop: 2
  }
});
