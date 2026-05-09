import { AppCard, colors, spacing, typography } from "@serrale/ui";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileSettingsScreen() {
  return (
    <View style={styles.screen}>
      <AppCard style={styles.card}>
        <Text style={styles.title}>Profile Settings</Text>
        <Text style={styles.body}>
          Manage your account profile, notifications, and payment preferences.
        </Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg
  },
  card: {
    gap: spacing.sm
  },
  title: {
    ...typography.h2,
    color: colors.primaryDark
  },
  body: {
    ...typography.body,
    color: colors.textMuted
  }
});
