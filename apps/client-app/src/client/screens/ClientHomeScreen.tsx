import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientSpacing, clientTypography } from "../theme";
import { useTranslation } from "../i18n";
import { CategoryCard } from "../components/CategoryCard";
import { ProviderCard } from "../components/ProviderCard";
import { ProjectCard } from "../components/ProjectCard";
import { AppButton } from "../components/AppButton";

export const ClientHomeScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const categories = [
    { title: "Design", subtitle: "Branding, UI/UX", icon: "brush-outline", bg: "#E9F5FF" },
    { title: "Development", subtitle: "Web, Mobile", icon: "code-slash-outline", bg: "#F2EAFF" },
    { title: "Home Services", subtitle: "Cleaning, Repairs", icon: "home-outline", bg: "#E7FAF6" },
    { title: "Marketing", subtitle: "Social, SEO", icon: "megaphone-outline", bg: "#FFF4E2" },
  ];

  const recommendedProviders = [
    {
      id: "1",
      name: "Liya Mengesha",
      specialty: "Interior Designer",
      rating: 4.9,
      location: "Addis Ababa",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liya",
    },
    {
      id: "2",
      name: "Samuel G.",
      specialty: "Full Stack Developer",
      rating: 4.8,
      location: "Bole, Addis",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel",
    },
  ];

  const recentProjects = [
    {
      id: "101",
      title: "Website Redesign for Coffee Brand",
      category: "UI/UX Design",
      status: "Open",
      proposalsCount: 8,
      updatedAt: "today",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>S</Text>
          </View>
          <Text style={styles.brandName}>SERRALE</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={clientColors.navy} />
            <View style={styles.badge} />
          </Pressable>
          <Pressable onPress={() => router.push("/tabs/profile")}>
            <Image
              source={{ uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nati" }}
              style={styles.avatar}
            />
          </Pressable>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.section}>
        <Text style={clientTypography.h1}>{t("hello")}, Nati</Text>
        <Text style={clientTypography.body}>{t("find_experts")}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={clientColors.light} />
          <TextInput
            placeholder={t("search_placeholder")}
            style={styles.searchInput}
            placeholderTextColor={clientColors.light}
          />
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={clientColors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTag}>COMMUNITY</Text>
          <Text style={styles.heroTitle}>{t("hero_title")}</Text>
          <Text style={styles.heroSubtitle}>{t("hero_subtitle")}</Text>
          <AppButton
            label={t("post_project")}
            onPress={() => router.push("/projects/create")}
            variant="secondary"
            style={styles.heroButton}
            full={false}
          />
        </View>
      </View>

      {/* Popular Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={clientTypography.h2}>{t("popular_categories")}</Text>
          <Pressable onPress={() => router.push("/tabs/categories")}>
            <Text style={styles.viewMore}>{t("view_more")}</Text>
          </Pressable>
        </View>
        <View style={styles.categoryGrid}>
          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              title={cat.title}
              subtitle={cat.subtitle}
              icon={cat.icon as any}
              onPress={() => {}}
              iconBg={cat.bg}
            />
          ))}
        </View>
      </View>

      {/* Recommended Providers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={clientTypography.h2}>{t("recommended_providers")}</Text>
          <Text style={styles.viewMore}>{t("view_more")}</Text>
        </View>
        {recommendedProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            {...provider}
            onViewProfile={() => {}}
          />
        ))}
      </View>

      {/* Your Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={clientTypography.h2}>{t("your_projects")}</Text>
          <Text style={styles.viewMore}>{t("view_all")}</Text>
        </View>
        {recentProjects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            onPress={() => {}}
          />
        ))}
      </View>

      {/* Post CTA Card */}
      <View style={styles.postCtaCard}>
        <View style={styles.postCtaContent}>
          <Text style={styles.postCtaTitle}>Post your project and get matched</Text>
          <Text style={styles.postCtaBody}>Tell us what you need. We’ll connect you with verified experts.</Text>
          <AppButton
            label={t("post_project")}
            onPress={() => router.push("/projects/create")}
            style={styles.postCtaButton}
          />
        </View>
      </View>
      
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clientColors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: clientSpacing.screenPadding,
    paddingTop: 60,
    marginBottom: clientSpacing.xl,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    backgroundColor: clientColors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    color: clientColors.white,
    fontWeight: "900",
    fontSize: 20,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: clientColors.navy,
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: clientColors.danger,
    borderWidth: 2,
    borderColor: clientColors.white,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: clientColors.softBlue,
  },
  section: {
    paddingHorizontal: clientSpacing.screenPadding,
    marginBottom: clientSpacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: clientSpacing.md,
  },
  viewMore: {
    ...clientTypography.label,
    color: clientColors.primary,
  },
  searchContainer: {
    paddingHorizontal: clientSpacing.screenPadding,
    marginBottom: clientSpacing.xl,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: clientColors.white,
    borderRadius: clientRadius.pill,
    paddingHorizontal: clientSpacing.md,
    height: 56,
    ...clientShadows.card,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    ...clientTypography.body,
  },
  filterButton: {
    padding: 8,
  },
  heroBanner: {
    marginHorizontal: clientSpacing.screenPadding,
    backgroundColor: clientColors.primaryDark,
    borderRadius: clientRadius.hero,
    padding: clientSpacing.xl,
    marginBottom: clientSpacing.xxl,
    ...clientShadows.elevated,
  },
  heroContent: {
    gap: 8,
  },
  heroTag: {
    ...clientTypography.caption,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
  },
  heroTitle: {
    ...clientTypography.h2,
    color: clientColors.white,
    fontSize: 22,
  },
  heroSubtitle: {
    ...clientTypography.body,
    color: "rgba(255,255,255,0.8)",
  },
  heroButton: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 20,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: clientSpacing.md,
  },
  postCtaCard: {
    marginHorizontal: clientSpacing.screenPadding,
    backgroundColor: clientColors.softBlue,
    borderRadius: clientRadius.card,
    padding: clientSpacing.xl,
    marginBottom: clientSpacing.xl,
  },
  postCtaContent: {
    alignItems: "center",
    gap: 8,
  },
  postCtaTitle: {
    ...clientTypography.h3,
    textAlign: "center",
  },
  postCtaBody: {
    ...clientTypography.body,
    textAlign: "center",
    color: clientColors.muted,
  },
  postCtaButton: {
    marginTop: 16,
  },
});
