import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { ReactNode } from "react";

import { providerColors, providerRadius, providerSpacing, providerTypography } from "../theme";
import { IconSymbol, type IconName } from "./IconSymbol";

interface ProviderInputProps extends TextInputProps {
  label: string;
  icon?: IconName;
  trailing?: ReactNode;
}

export function ProviderInput({ label, icon, trailing, style, ...props }: ProviderInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.field}>
        {icon ? <IconSymbol name={icon} size={17} color={providerColors.muted} /> : null}
        <TextInput
          placeholderTextColor={providerColors.light}
          style={[styles.input, style]}
          {...props}
        />
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: providerSpacing.xs
  },
  label: {
    ...providerTypography.caption,
    color: providerColors.muted,
    letterSpacing: 0.3
  },
  field: {
    minHeight: 52,
    borderRadius: providerRadius.md,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  input: {
    flex: 1,
    ...providerTypography.body,
    color: providerColors.title
  }
});
