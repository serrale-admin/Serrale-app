import { Pressable, StyleSheet, Text, View } from "react-native";

import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../theme";
import { IconSymbol } from "./IconSymbol";

interface ProviderHeaderProps {
  title?: string;
  subtitle?: string;
  unread?: number;
  showNotification?: boolean;
  rightLabel?: string;
}

export function ProviderHeader({
  title,
  subtitle,
  unread = 0,
  showNotification = false,
  rightLabel
}: ProviderHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        {title ? <Text style={styles.title}>{title}</Text> : <Text style={styles.brand}>SERRALE</Text>}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showNotification ? (
        <Pressable style={styles.notifButton}>
          <IconSymbol name="notifications-outline" size={18} color={providerColors.title} />
          {unread > 0 ? (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unread}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
      {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50
  },
  titleBlock: {
    gap: providerSpacing.xxs
  },
  brand: {
    ...providerTypography.h3,
    color: providerColors.navy,
    letterSpacing: 0.6
  },
  title: {
    ...providerTypography.h1,
    color: providerColors.navy,
    letterSpacing: -0.6
  },
  subtitle: {
    ...providerTypography.body,
    color: providerColors.body
  },
  rightLabel: {
    ...providerTypography.label,
    color: providerColors.blue
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: providerColors.white,
    ...providerShadows.card
  },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: providerColors.dangerRed
  },
  notifBadgeText: {
    color: providerColors.white,
    fontSize: 9,
    fontWeight: "800"
  }
});
