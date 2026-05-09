import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProfileAvatar, Rating, VerifiedBadge, colors, spacing, typography } from "@serrale/ui";

interface RecommendedProviderCardProps {
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  verified: boolean;
  avatarUrl?: string;
  buttonLabel: "View" | "Invite";
  onPressAction?: () => void;
}

export function RecommendedProviderCard({
  name,
  specialty,
  rating,
  reviews,
  verified,
  avatarUrl,
  buttonLabel,
  onPressAction
}: RecommendedProviderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <ProfileAvatar fullName={name} avatarUrl={avatarUrl} size={44} />
        {verified ? <VerifiedBadge /> : null}
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
      <Rating value={rating} reviews={reviews} />
      <Pressable style={styles.button} onPress={onPressAction}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  name: {
    ...typography.h3,
    color: colors.text
  },
  specialty: {
    ...typography.body,
    color: colors.textMuted
  },
  button: {
    marginTop: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    ...typography.label,
    color: colors.primaryDark
  }
});
