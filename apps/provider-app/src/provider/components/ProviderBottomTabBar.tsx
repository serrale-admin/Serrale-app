import { Pressable, StyleSheet, Text, View } from "react-native";

import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../theme";
import { IconSymbol } from "./IconSymbol";

export type ProviderTabKey = "home" | "jobs" | "proposals" | "messages" | "profile";

interface ProviderBottomTabBarProps {
  activeKey: ProviderTabKey;
  onSelect: (key: ProviderTabKey) => void;
}

const tabItems: Array<{
  key: ProviderTabKey;
  label: string;
  icon: "home-outline" | "briefcase-outline" | "document-text-outline" | "chatbubble-ellipses-outline" | "person-outline";
  badge?: number;
}> = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "jobs", label: "Jobs", icon: "briefcase-outline" },
  { key: "proposals", label: "Proposals", icon: "document-text-outline", badge: 4 },
  { key: "messages", label: "Messages", icon: "chatbubble-ellipses-outline", badge: 3 },
  { key: "profile", label: "Profile", icon: "person-outline" }
];

export function ProviderBottomTabBar({ activeKey, onSelect }: ProviderBottomTabBarProps) {
  return (
    <View style={styles.container}>
      {tabItems.map((item) => {
        const active = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={styles.item}
          >
            <View style={styles.iconWrap}>
              <IconSymbol
                name={item.icon}
                size={22}
                color={active ? providerColors.blue : "#8A99AD"}
              />
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, active ? styles.activeLabel : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    minHeight: 84,
    borderTopWidth: 1,
    borderTopColor: providerColors.border,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingTop: providerSpacing.sm,
    paddingBottom: providerSpacing.xl,
    ...providerShadows.card
  },
  item: {
    minWidth: 54,
    alignItems: "center",
    gap: providerSpacing.xxs
  },
  iconWrap: {
    position: "relative",
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: providerRadius.full,
    backgroundColor: providerColors.dangerRed,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: providerColors.white
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: providerColors.white
  },
  label: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  activeLabel: {
    color: providerColors.blue
  }
});
