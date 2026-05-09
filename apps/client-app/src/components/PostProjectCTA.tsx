import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@serrale/ui";

interface PostProjectCTAProps {
  onPress?: () => void;
}

export function PostProjectCTA({ onPress }: PostProjectCTAProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>Post your project and get matched</Text>
        <Text style={styles.body}>
          Tell us what you need. We&apos;ll connect you with verified experts.
        </Text>
      </View>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Post a Project</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xxl
  },
  content: {
    gap: spacing.xs
  },
  title: {
    ...typography.h3,
    color: colors.primaryDark
  },
  body: {
    ...typography.body,
    color: colors.text
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  buttonText: {
    ...typography.label,
    color: colors.white
  }
});
