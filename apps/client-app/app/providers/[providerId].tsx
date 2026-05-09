import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createConversation, getProviderById } from "@serrale/api";
import {
  AppButton,
  LoadingScreen,
  ProviderCard,
  colors,
  spacing,
  typography
} from "@serrale/ui";
import { StyleSheet, Text, View } from "react-native";

export default function ProviderDetailsScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const providerQuery = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () => getProviderById(providerId),
    enabled: Boolean(providerId)
  });

  const startConversation = useMutation({
    mutationFn: () => createConversation(providerId),
    onSuccess: () => router.push("/tabs/messages")
  });

  if (providerQuery.isPending) {
    return <LoadingScreen message="Loading provider profile..." />;
  }

  if (!providerQuery.data) {
    return (
      <View style={styles.screen}>
        <Text style={styles.error}>Provider not found.</Text>
      </View>
    );
  }

  const provider = providerQuery.data;

  return (
    <View style={styles.screen}>
      <ProviderCard
        id={provider.id}
        fullName={provider.full_name}
        title={provider.title}
        avatarUrl={provider.avatar_url}
        rating={provider.rating}
        reviewCount={provider.review_count}
        verified={provider.is_verified}
      />
      <Text style={styles.bio}>{provider.bio || "Trusted verified expert on SERRALE."}</Text>
      <AppButton
        label={startConversation.isPending ? "Starting..." : "Message Provider"}
        onPress={() => startConversation.mutate()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md
  },
  bio: {
    ...typography.body,
    color: colors.textMuted
  },
  error: {
    ...typography.body,
    color: colors.danger
  }
});
