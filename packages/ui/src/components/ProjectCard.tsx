import { StyleSheet, Text } from "react-native";

import { AppCard } from "./AppCard";
import { colors, spacing, typography } from "../theme";

export interface ProjectCardProps {
  title: string;
  description: string;
  status: string;
}

export function ProjectCard({ title, description, status }: ProjectCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.meta}>Status: {status}</Text>
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
