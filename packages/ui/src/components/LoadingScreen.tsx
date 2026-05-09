import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

export interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.background
  },
  message: {
    ...typography.body,
    color: colors.textMuted
  }
});
