import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientSpacing, clientTypography } from "../theme";

interface ProjectCardProps {
  title: string;
  category: string;
  status: string;
  proposalsCount: number;
  updatedAt: string;
  onPress: () => void;
}

export const ProjectCard = ({
  title,
  category,
  status,
  proposalsCount,
  updatedAt,
  onPress,
}: ProjectCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.content}>
          <Text style={clientTypography.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={clientTypography.caption}>{category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={clientColors.light} />
      </View>
      
      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>
            {status} • {proposalsCount} proposals
          </Text>
        </View>
        <Text style={styles.footerText}>Updated {updatedAt}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: clientColors.white,
    borderRadius: clientRadius.card,
    padding: clientSpacing.md,
    ...clientShadows.card,
    marginBottom: clientSpacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: clientSpacing.md,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: clientSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: clientColors.border,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: clientColors.success,
    marginRight: 6,
  },
  footerText: {
    ...clientTypography.caption,
    color: clientColors.muted,
  },
});
