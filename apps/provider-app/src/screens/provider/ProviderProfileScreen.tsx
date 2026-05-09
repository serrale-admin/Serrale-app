import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getProviderBootstrap } from "@serrale/api";
import { IconSymbol } from "../../provider/components/IconSymbol";

const BLUE = "#1D4ED8";
const DARK_BLUE = "#1E3A8A";
const NAVY = "#0F172A";

export function ProviderProfileScreen() {
  const router = useRouter();

  const bootstrapQuery = useQuery({
    queryKey: ["provider-bootstrap"],
    queryFn: getProviderBootstrap,
  });

  if (bootstrapQuery.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (bootstrapQuery.isError || !bootstrapQuery.data) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>Unable to load profile.</Text>
      </View>
    );
  }

  const { user, profile, completeness, skills, portfolio, services, verification, reviews } =
    bootstrapQuery.data;

  const completion = Number(
    completeness?.score ?? (profile as any)?.completeness_score ?? 78
  );
  const fullName =
    profile?.full_name || user?.full_name || (profile as any)?.name || "Provider";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const title = profile?.title || (profile as any)?.category || "Service Provider";
  const isVerified = Boolean(
    verification?.verified_identity || (profile as any)?.verified_identity
  );

  const normalizedSkills = (skills || []).map(
    (s: any) => s?.skills?.name || s?.name || s?.label || String(s)
  );

  const projectsCount = (profile as any)?.projects_completed ?? 0;
  const proposalsCount = (profile as any)?.proposals_submitted ?? 0;
  const skillsCount = normalizedSkills.length;
  const reviewsCount = reviews?.length || (profile as any)?.review_count || 0;

  return (
    <View style={styles.root}>
      {/* ── Header ───────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable style={styles.topBarBtn}>
          <IconSymbol name="notifications-outline" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.topBarTitle}>Profile</Text>
        <Pressable style={styles.topBarBtn} onPress={() => router.push("/settings/profile" as any)}>
          <IconSymbol name="settings-outline" size={22} color={NAVY} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card (dark navy gradient) ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <Pressable style={styles.cameraBadge}>
                <IconSymbol name="camera" size={13} color={BLUE} />
              </Pressable>
            </View>

            {/* Name & title */}
            <View style={styles.heroInfo}>
              <View style={styles.heroNameRow}>
                <Text style={styles.heroName} numberOfLines={1}>{fullName}</Text>
                <IconSymbol name="checkmark-circle" size={18} color="#60A5FA" />
              </View>
              <Text style={styles.heroTitle}>{title}</Text>
              <View style={styles.heroBadges}>
                <View style={styles.badgeGreen}>
                  <View style={styles.greenDot} />
                  <Text style={styles.badgeGreenText}>Available for work</Text>
                </View>
                <View style={styles.badgeBlue}>
                  <IconSymbol name="shield-checkmark" size={12} color="#93C5FD" />
                  <Text style={styles.badgeBlueText}>Identity verified</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Completeness Bar */}
          <View style={styles.completionRow}>
            <Text style={styles.completionLabel}>Profile completeness</Text>
            <View style={styles.progressWrap}>
              <View style={[styles.progressFill, { width: `${completion}%` as any }]} />
            </View>
            <Text style={styles.completionPct}>{completion}%</Text>
            <IconSymbol name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
          </View>
        </View>

        {/* ── Stats Row ───────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard value={projectsCount} label={"Projects\nCompleted"} icon="briefcase" iconColor={BLUE} iconBg="#EEF2FF" />
          <StatCard value={proposalsCount} label={"Proposals\nSubmitted"} icon="document-text" iconColor="#059669" iconBg="#ECFDF5" />
          <StatCard value={skillsCount} label={"Skills\nAdded"} icon="star" iconColor="#7C3AED" iconBg="#F5F3FF" />
          <StatCard value={reviewsCount} label={"Reviews\nReceived"} icon="star-outline" iconColor="#EA580C" iconBg="#FFF7ED" />
        </View>

        {/* ── Quick Actions ────────────────────── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            <QuickBtn label="Edit Profile" icon="person-outline" onPress={() => router.push("/settings/profile" as any)} />
            <QuickBtn label="Add Portfolio" icon="folder-outline" onPress={() => router.push("/portfolio" as any)} />
            <QuickBtn label="My Services" icon="briefcase-outline" onPress={() => router.push("/settings/profile" as any)} />
            <QuickBtn label="Verification" icon="shield-checkmark-outline" onPress={() => router.push("/settings/profile" as any)} />
          </View>
        </View>

        {/* ── About ───────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>About</Text>
            <IconSymbol name="chevron-forward" size={18} color="#94A3B8" />
          </View>
          <Text style={styles.bodyText} numberOfLines={4}>
            {profile?.bio || "Add a short bio to help clients understand your work and experience."}
          </Text>
        </View>

        {/* ── Skills ──────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>Skills</Text>
            <Text style={styles.linkText}>View all</Text>
          </View>
          {normalizedSkills.length > 0 ? (
            <View style={styles.chipsWrap}>
              {normalizedSkills.slice(0, 4).map((s: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
              {normalizedSkills.length > 4 && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>+{normalizedSkills.length - 4}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>Add skills so clients can find you.</Text>
          )}
        </View>

        {/* ── Portfolio Preview ────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>Portfolio Preview</Text>
            <Text style={styles.linkText}>View all</Text>
          </View>
          {portfolio?.length > 0 ? (
            <View style={styles.portfolioGrid}>
              {portfolio.slice(0, 2).map((item: any, i: number) => (
                <View key={i} style={styles.portfolioItem}>
                  {item.media_url ? (
                    <Image source={{ uri: item.media_url }} style={styles.portfolioImg} />
                  ) : (
                    <View style={styles.portfolioPlaceholder}>
                      <IconSymbol name="image-outline" size={28} color="#94A3B8" />
                    </View>
                  )}
                  <Text style={styles.portfolioTitle} numberOfLines={2}>
                    {item.title || "Untitled"}
                  </Text>
                  <Text style={styles.portfolioCategory}>
                    {item.category || item.service || "Portfolio"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="folder-open-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No portfolio yet</Text>
              <Text style={styles.linkText}>Add your first work</Text>
            </View>
          )}
        </View>

        {/* ── My Services ─────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>My Services</Text>
            <Text style={styles.linkText}>View all</Text>
          </View>
          {services?.length > 0 ? (
            <View style={styles.servicesList}>
              {services.slice(0, 2).map((svc: any, i: number) => (
                <View key={i} style={[styles.serviceRow, i < services.slice(0,2).length - 1 && styles.serviceBorder]}>
                  <View style={styles.serviceIcon}>
                    <IconSymbol name="pencil" size={22} color="#059669" />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceTitle} numberOfLines={1}>{svc.name}</Text>
                    {svc.description && (
                      <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
                    )}
                  </View>
                  <View style={styles.servicePriceCol}>
                    <Text style={styles.servicePrice}>
                      {svc.price
                        ? `ETB ${new Intl.NumberFormat("en-US").format(Number(svc.price))}`
                        : "Set price"}
                    </Text>
                    <Text style={styles.servicePriceSub}>Starting price</Text>
                  </View>
                  <IconSymbol name="chevron-forward" size={16} color="#94A3B8" />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Create service packages clients can choose from.</Text>
          )}
        </View>

        {/* ── Settings Menu ───────────────────── */}
        <View style={styles.menuCard}>
          <SettingsRow icon="settings-outline" label="Account Settings" />
          <SettingsRow icon="notifications-outline" label="Notifications" />
          <SettingsRow icon="help-circle-outline" label="Help & Support" last />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ value, label, icon, iconColor, iconBg }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
        <IconSymbol name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickBtn({ label, icon, onPress }: any) {
  return (
    <Pressable style={styles.quickBtn} onPress={onPress}>
      <IconSymbol name={icon} size={20} color={BLUE} />
      <Text style={styles.quickBtnText}>{label}</Text>
    </Pressable>
  );
}

