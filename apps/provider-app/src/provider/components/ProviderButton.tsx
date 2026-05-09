import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps
} from "react-native";

import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../theme";
import { IconSymbol, type IconName } from "./IconSymbol";

type ProviderButtonVariant = "primary" | "secondary" | "soft" | "danger";

interface ProviderButtonProps extends PressableProps {
  label: string;
  variant?: ProviderButtonVariant;
  full?: boolean;
  icon?: IconName;
}

const variantStyles: Record<ProviderButtonVariant, { backgroundColor: string; color: string; borderColor?: string }> = {
  primary: {
    backgroundColor: providerColors.blue,
    color: providerColors.white
  },
  secondary: {
    backgroundColor: providerColors.white,
    color: providerColors.blue,
    borderColor: providerColors.border
  },
  soft: {
    backgroundColor: providerColors.sky,
    color: providerColors.blue
  },
  danger: {
    backgroundColor: providerColors.dangerRed,
    color: providerColors.white
  }
};

export function ProviderButton({
  label,
  variant = "primary",
  full = true,
  icon,
  style,
  disabled,
  ...props
}: ProviderButtonProps) {
  const selected = variantStyles[variant];

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          width: full ? "100%" : undefined,
          backgroundColor: disabled ? "#A8C2EC" : selected.backgroundColor,
          borderColor: selected.borderColor,
          borderWidth: selected.borderColor ? 1.5 : 0,
          opacity: pressed ? 0.92 : 1
        },
        variant === "primary" && !disabled ? providerShadows.button : null,
        style
      ]}
      {...props}
    >
      <View style={styles.content}>
        {icon ? <IconSymbol name={icon} size={17} color={selected.color} /> : null}
        <Text style={[styles.label, { color: selected.color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: providerRadius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: providerSpacing.lg
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: providerSpacing.sm
  },
  label: {
    ...providerTypography.title
  }
});
