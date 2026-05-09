import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientSpacing, clientTypography } from "../theme";

interface CategoryCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  iconBg?: string;
}

export const CategoryCard = ({ title, subtitle, icon, onPress, iconBg }: CategoryCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg || clientColors.softBlue }]}>
        <Ionicons name={icon} size={24} color={clientColors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={clientTypography.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={clientTypography.caption} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: clientColors.white,
    borderRadius: clientRadius.large,
    padding: clientSpacing.md,
    flexDirection: "row",
    alignItems: "center",
    ...clientShadows.card,
    flex: 1,
    minWidth: "45%",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: clientRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    marginRight: clientSpacing.sm,
  },
  textContainer: {
    flex: 1,
  },
});
