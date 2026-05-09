import { Image, StyleSheet, Text, View } from "react-native";

import { colors, radius, typography } from "../theme";

export interface ProfileAvatarProps {
  fullName: string;
  avatarUrl?: string;
  size?: number;
}

export function ProfileAvatar({ fullName, avatarUrl, size = 44 }: ProfileAvatarProps) {
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceSoft
        }}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight
  },
  initials: {
    ...typography.label,
    color: colors.primaryDark
  }
});
