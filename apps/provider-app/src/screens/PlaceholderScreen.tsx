import { AppCard, colors, spacing, typography } from "@serrale/ui";
import { StyleSheet, Text, View } from "react-native";

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
}

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <AppCard style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
  subtitle: {
    ...typography.body,
    color: colors.textMuted
  }
});
