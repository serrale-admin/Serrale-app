import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@serrale/ui";

interface ClientProjectCardProps {
  title: string;
  category: string;
  status: string;
  proposalCount: number;
  onPress?: () => void;
}

export function ClientProjectCard({
  title,
  category,
  status,
  proposalCount,
  onPress
}: ClientProjectCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.dot} />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.status}>
          {status} • {proposalCount} proposals
        </Text>
      </View>
      <Text style={styles.chevron}>{">"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight
  },
  body: {
    flex: 1,
    gap: 2
  },
  title: {
    ...typography.h3,
    color: colors.text
  },
  category: {
    ...typography.body,
    color: colors.textMuted
  },
  status: {
    ...typography.label,
    color: colors.primary
  },
  chevron: {
    ...typography.h3,
    color: colors.textMuted
  }
});
