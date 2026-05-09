import { StyleSheet, Text } from "react-native";

import { AppCard } from "./AppCard";
import { colors, spacing, typography } from "../theme";

export interface ProposalCardProps {
  title: string;
  status: string;
  amountLabel?: string;
}

export function ProposalCard({ title, status, amountLabel }: ProposalCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>Status: {status}</Text>
      {amountLabel ? <Text style={styles.amount}>{amountLabel}</Text> : null}
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
  meta: {
    ...typography.body,
    color: colors.textMuted
  },
  amount: {
    ...typography.label,
    color: colors.primary
  }
});
