import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Switch, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProviderDashboard, getHotJobs, getOpenJobs, toggleSaveJob } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { formatEtbRange } from "../../provider/format";

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Writing", "Photo & Video", "More"];

export function ProviderHomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [available, setAvailable] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const dashboardQuery = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: getProviderDashboard,
  });

  const openJobsQuery = useQuery({
    queryKey: ["provider-home-open-jobs", searchTerm, selectedCategory],
    queryFn: () => getOpenJobs({ 
      limit: 5, 
      search: searchTerm || undefined,
      category: selectedCategory === "All" ? undefined : selectedCategory
    }),
  });

  const hotJobsQuery = useQuery({
    queryKey: ["provider-home-hot-jobs", selectedCategory],
    queryFn: () => getOpenJobs({ 
      limit: 4, 
      category: selectedCategory === "All" ? "Design" : selectedCategory 
    }),
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

  const dashboard = dashboardQuery.data;
  const providerName = dashboard?.provider_name || "Provider";
  const isVerified = dashboard?.verification_status === "verified";

  const openJobs = (openJobsQuery.data || []).map(mapBackendJobToProviderJob);
  const popularJobs = (hotJobsQuery.data || []).map(mapBackendJobToProviderJob);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader showNotification unread={0} />

      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>Welcome back, {providerName.split(' ')[0]}</Text>
        <Text style={styles.greetingSubtitle}>Find opportunities, grow your business.</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusCard}>
          <View style={styles.statusCardLeft}>
            <View style={styles.statusIconWrapGreen}>
              <View style={styles.statusDotGreen} />
            </View>
            <View style={styles.statusTextWrap}>
              <Text style={styles.statusTitle}>Available for work</Text>
              <Text style={styles.statusSubtitle}>You are visible to clients</Text>
            </View>
          </View>
          <Switch
            value={available}
            onValueChange={setAvailable}
            trackColor={{ false: "#CBD5E1", true: providerColors.successGreen }}
            thumbColor={providerColors.white}
            style={{ transform: [{ scale: 0.8 }] }}
          />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusCardLeft}>
            <View style={styles.statusIconWrapBlue}>
              <IconSymbol name="shield-checkmark" size={16} color={providerColors.blue} />
            </View>
            <View style={styles.statusTextWrap}>
              <Text style={styles.statusTitle}>Identity verified</Text>
              <Text style={styles.statusSubtitle}>{isVerified ? "Your identity is verified" : "Pending verification"}</Text>
            </View>
          </View>
          <IconSymbol name="chevron-forward" size={16} color={providerColors.muted} />
        </View>
      </View>

      <View style={styles.searchBar}>
        <IconSymbol name="search-outline" size={20} color={providerColors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, categories, skills"
          placeholderTextColor={providerColors.muted}
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Find better work opportunities</Text>
          <Text style={styles.bannerSubtitle}>Connect with clients in Ethiopia.</Text>
        </View>
        <Pressable style={styles.bannerBtn} onPress={() => router.push("/tabs/jobs")}>
          <Text style={styles.bannerBtnText}>Explore Jobs</Text>
          <IconSymbol name="chevron-forward" size={14} color={providerColors.navy} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Jobs for You</Text>
          <Pressable onPress={() => router.push("/tabs/jobs")}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        {openJobsQuery.isLoading ? (
          <ActivityIndicator size="large" color={providerColors.blue} style={{ marginTop: 20 }} />
        ) : openJobsQuery.isError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Couldn't load jobs</Text>
            <ProviderButton label="Retry" onPress={() => openJobsQuery.refetch()} full={false} style={{ marginTop: 10 }} />
          </View>
        ) : openJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No jobs found yet</Text>
            <Text style={styles.emptyText}>Try another category or search term.</Text>
          </View>
        ) : (
          openJobs.slice(0, 2).map(job => (
            <HomeJobCard
              key={job.id}
              job={job}
              isSaved={savedJobs[job.id] !== undefined ? savedJobs[job.id] : job.saved || false}
              onToggleSave={() => handleToggleSave(job.id, job.saved || false)}
              onPress={() => router.push({ pathname: "/jobs/[jobId]" as any, params: { jobId: job.id } })}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular in {selectedCategory === "All" ? "Design" : selectedCategory}</Text>
          <Pressable onPress={() => router.push("/tabs/jobs")}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        {hotJobsQuery.isLoading ? (
          <ActivityIndicator size="large" color={providerColors.blue} style={{ marginTop: 20 }} />
        ) : popularJobs.length > 0 ? (
          <View style={styles.popularGrid}>
            {popularJobs.slice(0, 2).map(job => (
              <CompactJobCard
                key={job.id}
                job={job}
                isSaved={savedJobs[job.id] !== undefined ? savedJobs[job.id] : job.saved || false}
                onToggleSave={() => handleToggleSave(job.id, job.saved || false)}
                onPress={() => router.push({ pathname: "/jobs/[jobId]" as any, params: { jobId: job.id } })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No popular jobs right now.</Text>
          </View>
        )}
      </View>
      
    </ProviderScreen>
  );
}

// Subcomponents

function HomeJobCard({ job, isSaved, onToggleSave, onPress }: any) {
  return (
    <Pressable style={styles.homeJobCard} onPress={onPress}>
      <View style={styles.hjcTopRow}>
        <View style={styles.hjcIconBlock}>
          <IconSymbol name="briefcase-outline" size={32} color={providerColors.blue} />
        </View>
        <View style={styles.hjcContent}>
          <Text style={styles.hjcTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.hjcCategory}>{job.client}</Text>
          <View style={styles.hjcMetaRow}>
            <IconSymbol name="location-outline" size={12} color={providerColors.muted} />
            <Text style={styles.hjcMetaText}>{job.location}</Text>
          </View>
        </View>
        <Pressable onPress={onToggleSave} style={styles.hjcBookmark}>
          <IconSymbol name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? providerColors.blue : providerColors.muted} />
        </Pressable>
      </View>
      <Text style={styles.hjcDesc} numberOfLines={2}>{job.description}</Text>
      <View style={styles.hjcBottomRow}>
        <Text style={styles.hjcBudget}>{formatEtbRange(job.budgetMin, job.budgetMax)}</Text>
        <Pressable style={styles.hjcBtn} onPress={onPress}>
          <Text style={styles.hjcBtnText}>View Details</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function CompactJobCard({ job, isSaved, onToggleSave, onPress }: any) {
  return (
    <Pressable style={styles.compactCard} onPress={onPress}>
      <View style={styles.ccTopRow}>
        <View style={styles.ccIconBlock}>
          <IconSymbol name="star-outline" size={24} color={providerColors.warningOrange} />
        </View>
        <Pressable onPress={onToggleSave}>
          <IconSymbol name={isSaved ? "bookmark" : "bookmark-outline"} size={18} color={isSaved ? providerColors.blue : providerColors.muted} />
        </Pressable>
      </View>
      <Text style={styles.ccTitle} numberOfLines={2}>{job.title}</Text>
      <Text style={styles.ccCategory} numberOfLines={1}>{job.client}</Text>
      <Text style={styles.ccBudget}>{formatEtbRange(job.budgetMin, job.budgetMax)}</Text>
    </Pressable>
  );
}

// Styles
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
    backgroundColor: providerColors.appBg
  },
  greetingSection: {
    marginTop: 8,
    marginBottom: 16
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: providerColors.navy
  },
  greetingSubtitle: {
    fontSize: 14,
    color: providerColors.muted,
    marginTop: 4
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  statusCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...providerShadows.card
  },
  statusCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statusIconWrapGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: providerColors.successSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  statusDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: providerColors.successGreen
  },
  statusIconWrapBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  statusTextWrap: {
    flex: 1
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: providerColors.navy
  },
  statusSubtitle: {
    fontSize: 11,
    color: providerColors.muted,
    marginTop: 2
  },
  searchBar: {
    height: 60,
    borderRadius: 20,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: providerColors.title
  },
  banner: {
    height: 110,
    borderRadius: 22,
    backgroundColor: providerColors.blueDark,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  bannerContent: {
    flex: 1,
    paddingRight: 10
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: providerColors.white
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4
  },
  bannerBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4
  },
  bannerBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.navy
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: providerColors.navy,
    marginBottom: 12
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  viewAllText: {
    fontSize: 14,
    color: providerColors.blue,
    fontWeight: "500"
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 20
  },
  categoryChip: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    justifyContent: "center"
  },
  categoryChipActive: {
    backgroundColor: providerColors.blue,
    borderColor: providerColors.blue
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: providerColors.body
  },
  categoryChipTextActive: {
    color: providerColors.white
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: providerColors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: providerColors.border
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: providerColors.navy
  },
  emptyText: {
    fontSize: 14,
    color: providerColors.muted,
    marginTop: 4
  },
  homeJobCard: {
    minHeight: 150,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    ...providerShadows.card
  },
  hjcTopRow: {
    flexDirection: "row",
    gap: 12
  },
  hjcIconBlock: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  hjcContent: {
    flex: 1,
    paddingTop: 4
  },
  hjcTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: providerColors.navy
  },
  hjcCategory: {
    fontSize: 13,
    color: providerColors.blue,
    marginTop: 4
  },
  hjcMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6
  },
  hjcMetaText: {
    fontSize: 12,
    color: providerColors.muted
  },
  hjcBookmark: {
    padding: 4
  },
  hjcDesc: {
    fontSize: 14,
    color: providerColors.body,
    marginTop: 12,
    lineHeight: 20
  },
  hjcBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14
  },
  hjcBudget: {
    fontSize: 16,
    fontWeight: "700",
    color: providerColors.successGreen
  },
  hjcBtn: {
    height: 42,
    minWidth: 126,
    borderRadius: 12,
    backgroundColor: providerColors.blue,
    alignItems: "center",
    justifyContent: "center"
  },
  hjcBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.white
  },
  popularGrid: {
    flexDirection: "row",
    gap: 12
  },
  compactCard: {
    flex: 1,
    minHeight: 150,
    borderRadius: 20,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    padding: 14,
    ...providerShadows.card
  },
  ccTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  ccIconBlock: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: providerColors.warningSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  ccTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: providerColors.navy,
    marginBottom: 6
  },
  ccCategory: {
    fontSize: 12,
    color: providerColors.muted,
    marginBottom: 8
  },
  ccBudget: {
    fontSize: 14,
    fontWeight: "700",
    color: providerColors.successGreen
  }
});
