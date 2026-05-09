import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getProviders } from "@serrale/api";
import { LoadingScreen, ProviderCard, colors, spacing, typography } from "@serrale/ui";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function ProviderListScreen() {
  const router = useRouter();
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders
  });

  if (providersQuery.isPending) {
    return <LoadingScreen message="Loading providers..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Search Providers</Text>
      {(providersQuery.data ?? []).map((provider) => (
        <Pressable
          key={provider.id}
          onPress={() => router.push(`/providers/${provider.id}`)}
        >
          <ProviderCard
            id={provider.id}
            fullName={provider.full_name}
            title={provider.title}
            avatarUrl={provider.avatar_url}
            rating={provider.rating}
            reviewCount={provider.review_count}
            verified={provider.is_verified}
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background
  },
  title: {
    ...typography.h2,
    color: colors.primaryDark
  }
});
