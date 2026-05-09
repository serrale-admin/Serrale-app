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
              <IconSymbol name="camera-outline" size={16} color={providerColors.blue} />
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{fullName}</Text>
            {profile?.title && (
              <Text style={styles.profileSubtitle} numberOfLines={1}>{title}</Text>
            )}
            {(profile as any)?.location && (
              <Text style={styles.profileLocation} numberOfLines={1}>{(profile as any).location}</Text>
            )}
            <View style={styles.badgesRow}>
              <View style={styles.badgeAvailable}>
                <View style={styles.dotAvailable} />
                <Text style={styles.badgeAvailableText}>Available for work</Text>
              </View>
              <View style={[styles.badgeVerified, !isVerified && styles.badgeNotVerified]}>
                <IconSymbol 
                  name={isVerified ? "shield-checkmark" : (verificationStatus === "Pending review" ? "time-outline" : "shield-outline")} 
                  size={14} 
                  color={isVerified ? providerColors.blue : providerColors.muted} 
                />
                <Text style={[styles.badgeVerifiedText, !isVerified && { color: providerColors.muted }]}>{verificationStatus}</Text>
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
        <StatCard label="Portfolio" value={portfolio?.length || 0} icon="folder-outline" />
        <StatCard label="Services" value={services?.length || 0} icon="layers-outline" />
        <StatCard label="Skills" value={skills?.length || 0} icon="document-text-outline" />
        <StatCard label="Reviews" value={reviews?.length || profile?.review_count || 0} icon="star-outline" />
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

function StatCard({ label, value, icon }: { label: string; value: number; icon: any }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>
        <IconSymbol name={icon} size={20} color={providerColors.blue} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    backgroundColor: providerColors.appBg,
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
    backgroundColor: providerColors.appBg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    marginBottom: 8
  },
  headerLeft: {
    width: 40,
    height: 40
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: providerColors.navy
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  mainCard: {
    backgroundColor: providerColors.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: providerColors.border,
    marginBottom: 10,
    marginTop: 2,
    ...providerShadows.card
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatarWrap: {
    position: "relative"
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "700",
    color: providerColors.blue
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    alignItems: "center",
    justifyContent: "center",
    ...providerShadows.card
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: providerColors.navy,
    marginBottom: 2
  },
  profileSubtitle: {
    fontSize: 13,
    color: providerColors.muted,
    marginBottom: 2
  },
  profileLocation: {
    fontSize: 12,
    color: providerColors.muted,
    marginBottom: 4
  },
  badgesRow: {
    gap: 4,
    alignItems: "flex-start",
    marginTop: 4
  },
  badgeAvailable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: providerColors.successSoft,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.15)",
    alignSelf: "flex-start"
  },
  dotAvailable: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: providerColors.successGreen
  },
  badgeAvailableText: {
    fontSize: 11,
    color: providerColors.successGreen,
    fontWeight: "500"
  },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: providerColors.sky,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    gap: 4,
    alignSelf: "flex-start"
  },
  badgeNotVerified: {
    backgroundColor: providerColors.softCard
  },
  badgeVerifiedText: {
    fontSize: 11,
    color: providerColors.blue,
    fontWeight: "500"
  },
  divider: {
    height: 1,
    backgroundColor: providerColors.border,
    marginVertical: 12
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  completionLabel: {
    fontSize: 11,
    color: providerColors.navy,
    fontWeight: "600"
  },
  progressBarWrap: {
    flex: 1,
    height: 4,
    backgroundColor: providerColors.softCard,
    borderRadius: 2,
    overflow: "hidden"
  },
  progressBarFill: {
    height: 4,
    backgroundColor: providerColors.blue,
    borderRadius: 2
  },
  completionValue: {
    fontSize: 12,
    fontWeight: "700",
    color: providerColors.navy
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    height: 52,
    borderRadius: 10,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    padding: 8,
    gap: 2,
    ...providerShadows.card
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: providerColors.navy
  },
  statLabel: {
    fontSize: 11,
    color: providerColors.muted
  },
  section: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: providerColors.navy,
    marginBottom: 6
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  quickActionBtn: {
    flex: 1,
    minWidth: "45%",
    height: 40,
    borderRadius: 10,
    backgroundColor: providerColors.white,
    borderWidth: 1,
    borderColor: providerColors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 6
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: providerColors.navy
  },
  card: {
    backgroundColor: providerColors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: providerColors.border,
    marginBottom: 12,
    ...providerShadows.card
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: providerColors.navy
  },
  linkText: {
    fontSize: 12,
    color: providerColors.blue,
    fontWeight: "500"
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
    color: providerColors.body
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  skillChip: {
    height: 28,
    borderRadius: 14,
    backgroundColor: providerColors.sky,
    paddingHorizontal: 10,
    justifyContent: "center"
  },
  skillChipText: {
    fontSize: 12,
    color: providerColors.blue,
    fontWeight: "500"
  },
  emptyText: {
    fontSize: 12,
    color: providerColors.muted
  },
  portfolioScroll: {
    gap: 8
  },
  portfolioItem: {
    width: 120,
    gap: 6
  },
  portfolioImg: {
    width: "100%",
    height: 80,
    borderRadius: 10
  },
  portfolioPlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    backgroundColor: providerColors.softCard,
    alignItems: "center",
    justifyContent: "center"
  },
  portfolioInfo: {
    gap: 2
  },
  portfolioTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: providerColors.navy
  },
  portfolioCategory: {
    fontSize: 11,
    color: providerColors.muted
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 8
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.navy
  },
  servicesList: {
    gap: 8
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  serviceInfo: {
    flex: 1,
    gap: 2
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: providerColors.navy
  },
  serviceDesc: {
    fontSize: 11,
    color: providerColors.muted
  },
  servicePriceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: providerColors.navy
  },
  settingsMenu: {
    backgroundColor: providerColors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: providerColors.border,
    marginBottom: 12,
    ...providerShadows.card
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    gap: 8
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: providerColors.border
  },
  settingsRowTitle: {
    flex: 1,
    fontSize: 14,
    color: providerColors.navy,
    fontWeight: "500"
  }
});
