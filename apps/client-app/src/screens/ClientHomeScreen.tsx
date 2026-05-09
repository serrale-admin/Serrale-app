import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@serrale/ui";

import { ClientCategoryCard } from "../components/ClientCategoryCard";
import { ClientHomeHeader } from "../components/ClientHomeHeader";
import { ClientProjectCard } from "../components/ClientProjectCard";
import { CommunityHeroBanner } from "../components/CommunityHeroBanner";
import { PostProjectCTA } from "../components/PostProjectCTA";
import { RecommendedProviderCard } from "../components/RecommendedProviderCard";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { useClientHomeData } from "../hooks/useClientHomeData";

function firstName(value?: string) {
  if (!value) {
    return "Nati";
  }

  const [first] = value.split(" ");
  return first || "Nati";
}

export function ClientHomeScreen() {
  const [search, setSearch] = useState("");
  const homeQuery = useClientHomeData();

  const name = useMemo(() => firstName(homeQuery.data?.user.full_name), [homeQuery.data?.user.full_name]);
  const categories = homeQuery.data?.featured_categories ?? [];
  const providers = homeQuery.data?.recommended_providers ?? [];
  const recentProject = homeQuery.data?.recent_project;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ClientHomeHeader
          fullName={homeQuery.data?.user.full_name ?? "Nati"}
          avatarUrl={homeQuery.data?.user.avatar_url}
          unreadCount={homeQuery.data?.unread_notifications_count ?? 0}
        />

        <Text style={styles.greeting}>Hello, {name}</Text>
        <Text style={styles.subheading}>Find trusted experts for your next project</Text>

        <SearchFilterBar value={search} onChangeText={setSearch} />
        <CommunityHeroBanner />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <Text style={styles.sectionLink}>View More</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {categories.slice(0, 4).map((category) => (
            <ClientCategoryCard
              key={category.id}
              icon={category.icon || "⭐"}
              title={category.name}
              subtitle={category.subtitle}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Providers</Text>
          <Text style={styles.sectionLink}>View More</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {providers.slice(0, 3).map((provider) => (
            <RecommendedProviderCard
              key={provider.id}
              name={provider.full_name}
              specialty={provider.specialty}
              rating={provider.rating}
              reviews={provider.review_count}
              verified={provider.is_verified}
              avatarUrl={provider.avatar_url}
              buttonLabel={recentProject ? "Invite" : "View"}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Projects</Text>
          <Text style={styles.sectionLink}>View All</Text>
        </View>
        {recentProject ? (
          <ClientProjectCard
            title={recentProject.title}
            category={recentProject.category}
            status={recentProject.status}
            proposalCount={recentProject.proposal_count}
          />
        ) : (
          <View style={styles.emptyProjectCard}>
            <Text style={styles.emptyProjectText}>No active project yet.</Text>
          </View>
        )}

        <PostProjectCTA />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.md
  },
  greeting: {
    ...typography.h1,
    color: colors.primaryDark
  },
  subheading: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text
  },
  sectionLink: {
    ...typography.label,
    color: colors.primary
  },
  horizontalRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm
  },
  emptyProjectCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  emptyProjectText: {
    ...typography.body,
    color: colors.textMuted
  }
});
