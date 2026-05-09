import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProfileAvatar, colors, spacing, typography } from "@serrale/ui";

interface ClientHomeHeaderProps {
  avatarUrl?: string;
  fullName: string;
  unreadCount: number;
  onPressNotifications?: () => void;
}

export function ClientHomeHeader({
  avatarUrl,
  fullName,
  unreadCount,
  onPressNotifications
}: ClientHomeHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.logo}>SERRALE</Text>
      <View style={styles.actions}>
        <Pressable onPress={onPressNotifications} style={styles.bell}>
          <Text style={styles.icon}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 99)}</Text>
            </View>
          ) : null}
        </Pressable>
        <ProfileAvatar fullName={fullName} avatarUrl={avatarUrl} size={38} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg
  },
  logo: {
    ...typography.h3,
    color: colors.primaryDark
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  bell: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.surfaceSoft
  },
  icon: {
    fontSize: 15
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: colors.danger
  },
  badgeText: {
    ...typography.label,
    color: colors.white
  }
});
