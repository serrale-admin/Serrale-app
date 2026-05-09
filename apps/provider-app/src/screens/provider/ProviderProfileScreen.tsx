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
              <IconSymbol name="camera" size={16} color={providerColors.blue} />
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
              <View style={[styles.badgeVerified, !isVerified && styles.badgeNotVerified]}>
                <IconSymbol 
                  name={isVerified ? "shield-checkmark" : "shield-outline"} 
                  size={14} 
                  color={isVerified ? providerColors.blue : providerColors.muted} 
                />
                <Text style={[styles.badgeVerifiedText, !isVerified && { color: providerColors.muted }]}>Identity verified</Text>
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
          <IconSymbol name="chevron-forward" size={16} color={providerColors.muted} />
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
    paddingTop: 12,
    paddingBottom: 80,
    backgroundColor: "#F8FAFC"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginBottom: 12
  },
  headerLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center",
    ...providerShadows.card
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: providerColors.navy
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center",
    ...providerShadows.card
  },
  mainCard: {
    backgroundColor: providerColors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
    ...providerShadows.card
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
    width: 84,
    height: 84,
    borderRadius: 42
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0284C7"
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
    ...providerShadows.card
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: providerColors.navy,
    marginBottom: 2
  },
  profileSubtitle: {
    fontSize: 14,
    color: providerColors.muted,
    marginBottom: 6
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  badgeAvailable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 13,
    gap: 4
  },
  dotAvailable: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981"
  },
  badgeAvailableText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600"
  },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 13,
    gap: 4
  },
  badgeNotVerified: {
    backgroundColor: "#F1F5F9"
  },
  badgeVerifiedText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600"
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  completionLabel: {
    fontSize: 13,
    color: providerColors.navy,
    fontWeight: "600"
  },
  progressBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden"
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#2563EB",
    borderRadius: 3
  },
  completionValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB"
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: providerColors.white,
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...providerShadows.card
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  statTextWrap: {
    flex: 1
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: providerColors.navy
  },
  statLabel: {
    fontSize: 10,
    color: providerColors.muted,
    marginTop: 1
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: providerColors.navy,
    marginBottom: 12
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  quickActionBtn: {
    flex: 1,
    minWidth: "45%",
    height: 48,
    borderRadius: 12,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
    ...providerShadows.card
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: providerColors.navy
  },
  card: {
    backgroundColor: providerColors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
    ...providerShadows.card
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
    color: providerColors.navy
  },
  linkText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600"
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569"
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  skillChip: {
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    justifyContent: "center"
  },
  skillChipText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600"
  },
  emptyText: {
    fontSize: 13,
    color: providerColors.muted
  },
  portfolioScroll: {
    gap: 12
  },
  portfolioItem: {
    width: 160,
    gap: 8
  },
  portfolioImg: {
    width: "100%",
    height: 100,
    borderRadius: 12
  },
  portfolioPlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  portfolioInfo: {
    gap: 2
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.navy
  },
  portfolioCategory: {
    fontSize: 12,
    color: providerColors.muted
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: providerColors.navy
  },
  servicesList: {
    gap: 12
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center"
  },
  serviceInfo: {
    flex: 1,
    gap: 2
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: providerColors.navy
  },
  serviceDesc: {
    fontSize: 12,
    color: providerColors.muted
  },
  servicePriceWrap: {
    alignItems: "flex-end",
    gap: 2
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669"
  },
  settingsMenu: {
    backgroundColor: providerColors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
    ...providerShadows.card
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    gap: 12
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  settingsRowTitle: {
    flex: 1,
    fontSize: 15,
    color: providerColors.navy,
    fontWeight: "600"
  }
});
