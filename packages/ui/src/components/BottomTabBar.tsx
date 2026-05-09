import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../theme";

export interface BottomTabItem {
  key: string;
  label: string;
  active?: boolean;
  centerAction?: boolean;
  onPress?: () => void;
}

export interface BottomTabBarProps {
  items: BottomTabItem[];
}

export function BottomTabBar({ items }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={[styles.item, item.centerAction ? styles.centerItem : null]}
        >
          {item.centerAction ? <View style={styles.plusDot}><Text style={styles.plusText}>+</Text></View> : null}
          <Text style={[styles.label, item.active ? styles.activeLabel : null]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    ...shadows.soft
  },
  item: {
    minWidth: 56,
    alignItems: "center",
    gap: 2
  },
  centerItem: {
    marginTop: -16
  },
  plusDot: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  plusText: {
    ...typography.h3,
    color: colors.white
  },
  label: {
    ...typography.label,
    color: colors.textMuted
  },
  activeLabel: {
    color: colors.primary
  }
});
