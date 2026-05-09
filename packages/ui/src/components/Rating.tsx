import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

export interface RatingProps {
  value?: number;
  reviews?: number;
}

export function Rating({ value = 0, reviews = 0 }: RatingProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.value}>{"★"} {value.toFixed(1)}</Text>
      <Text style={styles.meta}>({reviews})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  value: {
    ...typography.label,
    color: colors.warning
  },
  meta: {
    ...typography.label,
    color: colors.textMuted
  }
});
