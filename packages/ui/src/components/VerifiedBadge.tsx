import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

export function VerifiedBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  text: {
    ...typography.label,
    color: colors.white
  }
});