function SettingsRow({ icon, label, last }: any) {
  return (
    <Pressable style={[styles.settingsRow, !last && styles.settingsRowBorder]}>
      <IconSymbol name={icon} size={20} color="#64748B" />
      <Text style={styles.settingsRowLabel}>{label}</Text>
      <IconSymbol name="chevron-forward" size={16} color="#94A3B8" />
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  topBarBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
  },

  // SCROLL
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // HERO CARD — dark navy gradient
  heroCard: {
    backgroundColor: DARK_BLUE,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: DARK_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroInfo: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
  },
  heroTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 10,
  },
  heroBadges: {
    gap: 6,
  },
  badgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    gap: 6,
    alignSelf: "flex-start",
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#22C55E",
  },
  badgeGreenText: {
    fontSize: 12,
    color: "#86EFAC",
    fontWeight: "600",
  },
  badgeBlue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96,165,250,0.15)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.3)",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    gap: 6,
    alignSelf: "flex-start",
  },
  badgeBlueText: {
    fontSize: 12,
    color: "#93C5FD",
    fontWeight: "600",
  },

  // COMPLETENESS
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  completionLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  progressWrap: {
    flex: 1,
    height: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 7,
    backgroundColor: "#60A5FA",
    borderRadius: 4,
  },
  completionPct: {
    fontSize: 14,
    fontWeight: "700",
    color: "#60A5FA",
  },

  // STATS ROW — 4 equal white cards
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    gap: 6,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 13,
  },

  // SECTION BLOCK
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 12,
  },

  // QUICK ACTIONS — 4 equal buttons in a row
  quickGrid: {
    flexDirection: "row",
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: NAVY,
    textAlign: "center",
  },

  // CARDS
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  linkText: {
    fontSize: 13,
    color: BLUE,
    fontWeight: "600",
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },

  // SKILLS
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: BLUE,
  },

  // PORTFOLIO
  portfolioGrid: {
    flexDirection: "row",
    gap: 12,
  },
  portfolioItem: {
    flex: 1,
    gap: 6,
  },
  portfolioImg: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },
  portfolioPlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
    lineHeight: 17,
  },
  portfolioCategory: {
    fontSize: 11,
    color: "#64748B",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
  },

  // SERVICES
  servicesList: {
    gap: 0,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  serviceBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  serviceInfo: {
    flex: 1,
    gap: 3,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  serviceDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  servicePriceCol: {
    alignItems: "flex-end",
    gap: 2,
    flexShrink: 0,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#059669",
  },
  servicePriceSub: {
    fontSize: 10,
    color: "#94A3B8",
  },

  // SETTINGS MENU
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 32,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    gap: 14,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingsRowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
});
