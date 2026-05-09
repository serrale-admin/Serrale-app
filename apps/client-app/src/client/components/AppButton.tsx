import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { clientColors, clientRadius, clientShadows, clientTypography } from "../theme";
import { Ionicons } from "@expo/vector-icons";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "soft" | "outline";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AppButton = ({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  full = true,
  style,
}: AppButtonProps) => {
  const isSecondary = variant === "secondary";
  const isSoft = variant === "soft";
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        full && styles.full,
        variant === "primary" && styles.primary,
        isSecondary && styles.secondary,
        isSoft && styles.soft,
        isOutline && styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary || isOutline || isSoft ? clientColors.primary : clientColors.white} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isSecondary || isOutline || isSoft ? clientColors.primary : clientColors.white}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              clientTypography.button,
              (isSecondary || isOutline || isSoft) && styles.secondaryText,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: clientRadius.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  full: {
    width: "100%",
  },
  primary: {
    backgroundColor: clientColors.primary,
    ...clientShadows.button,
  },
  secondary: {
    backgroundColor: clientColors.white,
    borderWidth: 1,
    borderColor: clientColors.border,
  },
  soft: {
    backgroundColor: clientColors.softBlue,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: clientColors.primary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  secondaryText: {
    color: clientColors.primary,
  },
  icon: {
    marginRight: 10,
  },
});
