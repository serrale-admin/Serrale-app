import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "@serrale/ui";

interface SearchFilterBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onPressFilter?: () => void;
}

export function SearchFilterBar({ value, onChangeText, onPressFilter }: SearchFilterBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.searchPill}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search services or experts..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </View>
      <Pressable style={styles.filterButton} onPress={onPressFilter}>
        <Text style={styles.filterIcon}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  searchPill: {
    flex: 1,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  searchIcon: {
    fontSize: 16
  },
  input: {
    flex: 1,
    color: colors.text,
    ...typography.body
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  filterIcon: {
    fontSize: 16
  }
});
