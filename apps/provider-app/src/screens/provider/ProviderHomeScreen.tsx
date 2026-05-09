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
import { formatEtbRange } from "../../provider/format";

const BLUE = "#1D4ED8";
const DARK_BLUE = "#1E3A8A";
const NAVY = "#0F172A";

const CATEGORIES = [
  { label: "Sales &\nMarketing", icon: "briefcase", bg: "#DBEAFE", iconColor: "#1D4ED8", glass: "rgba(219,234,254,0.75)" },
  { label: "Construction\n& Trades", icon: "construct", bg: "#D1FAE5", iconColor: "#065F46", glass: "rgba(209,250,229,0.75)" },
  { label: "Health &\nCare", icon: "heart", bg: "#FCE7F3", iconColor: "#9D174D", glass: "rgba(252,231,243,0.75)" },
  { label: "Education &\nTraining", icon: "school", bg: "#FEF3C7", iconColor: "#92400E", glass: "rgba(254,243,199,0.75)" },
  { label: "Transport &\nLogistics", icon: "car", bg: "#EDE9FE", iconColor: "#5B21B6", glass: "rgba(237,233,254,0.75)" },
  { label: "Hospitality &\nTourism", icon: "restaurant", bg: "#FFE4E6", iconColor: "#9F1239", glass: "rgba(255,228,230,0.75)" },
];

const LOGO_COLORS = ["#1E3A8A", "#065F46", "#6D28D9", "#92400E", "#831843", "#1D4ED8"];
function logoColor(initial: string) {
  return LOGO_COLORS[initial.charCodeAt(0) % LOGO_COLORS.length];
}

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
          <IconSymbol name="search" size={16} color="#94A3B8" />
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
                    {
                      backgroundColor:
                        selectedCategory === cat.label
                          ? BLUE
                          : cat.glass,
                      borderColor:
                        selectedCategory === cat.label
                          ? BLUE
                          : "rgba(255,255,255,0.9)",
                    },
                  ]}
                >
                  <IconSymbol
                    name={cat.icon}
                    size={26}
                    color={selectedCategory === cat.label ? "#fff" : cat.iconColor}
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
            <ActivityIndicator size="small" color={BLUE} style={{ marginTop: 16 }} />
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
        <View style={[styles.section, { paddingBottom: 8 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Job Openings</Text>
            <Pressable onPress={() => router.push("/tabs/jobs")}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {recentJobsQuery.isLoading ? (
            <ActivityIndicator size="small" color={BLUE} style={{ marginTop: 16 }} />
          ) : recentJobs.length === 0 ? (
            <Text style={styles.emptyText}>No job openings right now.</Text>
          ) : (
            <View style={styles.recentCard}>
              {recentJobs.slice(0, 5).map((job, i) => (
                <RecentJobRow
                  key={job.id}
                  job={job}
                  isLast={i === Math.min(recentJobs.length, 5) - 1}
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

// ─── Sub-components ─────────────────────────────────────────────────────────

function FeaturedJobCard({ job, isSaved, onToggleSave, onPress }: any) {
  const budget = formatEtbRange(job.budgetMin, job.budgetMax);
  const initial = (job.client || job.title || "J")[0].toUpperCase();
  const lc = logoColor(initial);
  return (
    <Pressable style={styles.featuredCard} onPress={onPress}>
      <View style={styles.fcTopRow}>
        <View style={[styles.fcLogoWrap, { backgroundColor: lc }]}>
          <Text style={styles.fcLogoText}>{initial}</Text>
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
            color={isSaved ? BLUE : "#94A3B8"}
          />
        </Pressable>
      </View>
      <Text style={styles.fcTitle} numberOfLines={2}>{job.title}</Text>
      <View style={styles.fcLocationRow}>
        <IconSymbol name="location" size={13} color="#64748B" />
        <Text style={styles.fcLocation}>{job.location || "Ethiopia"}</Text>
      </View>
      <View style={styles.fcDivider} />
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

function RecentJobRow({ job, onPress, isLast }: any) {
  const initial = (job.client || job.title || "J")[0].toUpperCase();
  const lc = logoColor(initial);
  return (
    <Pressable
      style={[styles.recentRow, !isLast && styles.recentRowBorder]}
      onPress={onPress}
    >
      <View style={[styles.recentLogoWrap, { backgroundColor: lc }]}>
        <Text style={styles.recentLogoText}>{initial}</Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{job.title}</Text>
        <View style={styles.recentMeta}>
          <Text style={styles.recentCompany}>{job.client || "Company"}</Text>
          <Text style={styles.recentDot}>•</Text>
          <IconSymbol name="location" size={11} color="#94A3B8" />
          <Text style={styles.recentLocation}>{job.location || "Ethiopia"}</Text>
        </View>
      </View>
      <Pressable style={styles.applyBtn} onPress={onPress}>
        <Text style={styles.applyBtnText}>Apply Now</Text>
      </Pressable>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0F5FF",
  },

  // HEADER
  header: {
    backgroundColor: BLUE,
    paddingTop: 52,
    paddingBottom: 10,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    fontStyle: "italic",
  },
  brandName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#38BDF8",
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
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
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // SEARCH
  searchWrap: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchBar: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
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
    backgroundColor: "#F0F5FF",
  },

  // WELCOME BANNER
  welcomeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 20,
    backgroundColor: DARK_BLUE,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: DARK_BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  welcomeTextWrap: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 22,
    padding: 3,
    gap: 2,
  },
  langActive: {
    backgroundColor: "#fff",
    borderRadius: 19,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  langActiveText: {
    fontSize: 13,
    fontWeight: "800",
    color: DARK_BLUE,
  },
  langInactive: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  langInactiveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  // SECTIONS
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 20,
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

  // CATEGORIES — liquid glass circles
  categoryScroll: {
    gap: 14,
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: "center",
    width: 70,
    gap: 6,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    // liquid glass base
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    lineHeight: 13,
  },

  // FEATURED CARDS
  featuredScroll: {
    gap: 12,
    paddingRight: 16,
  },
  featuredCard: {
    width: 210,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  fcTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  fcLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fcLogoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
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
    fontSize: 16,
    fontWeight: "800",
    color: NAVY,
    lineHeight: 21,
    marginBottom: 6,
  },
  fcLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  fcLocation: {
    fontSize: 12,
    color: "#64748B",
  },
  fcDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 10,
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
    fontSize: 12,
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

  // RECENT JOBS — wrapped white card
  recentCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  recentLogoWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recentLogoText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#fff",
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
    paddingHorizontal: 12,
    paddingVertical: 8,
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
