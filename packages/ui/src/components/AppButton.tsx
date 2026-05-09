import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type AppButtonVariant = "primary" | "secondary" | "danger";

export interface AppButtonProps extends PressableProps {
  label: string;
  variant?: AppButtonVariant;
}

const variantStyles = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.white
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
    color: colors.text
  },
  danger: {
    backgroundColor: colors.danger,
    color: colors.white
  }
} as const;

export function AppButton({ label, variant = "primary", style, ...props }: AppButtonProps) {
  const selected = variantStyles[variant];
  const buttonStyle: PressableProps["style"] = (state) => {
    const resolved = typeof style === "function" ? style(state) : style;
    return [styles.button, { backgroundColor: selected.backgroundColor }, resolved];
  };

  return (
    <Pressable style={buttonStyle} {...props}>
      <Text style={[styles.text, { color: selected.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  text: {
    ...typography.label
  }
});
