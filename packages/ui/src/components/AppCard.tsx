import { StyleSheet, View, type ViewProps } from "react-native";

import { colors, radius, shadows, spacing } from "../theme";

export function AppCard({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...shadows.soft
  }
});
