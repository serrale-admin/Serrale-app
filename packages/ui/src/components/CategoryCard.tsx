import { StyleSheet, Text } from "react-native";

import { AppCard } from "./AppCard";
import { colors, spacing, typography } from "../theme";

export interface CategoryCardProps {
  name: string;
  description?: string;
}

export function CategoryCard({ name, description }: CategoryCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{name}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs
  },
  title: {
    ...typography.h3,
    color: colors.text
  },
  description: {
    ...typography.body,
    color: colors.textMuted
  }
});
