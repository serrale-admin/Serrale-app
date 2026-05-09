import { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getOpenJobs, toggleSaveJob, getProviderBootstrap } from "@serrale/api";
import { mapBackendJobToProviderJob } from "../../provider/mappers/jobs";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { formatEtbRange } from "../../provider/format";

const CATEGORIES = [
  { label: "Design", icon: "code-slash" },
  { label: "Development", icon: "code-slash" },
  { label: "Marketing", icon: "megaphone" },
  { label: "Writing", icon: "pencil" },
  { label: "Construction", icon: "construct" },
  { label: "Hospitality", icon: "restaurant" },
];

const BLUE = "#1D4ED8";
const DARK_BLUE = "#1E3A8A";
const NAVY = "#0F172A";

export function ProviderJobsScreen() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Design");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const bootstrapQuery = useQuery({
    queryKey: ["provider-bootstrap"],
    queryFn: getProviderBootstrap,
  });

  const jobsQuery = useQuery({
    queryKey: ["provider-jobs", searchTerm, selectedCategory],
    queryFn: () =>
      getOpenJobs({
        limit: 30,
        search: searchTerm || undefined,
        category: selectedCategory === "All" ? undefined : selectedCategory,
      }),
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

  const jobs = (jobsQuery.data || []).map(mapBackendJobToProviderJob);
  const avatarUrl = bootstrapQuery.data?.user?.avatar_url;

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
                <IconSymbol name="person" size={20} color="#fff" />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Search Bar in Blue Area */}
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
        {/* Page Title */}
        <View style={styles.pageTitleSection}>
          <Text style={styles.pageTitle}>Jobs</Text>
          <Text style={styles.pageSubtitle}>
            Find opportunities that match your skills.
          </Text>
        </View>

        {/* Category Icon Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categoryScrollWrap}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.label === selectedCategory;
            return (
              <Pressable
                key={cat.label}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.label)}
              >
                <IconSymbol
                  name={cat.icon}
                  size={18}
                  color={active ? "#fff" : "#475569"}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    active && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Filter + Sort Bar */}
        <View style={styles.filterBar}>
          <Pressable style={styles.filterBtn}>
            <IconSymbol name="options" size={16} color={NAVY} />
            <Text style={styles.filterBtnText}>Filters</Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>2</Text>
            </View>
          </Pressable>
          <View style={styles.filterDivider} />
          <Pressable style={styles.sortBtn}>
            <IconSymbol name="swap-vertical" size={16} color={NAVY} />
            <Text style={styles.sortBtnText}>Sort: Newest</Text>
            <IconSymbol name="chevron-down" size={14} color="#64748B" />
          </Pressable>
        </View>

        {/* Job List */}
        <View style={styles.listWrap}>
          {jobsQuery.isFetching && jobs.length === 0 ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={BLUE} />
              <Text style={styles.loadingText}>Finding jobs for you...</Text>
            </View>
          ) : jobsQuery.isError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Couldn't load jobs.</Text>
              <Text style={styles.errorSubText}>
                Check your connection and try again.
              </Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => jobsQuery.refetch()}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No jobs found</Text>
              <Text style={styles.emptySubText}>
                Try another search or category.
              </Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => {
                  setSearchInput("");
                  setSelectedCategory("Design");
                }}
              >
                <Text style={styles.retryBtnText}>Clear filters</Text>
              </Pressable>
            </View>
          ) : (
            jobs.map((job) => {
              const isSaved =
                savedJobs[job.id] !== undefined
                  ? savedJobs[job.id]
                  : (job as any).saved || false;
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={isSaved}
                  onToggleSave={() =>
                    handleToggleSave(job.id, (job as any).saved || false)
                  }
                  onOpen={() =>
                    router.push({
                      pathname: "/jobs/[jobId]" as any,
                      params: { jobId: job.id },
                    })
                  }
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// --- Job Card ---

function JobCard({
  job,
  saved,
  onToggleSave,
  onOpen,
}: {
  job: any;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const budgetStr = formatEtbRange(job.budgetMin, job.budgetMax);
  const exp = job.experienceLevel
    ? job.experienceLevel === "Entry Levl"
      ? "Entry Level"
      : job.experienceLevel
    : null;

  return (
    <View style={styles.card}>
      {/* Top Row: logo, company, premium, time, bookmark */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardLogo}>
          <Text style={styles.cardLogoText}>
            {(job.client || job.title || "J")[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardCompanyWrap}>
          <View style={styles.cardCompanyRow}>
            <Text style={styles.cardCompany} numberOfLines={1}>
              {job.client || "Company"}
            </Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          </View>
          <Text style={styles.cardTime}>{job.postedAt || "Recently"}</Text>
        </View>
        <Pressable onPress={onToggleSave} style={styles.bookmarkBtn}>
          <IconSymbol
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? BLUE : "#94A3B8"}
          />
        </Pressable>
      </View>

      {/* Job Title */}
      <Text style={styles.cardTitle}>{job.title}</Text>

      {/* Location */}
      <View style={styles.cardLocationRow}>
        <IconSymbol name="location" size={13} color="#64748B" />
        <Text style={styles.cardLocation}>{job.location || "Ethiopia"}</Text>
      </View>

      {/* Meta Chips + View Details */}
      <View style={styles.cardBottom}>
        <View style={styles.metaChips}>
          {exp && (
            <View style={styles.metaChip}>
              <IconSymbol name="briefcase" size={12} color="#64748B" />
              <Text style={styles.metaChipText}>{exp}</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <IconSymbol name="time" size={12} color="#64748B" />
            <Text style={styles.metaChipText}>Full-time</Text>
          </View>
          {budgetStr ? (
            <View style={styles.metaChip}>
              <IconSymbol name="pricetag" size={12} color="#64748B" />
              <Text style={styles.metaChipText}>{budgetStr}</Text>
            </View>
          ) : null}
        </View>
        <Pressable style={styles.viewDetailsBtn} onPress={onOpen}>
          <Text style={styles.viewDetailsBtnText}>View Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Styles ---

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

  // PAGE TITLE
  pageTitleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  // CATEGORY PILLS WITH ICONS
  categoryScrollWrap: {
    marginBottom: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingRight: 24,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryPillActive: {
    backgroundColor: DARK_BLUE,
    borderColor: DARK_BLUE,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  categoryPillTextActive: {
    color: "#fff",
  },

  // FILTER BAR
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    flex: 1,
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    justifyContent: "flex-end",
  },
  sortBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },

  // JOB LIST
  listWrap: {
    paddingHorizontal: 16,
    gap: 0,
  },

  // JOB CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  cardLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardLogoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },
  cardCompanyWrap: {
    flex: 1,
  },
  cardCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 2,
  },
  cardCompany: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
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
  cardTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
  bookmarkBtn: {
    padding: 4,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 6,
    lineHeight: 26,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  cardLocation: {
    fontSize: 13,
    color: "#64748B",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  viewDetailsBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 0,
  },
  viewDetailsBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: BLUE,
  },

  // STATES
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  errorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  errorText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  errorSubText: {
    fontSize: 13,
    color: "#64748B",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  emptySubText: {
    fontSize: 13,
    color: "#64748B",
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
