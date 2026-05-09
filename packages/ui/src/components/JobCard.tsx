import { StyleSheet, Text } from "react-native";

import { AppCard } from "./AppCard";
import { colors, spacing, typography } from "../theme";

export interface JobCardProps {
  title: string;
  description: string;
  budgetLabel?: string;
}

export function JobCard({ title, description, budgetLabel }: JobCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {budgetLabel ? <Text style={styles.meta}>{budgetLabel}</Text> : null}
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
  },
  meta: {
    ...typography.label,
    color: colors.primary
  }
});
