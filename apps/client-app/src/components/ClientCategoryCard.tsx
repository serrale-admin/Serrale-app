import { StyleSheet, Text, View } from "react-native";

import { AppCard, colors, spacing, typography } from "@serrale/ui";

interface ClientCategoryCardProps {
  icon: string;
  title: string;
  subtitle: string;
}

export function ClientCategoryCard({ icon, title, subtitle }: ClientCategoryCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 156,
    gap: spacing.xs,
    padding: spacing.md
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight
  },
  icon: {
    fontSize: 16
  },
  title: {
    ...typography.label,
    color: colors.text
  },
  subtitle: {
    ...typography.label,
    color: colors.textMuted
  }
});
