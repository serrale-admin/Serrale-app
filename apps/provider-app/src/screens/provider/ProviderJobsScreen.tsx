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

const BLUE = "#1D4ED8";
const DARK_BLUE = "#1E3A8A";
const NAVY = "#0F172A";

const CATEGORIES = [
  { label: "All", icon: "apps" },
  { label: "Design", icon: "color-palette" },
  { label: "Development", icon: "code-slash" },
  { label: "Marketing", icon: "megaphone" },
  { label: "Writing", icon: "pencil" },
  { label: "Construction", icon: "construct" },
  { label: "More", icon: "ellipsis-horizontal" },
];

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
                <IconSymbol name="person" size={18} color="#fff" />
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
            placeholder="Search projects, skills, or clients..."
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
        <View style={styles.pageTitleWrap}>
          <Text style={styles.pageTitle}>Projects</Text>
          <Text style={styles.pageSubtitle}>
            Find client projects that match your skills.
          </Text>
        </View>

        {/* Category Vertical Icon Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          style={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.label === selectedCategory;
            return (
              <Pressable
                key={cat.label}
                style={styles.categoryItem}
                onPress={() => setSelectedCategory(cat.label)}
              >
                <View
                  style={[
                    styles.categoryIconBox,
                    active && styles.categoryIconBoxActive,
                  ]}
                >
                  <IconSymbol
                    name={cat.icon}
                    size={22}
                    color={active ? "#fff" : "#475569"}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Filter / Sort Bar */}
        <View style={styles.filterBar}>
          <Pressable style={styles.filterSide}>
            <IconSymbol name="options" size={15} color={NAVY} />
            <Text style={styles.filterText}>Filters</Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>2</Text>
            </View>
          </Pressable>
          <View style={styles.filterDivider} />
          <Pressable style={styles.sortSide}>
            <IconSymbol name="swap-vertical" size={15} color={NAVY} />
            <Text style={styles.sortText}>Sort: Newest</Text>
            <IconSymbol name="chevron-down" size={13} color="#64748B" />
          </Pressable>
        </View>

        {/* Job List */}
        <View style={styles.listWrap}>
          {jobsQuery.isFetching && jobs.length === 0 ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={BLUE} />
              <Text style={styles.stateText}>Finding projects for you...</Text>
            </View>
          ) : jobsQuery.isError ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Couldn't load projects.</Text>
              <Text style={styles.stateSubText}>Check your connection.</Text>
              <Pressable style={styles.stateBtn} onPress={() => jobsQuery.refetch()}>
                <Text style={styles.stateBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>No projects found</Text>
              <Text style={styles.stateSubText}>Try another search or category.</Text>
              <Pressable
                style={styles.stateBtn}
                onPress={() => { setSearchInput(""); setSelectedCategory("All"); }}
              >
                <Text style={styles.stateBtnText}>Clear filters</Text>
              </Pressable>
            </View>
          ) : (
            jobs.map((job) => {
              const isSaved =
                savedJobs[job.id] !== undefined
                  ? savedJobs[job.id]
                  : (job as any).saved || false;
              return (
                <ProjectCard
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

// --- Project Card ---

function ProjectCard({
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
  const initial = (job.client || job.title || "J")[0].toUpperCase();

  // pick a deterministic dark color for the logo background
  const logoColors = ["#1E3A8A", "#065F46", "#6D28D9", "#92400E", "#831843"];
  const logoColor = logoColors[(initial.charCodeAt(0)) % logoColors.length];

  return (
    <View style={styles.card}>
      {/* Row 1: logo | title + meta | time | bookmark */}
      <View style={styles.cardHeader}>
        <View style={[styles.cardLogo, { backgroundColor: logoColor }]}>
          <Text style={styles.cardLogoText}>{initial}</Text>
        </View>

        <View style={styles.cardHeaderMid}>
          <Text style={styles.cardTitle} numberOfLines={1}>{job.title}</Text>
          <View style={styles.cardCompanyRow}>
            <Text style={styles.cardCompany} numberOfLines={1}>
              {job.client || "Company"}
            </Text>
            <IconSymbol name="checkmark-circle" size={13} color={BLUE} />
          </View>
          <View style={styles.cardLocationRow}>
            <IconSymbol name="location" size={12} color="#94A3B8" />
            <Text style={styles.cardLocation}>{job.location || "Ethiopia"}</Text>
          </View>
        </View>

        <View style={styles.cardHeaderRight}>
          <Text style={styles.cardTime}>{job.postedAt || "Recently"}</Text>
          <Pressable onPress={onToggleSave} style={styles.bookmarkBtn}>
            <IconSymbol
              name={saved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={saved ? BLUE : "#94A3B8"}
            />
          </Pressable>
        </View>
      </View>

      {/* Description */}
      {job.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {job.description}
        </Text>
      ) : null}

      {/* Bottom: budget + timeline + button */}
      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <View style={styles.metaBlock}>
            <View style={styles.metaIconRow}>
              <IconSymbol name="briefcase" size={12} color="#64748B" />
              <Text style={styles.metaLabel}>Budget</Text>
            </View>
            <Text style={styles.metaValue} numberOfLines={1}>
              {budgetStr || "Negotiable"}
            </Text>
          </View>

          {job.duration && (
            <>
              <View style={styles.metaSep} />
              <View style={styles.metaBlock}>
                <View style={styles.metaIconRow}>
                  <IconSymbol name="calendar" size={12} color="#64748B" />
                  <Text style={styles.metaLabel}>Timeline</Text>
                </View>
                <View style={styles.timelinePill}>
                  <Text style={styles.timelinePillText}>{job.duration}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <Pressable style={styles.viewBtn} onPress={onOpen}>
          <Text style={styles.viewBtnText}>View Project</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF2FF",
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
  },

  // PAGE TITLE
  pageTitleWrap: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#EEF2FF",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: NAVY,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  // CATEGORIES - vertical icon+text
  categoryRow: {
    backgroundColor: "#EEF2FF",
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 10,
  },
  categoryItem: {
    alignItems: "center",
    gap: 5,
    width: 62,
  },
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryIconBoxActive: {
    backgroundColor: DARK_BLUE,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  categoryLabelActive: {
    color: DARK_BLUE,
    fontWeight: "700",
  },

  // FILTER BAR
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  filterSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flex: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
    flex: 1,
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E2E8F0",
  },
  sortSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flex: 1,
    justifyContent: "flex-end",
  },
  sortText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },

  // LIST
  listWrap: {
    paddingHorizontal: 16,
    gap: 10,
  },

  // PROJECT CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 2,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  // Card Header Row
  cardHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  cardLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardLogoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },
  cardHeaderMid: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: NAVY,
    lineHeight: 19,
  },
  cardCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardCompany: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  cardLocation: {
    fontSize: 11,
    color: "#94A3B8",
  },
  cardHeaderRight: {
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  cardTime: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  bookmarkBtn: {
    padding: 2,
  },

  // Description
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
    marginBottom: 12,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  metaBlock: {
    gap: 2,
  },
  metaIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
  },
  metaSep: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
  },
  timelinePill: {
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timelinePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  viewBtn: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 0,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // STATES
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: "#64748B",
  },
  stateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  stateSubText: {
    fontSize: 13,
    color: "#64748B",
  },
  stateBtn: {
    marginTop: 8,
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stateBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
