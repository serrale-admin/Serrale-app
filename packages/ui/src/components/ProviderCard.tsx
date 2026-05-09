import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "./AppCard";
import { ProfileAvatar } from "./ProfileAvatar";
import { Rating } from "./Rating";
import { VerifiedBadge } from "./VerifiedBadge";
import { colors, spacing, typography } from "../theme";

export interface ProviderCardProps {
  id: string;
  fullName: string;
  title?: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
}

export function ProviderCard({
  fullName,
  title,
  avatarUrl,
  rating,
  reviewCount,
  verified
}: ProviderCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <ProfileAvatar fullName={fullName} avatarUrl={avatarUrl} />
        <View style={styles.body}>
          <Text style={styles.name}>{fullName}</Text>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Rating value={rating} reviews={reviewCount} />
        </View>
      </View>
      {verified ? <VerifiedBadge /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  },
  body: {
    flex: 1,
    gap: spacing.xs
  },
  name: {
    ...typography.h3,
    color: colors.text
  },
  title: {
    ...typography.body,
    color: colors.textMuted
  }
});
