import { ScrollView, StyleSheet, Text, View, Pressable, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getProviderBootstrap } from "@serrale/api";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerShadows } from "../../provider/theme";

export function ProviderProfileScreen() {
  const router = useRouter();

  const bootstrapQuery = useQuery({
    queryKey: ["provider-bootstrap"],
    queryFn: getProviderBootstrap,
  });

  if (bootstrapQuery.isLoading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color={providerColors.blue} style={styles.loader} />
      </View>
    );
  }

  if (bootstrapQuery.isError || !bootstrapQuery.data) {
    return (
      <View style={styles.root}>
        <Text style={styles.errorText}>Unable to load profile.</Text>
      </View>
    );
  }

  const {
    user,
    profile,
    completeness,
    skills,
    portfolio,
    services,
    verification,
    reviews
  } = bootstrapQuery.data;

  const completion = Number(completeness?.score ?? (profile as any)?.completeness_score ?? 0);
  const fullName = profile?.full_name || user?.full_name || (profile as any)?.name || "Provider";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const title = profile?.title || (profile as any)?.category || "Service Provider";
  const isVerified = Boolean(verification?.verified_identity || (profile as any)?.verified_identity);
  const verificationStatus = isVerified ? "Identity verified" : (verification?.verification_status === "pending" ? "Pending review" : "Not verified");

  const normalizedSkills = (skills || []).map((s: any) => s?.skills?.name || s?.name || s?.label || String(s));

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.headerRight}>
          <IconSymbol name="settings-outline" size={22} color={providerColors.navy} />
        </Pressable>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <Pressable style={styles.cameraBadge}>
              <IconSymbol name="camera" size={14} color={providerColors.blue} />
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{fullName}</Text>
            <Text style={styles.profileSubtitle}>{title}</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badgeAvailable}>
                <View style={styles.dotAvailable} />
                <Text style={styles.badgeAvailableText}>Available for work</Text>
              </View>
              <View style={styles.badgeVerified}>
                <IconSymbol name="shield-checkmark" size={12} color="#2563EB" />
                <Text style={styles.badgeVerifiedText}>Identity verified</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.completionRow}>
          <Text style={styles.completionLabel}>Profile completeness</Text>
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarFill, { width: `${completion}%` }]} />
          </View>
          <Text style={styles.completionValue}>{completion}%</Text>
          <IconSymbol name="chevron-forward" size={16} color="#94A3B8" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Portfolio" value={portfolio?.length || 0} icon="briefcase" color="#E0E7FF" iconColor="#4F46E5" />
        <StatCard label="Services" value={services?.length || 0} icon="cube" color="#ECFDF5" iconColor="#059669" />
        <StatCard label="Skills" value={skills?.length || 0} icon="code-slash" color="#F5F3FF" iconColor="#7C3AED" />
        <StatCard label="Reviews" value={reviews?.length || profile?.review_count || 0} icon="star" color="#FFF7ED" iconColor="#EA580C" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionBtn label="Edit Profile" icon="person-outline" onPress={() => router.push("/settings/profile")} />
          <QuickActionBtn label="Add Portfolio" icon="image-outline" onPress={() => router.push("/portfolio")} />
          <QuickActionBtn label="Add Service" icon="cube-outline" onPress={() => router.push("/settings/profile")} />
          <QuickActionBtn label="Verification" icon="shield-checkmark-outline" onPress={() => router.push("/settings/profile")} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>About</Text>
          <IconSymbol name="chevron-forward" size={18} color={providerColors.muted} />
        </View>
        <Text style={styles.bodyText} numberOfLines={4}>
          {profile?.bio || "Add a short bio to help clients understand your work."}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Skills</Text>
          <Text style={styles.linkText}>View all</Text>
        </View>
        {normalizedSkills.length > 0 ? (
          <View style={styles.skillsWrap}>
            {normalizedSkills.slice(0, 5).map((skill: string, i: number) => (
              <View key={i} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
            {normalizedSkills.length > 5 && (
              <View style={styles.skillChip}>
                <Text style={styles.skillChipText}>+{normalizedSkills.length - 5}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Add skills so clients can find you.</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Portfolio Preview</Text>
          <Text style={styles.linkText}>View all</Text>
        </View>
        {portfolio?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioScroll}>
            {portfolio.slice(0, 2).map((item: any, i: number) => (
              <View key={i} style={styles.portfolioItem}>
                {item.media_url ? (
                  <Image source={{ uri: item.media_url }} style={styles.portfolioImg} />
                ) : (
                  <View style={styles.portfolioPlaceholder}>
                    <IconSymbol name="image-outline" size={24} color={providerColors.muted} />
                  </View>
                )}
                <View style={styles.portfolioInfo}>
                  <Text style={styles.portfolioTitle} numberOfLines={2}>{item.title || "Untitled"}</Text>
                  <Text style={styles.portfolioCategory} numberOfLines={1}>{item.category || item.service || "Portfolio"}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="folder-open-outline" size={32} color={providerColors.muted} />
            <Text style={styles.emptyTitle}>No portfolio yet</Text>
            <Text style={styles.linkText}>Add your first work</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Services</Text>
          <Text style={styles.linkText}>View all</Text>
        </View>
        {services?.length > 0 ? (
          <View style={styles.servicesList}>
            {services.slice(0, 2).map((service: any, i: number) => (
              <View key={i} style={styles.serviceRow}>
                <View style={styles.serviceIcon}>
                  <IconSymbol name="cube-outline" size={24} color={providerColors.blue} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle} numberOfLines={1}>{service.name}</Text>
                  {service.description && (
                    <Text style={styles.serviceDesc} numberOfLines={1}>{service.description}</Text>
                  )}
                </View>
                <View style={styles.servicePriceWrap}>
                  <Text style={styles.servicePrice}>
                    {service.price ? `ETB ${new Intl.NumberFormat("en-US").format(Number(service.price))}` : "Set price"}
                  </Text>
                  <IconSymbol name="chevron-forward" size={16} color={providerColors.muted} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Create service packages clients can understand.</Text>
        )}
      </View>

      <View style={styles.settingsMenu}>
        <SettingsRow icon="person-outline" title="Account Settings" />
        <SettingsRow icon="notifications-outline" title="Notifications" />
        <SettingsRow icon="help-circle-outline" title="Help & Support" hideBorder />
      </View>
    </ProviderScreen>
  );
}

// Subcomponents

function StatCard({ label, value, icon, color, iconColor }: { label: string; value: number; icon: any; color: string; iconColor: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color }]}>
        <IconSymbol name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function QuickActionBtn({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <Pressable style={styles.quickActionBtn} onPress={onPress}>
      <IconSymbol name={icon} size={18} color={providerColors.navy} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function SettingsRow({ icon, title, hideBorder }: { icon: any; title: string; hideBorder?: boolean }) {
  return (
    <Pressable style={[styles.settingsRow, !hideBorder && styles.settingsRowBorder]}>
      <IconSymbol name={icon} size={20} color={providerColors.navy} />
      <Text style={styles.settingsRowTitle}>{title}</Text>
      <IconSymbol name="chevron-forward" size={18} color={providerColors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center"
  },
  loader: {
    marginTop: 40
  },
  errorText: {
    fontSize: 14,
    color: providerColors.dangerRed
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
    backgroundColor: "#F8FAFC"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    marginBottom: 4
  },
  headerLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A"
  },
  headerRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  mainCard: {
    backgroundColor: providerColors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  avatarWrap: {
    position: "relative"
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3B82F6"
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap"
  },
  badgeAvailable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    gap: 6
  },
  dotAvailable: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E"
  },
  badgeAvailableText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600"
  },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    gap: 6
  },
  badgeNotVerified: {
    backgroundColor: "#F1F5F9"
  },
  badgeVerifiedText: {
    fontSize: 11,
    color: "#1E40AF",
    fontWeight: "600"
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 20
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  completionLabel: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600"
  },
  progressBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden"
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#2563EB",
    borderRadius: 4
  },
  completionValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB"
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: providerColors.white,
    borderRadius: 16,
    padding: 8,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F8FAFC"
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  statTextWrap: {
    marginTop: 2
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A"
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  quickActionBtn: {
    flex: 1,
    minWidth: "48%",
    height: 52,
    borderRadius: 16,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F8FAFC"
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B"
  },
  card: {
    backgroundColor: providerColors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A"
  },
  linkText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600"
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569"
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  skillChip: {
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  skillChipText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600"
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8"
  },
  portfolioScroll: {
    gap: 12
  },
  portfolioItem: {
    width: 200,
    gap: 10
  },
  portfolioImg: {
    width: "100%",
    height: 120,
    borderRadius: 16
  },
  portfolioPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  portfolioInfo: {
    gap: 2
  },
  portfolioTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B"
  },
  portfolioCategory: {
    fontSize: 12,
    color: "#64748B"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B"
  },
  servicesList: {
    gap: 12
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center"
  },
  serviceInfo: {
    flex: 1,
    gap: 4
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A"
  },
  serviceDesc: {
    fontSize: 13,
    color: "#64748B"
  },
  servicePriceWrap: {
    alignItems: "flex-end",
    gap: 4
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16A34A"
  },
  settingsMenu: {
    backgroundColor: providerColors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    gap: 16
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  settingsRowTitle: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600"
  }
});
