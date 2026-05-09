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
  const getCategoryIcon = (cat: string) => {
    const c = cat?.toLowerCase() || "";
    if (c.includes("design")) return "color-palette-outline";
    if (c.includes("develop")) return "code-slash-outline";
    if (c.includes("market")) return "megaphone-outline";
    if (c.includes("writ")) return "pencil-outline";
    return "briefcase-outline";
  };

  const formattedBudget = new Intl.NumberFormat("en-US").format(Number(job.budgetMax || job.budgetMin || 0));

  return (
    <View style={styles.jobCard}>
      <View style={styles.jobTopRow}>
        <View style={styles.jobIconWrap}>
          <IconSymbol name={getCategoryIcon(job.category)} size={32} color={providerColors.blue} />
        </View>
        <View style={styles.jobInfoWrap}>
          <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.jobCategory}>{job.category || "General"}</Text>
          <View style={styles.jobMetaRow}>
            <View style={styles.jobMetaItem}>
              <IconSymbol name="location-outline" size={14} color={providerColors.muted} />
              <Text style={styles.jobMetaText}>{job.location || "Remote"}</Text>
            </View>
            <View style={styles.jobMetaItem}>
              <IconSymbol name="time-outline" size={14} color={providerColors.muted} />
              <Text style={styles.jobMetaText}>{job.postedAt || "Recently"}</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={onToggleSave} style={styles.jobBookmark}>
          <IconSymbol name={saved ? "bookmark" : "bookmark-outline"} size={24} color={saved ? providerColors.blue : providerColors.muted} />
        </Pressable>
      </View>

      <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>

      <View style={styles.jobBottomRow}>
        <View style={styles.jobPills}>
          <View style={styles.budgetPill}>
            <Text style={styles.budgetPillText}>ETB {formattedBudget}</Text>
          </View>
          {job.experienceLevel && (
            <View style={styles.expChip}>
              <Text style={styles.expChipText}>{job.experienceLevel === "Entry Levl" ? "Entry Level" : job.experienceLevel}</Text>
            </View>
          )}
        </View>
        
        {job.matchScore ? (
          <View style={styles.matchWrap}>
            <Text style={styles.matchLabel}>Match</Text>
            <Text style={[styles.matchScore, { color: job.matchScore >= 85 ? providerColors.successGreen : providerColors.warningOrange }]}>
              {job.matchScore}%
            </Text>
          </View>
        ) : null}
      </View>

      <ProviderButton label="View Details" onPress={onOpen} style={styles.viewBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
    backgroundColor: providerColors.appBg
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20
  },
  headerTitles: {
    flex: 1
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: providerColors.navy
  },
  pageSubtitle: {
    fontSize: 16,
    color: providerColors.muted,
    marginTop: 6
  },
  notificationBtn: {
    width: 48,
    height: 48,
    alignItems: "flex-end",
    justifyContent: "center",
    position: "relative"
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: providerColors.dangerRed,
    borderWidth: 2,
    borderColor: providerColors.appBg
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  searchBox: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: providerColors.navy,
    paddingVertical: 0
  },
  filterButton: {
    width: 130,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  filterBtnText: {
    fontSize: 16,
    fontWeight: "500",
    color: providerColors.navy
  },
  categoryWrap: {
    marginHorizontal: -20,
    marginBottom: 16
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingRight: 40,
    gap: 12
  },
  categoryChip: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: 16,
    justifyContent: "center"
  },
  activeCategoryChip: {
    backgroundColor: providerColors.blue,
    borderColor: providerColors.blue
  },
  categoryChipText: {
    fontSize: 15,
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
    marginBottom: 16
  },
  countText: {
    fontSize: 14,
    color: providerColors.muted
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  sortBtnText: {
    fontSize: 14,
    color: providerColors.navy,
    fontWeight: "500"
  },
  listContainer: {
    minHeight: 300
  },
  stack: {
    gap: 14
  },
  jobCard: {
    backgroundColor: providerColors.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: providerColors.border,
    marginBottom: 14,
    ...providerShadows.card
  },
  jobTopRow: {
    flexDirection: "row",
    gap: 14
  },
  jobIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 18,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  jobInfoWrap: {
    flex: 1,
    paddingTop: 4
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: providerColors.navy,
    lineHeight: 24
  },
  jobCategory: {
    fontSize: 14,
    color: providerColors.blue,
    marginTop: 4
  },
  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8
  },
  jobMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  jobMetaText: {
    fontSize: 13,
    color: providerColors.muted
  },
  jobBookmark: {
    padding: 4
  },
  jobDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: providerColors.body,
    marginTop: 16
  },
  jobBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16
  },
  jobPills: {
    flexDirection: "row",
    gap: 10
  },
  budgetPill: {
    height: 38,
    borderRadius: 19,
    backgroundColor: providerColors.successSoft,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  budgetPillText: {
    fontSize: 15,
    fontWeight: "700",
    color: providerColors.successGreen
  },
  expChip: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: providerColors.border,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  expChipText: {
    fontSize: 14,
    color: providerColors.blue,
    fontWeight: "500"
  },
  matchWrap: {
    alignItems: "flex-end"
  },
  matchLabel: {
    fontSize: 12,
    color: providerColors.muted
  },
  matchScore: {
    fontSize: 15,
    fontWeight: "700"
  },
  viewBtn: {
    height: 46,
    borderRadius: 14
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16
  },
  loadingText: {
    fontSize: 15,
    color: providerColors.muted
  },
  errorCard: {
    backgroundColor: providerColors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: providerColors.border,
    ...providerShadows.card
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: providerColors.navy
  },
  errorSubText: {
    fontSize: 14,
    color: providerColors.muted,
    marginTop: 4
  },
  emptyCard: {
    backgroundColor: providerColors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: providerColors.border,
    ...providerShadows.card
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: providerColors.navy
  },
  emptySubText: {
    fontSize: 14,
    color: providerColors.muted,
    marginTop: 4
  }
});
