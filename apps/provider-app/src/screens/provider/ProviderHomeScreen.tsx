import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProviderDashboard, getOpenJobs, toggleSaveJob, getProviderBootstrap } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { providerColors, providerShadows } from "../../provider/theme";
import { formatEtbRange } from "../../provider/format";

const CATEGORIES = [
  { label: "Sales &\nMarketing", icon: "briefcase", color: "#E8F4FD" },
  { label: "Construction\n& Trades", icon: "construct", color: "#E8F4FD" },
  { label: "Health &\nCare", icon: "heart", color: "#E8F4FD" },
  { label: "Education &\nTraining", icon: "school", color: "#E8F4FD" },
  { label: "Transport &\nLogistics", icon: "car", color: "#E8F4FD" },
  { label: "Hospitality &\nTourism", icon: "restaurant", color: "#E8F4FD" },
];

export function ProviderHomeScreen() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const dashboardQuery = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: getProviderDashboard,
  });

  const bootstrapQuery = useQuery({
    queryKey: ["provider-bootstrap"],
    queryFn: getProviderBootstrap,
  });

  const featuredJobsQuery = useQuery({
    queryKey: ["provider-home-featured-jobs", searchTerm, selectedCategory],
    queryFn: () =>
      getOpenJobs({
        limit: 4,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      }),
  });

  const recentJobsQuery = useQuery({
    queryKey: ["provider-home-recent-jobs"],
    queryFn: () => getOpenJobs({ limit: 5 }),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: ({ jobId, save }: { jobId: string; save: boolean }) =>
      toggleSaveJob(jobId, save),
    onSuccess: (_, variables) => {
      setSavedJobs((prev) => ({ ...prev, [variables.jobId]: variables.save }));
    },
  });

  const handleToggleSave = (jobId: string, currentSavedState: boolean) => {
    const isCurrentlySaved =
      savedJobs[jobId] !== undefined ? savedJobs[jobId] : currentSavedState;
    setSavedJobs((prev) => ({ ...prev, [jobId]: !isCurrentlySaved }));
    toggleSaveMutation.mutate({ jobId, save: !isCurrentlySaved });
  };

  const dashboard = dashboardQuery.data;
  const providerName =
    dashboard?.provider_name ||
    bootstrapQuery.data?.profile?.full_name ||
    "Provider";
  const firstName = providerName.split(" ")[0];
  const avatarUrl = bootstrapQuery.data?.user?.avatar_url;

  const featuredJobs = (featuredJobsQuery.data || []).map(mapBackendJobToProviderJob);
  const recentJobs = (recentJobsQuery.data || []).map(mapBackendJobToProviderJob);

  return (
    <View style={styles.root}>
      {/* Blue Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandLogoWrap}>
            <Text style={styles.brandLogoText}>S</Text>
          </View>
          <View>
            <Text style={styles.brandName}>SERRALE</Text>
            <Text style={styles.brandTagline}>Work. Serve. Grow.</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.notifBtn}>
            <IconSymbol name="notifications" size={22} color="#fff" />
            <View style={styles.notifDot} />
          </Pressable>
          <Pressable style={styles.avatarBtn}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarInitial}>
                  {firstName[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <IconSymbol name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for jobs, skills, companies..."
            placeholderTextColor="#94A3B8"
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeTextWrap}>
            <Text style={styles.welcomeTitle}>Welcome, {firstName}!</Text>
            <Text style={styles.welcomeSubtitle}>Find your next opportunity.</Text>
          </View>
          <View style={styles.langToggle}>
            <Pressable style={styles.langActive}>
              <Text style={styles.langActiveText}>EN</Text>
            </Pressable>
            <Pressable style={styles.langInactive}>
              <Text style={styles.langInactiveText}>አዋ</Text>
            </Pressable>
          </View>
        </View>

        {/* Popular Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <Pressable onPress={() => router.push("/tabs/jobs")}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.label}
                style={styles.categoryItem}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === cat.label ? null : cat.label
                  )
                }
              >
                <View
                  style={[
                    styles.categoryCircle,
                    selectedCategory === cat.label && styles.categoryCircleActive,
                  ]}
                >
                  <IconSymbol
                    name={cat.icon}
                    size={24}
                    color={
                      selectedCategory === cat.label ? "#fff" : "#1E40AF"
                    }
                  />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Jobs</Text>
            <Pressable onPress={() => router.push("/tabs/jobs")}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {featuredJobsQuery.isLoading ? (
            <ActivityIndicator size="small" color="#1D4ED8" style={{ marginTop: 16 }} />
          ) : featuredJobs.length === 0 ? (
            <Text style={styles.emptyText}>No featured jobs right now.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredJobs.map((job) => (
                <FeaturedJobCard
                  key={job.id}
                  job={job}
                  isSaved={
                    savedJobs[job.id] !== undefined
                      ? savedJobs[job.id]
                      : (job as any).saved || false
                  }
                  onToggleSave={() =>
                    handleToggleSave(job.id, (job as any).saved || false)
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/jobs/[jobId]" as any,
                      params: { jobId: job.id },
                    })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent Job Openings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Job Openings</Text>
            <Pressable onPress={() => router.push("/tabs/jobs")}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {recentJobsQuery.isLoading ? (
            <ActivityIndicator size="small" color="#1D4ED8" style={{ marginTop: 16 }} />
          ) : recentJobs.length === 0 ? (
            <Text style={styles.emptyText}>No job openings right now.</Text>
          ) : (
            <View style={styles.recentList}>
              {recentJobs.slice(0, 5).map((job) => (
                <RecentJobRow
                  key={job.id}
                  job={job}
                  onPress={() =>
                    router.push({
                      pathname: "/jobs/[jobId]" as any,
                      params: { jobId: job.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// --- Sub-components ---

function FeaturedJobCard({ job, isSaved, onToggleSave, onPress }: any) {
  const budget = formatEtbRange(job.budgetMin, job.budgetMax);
  return (
    <Pressable style={styles.featuredCard} onPress={onPress}>
      <View style={styles.fcTopRow}>
        <View style={styles.fcLogoWrap}>
          <Text style={styles.fcLogoText}>
            {(job.client || job.title || "J")[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.fcCompanyInfo}>
          <Text style={styles.fcCompany} numberOfLines={1}>
            {job.client || "Client"}
          </Text>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>Premium</Text>
        </View>
        <Pressable onPress={onToggleSave} style={styles.fcBookmark}>
          <IconSymbol
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={isSaved ? "#1D4ED8" : "#94A3B8"}
          />
        </Pressable>
      </View>
      <Text style={styles.fcTitle} numberOfLines={2}>{job.title}</Text>
      <View style={styles.fcLocationRow}>
        <IconSymbol name="location" size={13} color="#64748B" />
        <Text style={styles.fcLocation}>{job.location || "Ethiopia"}</Text>
      </View>
      <View style={styles.fcBottomRow}>
        <Text style={styles.fcSalaryLabel}>
          Salary • <Text style={styles.fcSalaryValue}>{budget}</Text>
        </Text>
        <View style={styles.fcTypePill}>
          <Text style={styles.fcTypeText}>Full-time</Text>
        </View>
      </View>
    </Pressable>
  );
}

function RecentJobRow({ job, onPress }: any) {
  return (
    <View style={styles.recentRow}>
      <View style={styles.recentLogoWrap}>
        <Text style={styles.recentLogoText}>
          {(job.client || job.title || "J")[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{job.title}</Text>
        <View style={styles.recentMeta}>
          <Text style={styles.recentCompany}>{job.client || "Company"}</Text>
          <Text style={styles.recentDot}>•</Text>
          <IconSymbol name="location" size={11} color="#64748B" />
          <Text style={styles.recentLocation}>{job.location || "Ethiopia"}</Text>
        </View>
      </View>
      <Pressable style={styles.applyBtn} onPress={onPress}>
        <Text style={styles.applyBtnText}>Apply Now</Text>
      </Pressable>
    </View>
  );
}

// --- Styles ---

const BLUE = "#1D4ED8";
const DARK_BLUE = "#1E3A8A";
const NAVY = "#0F172A";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // HEADER
  header: {
    backgroundColor: BLUE,
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    fontStyle: "italic",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notifBtn: {
    position: "relative",
    padding: 4,
  },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#38BDF8",
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
  },
  headerAvatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // SEARCH
  searchWrap: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: NAVY,
    paddingVertical: 0,
  },

  // SCROLL
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // WELCOME BANNER
  welcomeBanner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: DARK_BLUE,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  welcomeTextWrap: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  langActive: {
    backgroundColor: "#fff",
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langActiveText: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK_BLUE,
  },
  langInactive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langInactiveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  // SECTIONS
  section: {
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: BLUE,
  },

  // CATEGORIES
  categoryScroll: {
    gap: 16,
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: "center",
    width: 72,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryCircleActive: {
    backgroundColor: BLUE,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    lineHeight: 13,
  },

  // FEATURED JOBS
  featuredScroll: {
    gap: 12,
    paddingRight: 16,
  },
  featuredCard: {
    width: 195,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  fcTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  fcLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  fcLogoText: {
    fontSize: 16,
    fontWeight: "800",
    color: BLUE,
  },
  fcCompanyInfo: {
    flex: 1,
  },
  fcCompany: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  premiumBadge: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  fcBookmark: {
    padding: 2,
  },
  fcTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: NAVY,
    lineHeight: 20,
    marginBottom: 8,
  },
  fcLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  fcLocation: {
    fontSize: 12,
    color: "#64748B",
  },
  fcBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fcSalaryLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  fcSalaryValue: {
    fontWeight: "700",
    color: NAVY,
  },
  fcTypePill: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fcTypeText: {
    fontSize: 10,
    fontWeight: "700",
    color: BLUE,
  },

  // RECENT JOB ROWS
  recentList: {
    gap: 0,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  recentLogoWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexShrink: 0,
  },
  recentLogoText: {
    fontSize: 18,
    fontWeight: "800",
    color: BLUE,
  },
  recentInfo: {
    flex: 1,
    gap: 3,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  recentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recentCompany: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  recentDot: {
    fontSize: 10,
    color: "#CBD5E1",
  },
  recentLocation: {
    fontSize: 12,
    color: "#64748B",
  },
  applyBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexShrink: 0,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
  },

  // MISC
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 16,
  },
});
