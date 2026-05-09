import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.lg
  },
  title: {
    ...typography.h2,
    color: colors.text
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted
  }
});
