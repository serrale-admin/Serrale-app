import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientTypography } from "../theme";
import { useTranslation } from "../i18n";

export type ClientTabKey = "home" | "categories" | "post" | "messages" | "profile";

interface BottomTabBarProps {
  activeKey: ClientTabKey;
  onSelect: (key: ClientTabKey) => void;
}

export const BottomTabBar = ({ activeKey, onSelect }: BottomTabBarProps) => {
  const { t } = useTranslation();

  const tabs: { key: ClientTabKey; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { key: "home", icon: "home-outline", label: t("home") },
    { key: "categories", icon: "grid-outline", label: t("categories") },
    { key: "post", icon: "add", label: t("post") },
    { key: "messages", icon: "chatbubble-outline", label: t("messages") },
    { key: "profile", icon: "person-outline", label: t("profile") },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          const isPost = tab.key === "post";

          if (isPost) {
            return (
              <Pressable
                key={tab.key}
                onPress={() => onSelect(tab.key)}
                style={styles.postButtonContainer}
              >
                <View style={styles.postButton}>
                  <Ionicons name="add" size={32} color={clientColors.white} />
                </View>
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.key}
              onPress={() => onSelect(tab.key)}
              style={styles.tab}
            >
              <Ionicons
                name={isActive ? (tab.icon.replace("-outline", "") as any) : tab.icon}
                size={24}
                color={isActive ? clientColors.primary : clientColors.muted}
              />
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: clientColors.white,
    height: 90,
    borderTopWidth: 1,
    borderTopColor: clientColors.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    ...clientShadows.card,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    flex: 1,
  },
  postButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: clientColors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...clientShadows.button,
    marginBottom: 4,
  },
  label: {
    ...clientTypography.caption,
    fontSize: 11,
    color: clientColors.muted,
    marginTop: 4,
  },
  activeLabel: {
    color: clientColors.primary,
    fontWeight: "700",
  },
});
