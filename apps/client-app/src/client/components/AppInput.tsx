import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { clientColors, clientRadius, clientSpacing, clientTypography } from "../theme";
import { Ionicons } from "@expo/vector-icons";

interface AppInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
}

export const AppInput = ({
  label,
  icon,
  error,
  containerStyle,
  trailing,
  ...props
}: AppInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          props.multiline ? styles.multiline : null,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={clientColors.muted}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={clientColors.light}
          {...props}
        />
        {trailing && <View style={styles.trailing}>{trailing}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: clientSpacing.md,
  },
  label: {
    ...clientTypography.label,
    marginBottom: clientSpacing.sm,
    color: clientColors.navy,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: clientColors.white,
    borderWidth: 1,
    borderColor: clientColors.border,
    borderRadius: clientRadius.medium,
    paddingHorizontal: clientSpacing.md,
    height: 56,
  },
  multiline: {
    height: 120,
    alignItems: "flex-start",
    paddingVertical: clientSpacing.md,
  },
  input: {
    flex: 1,
    ...clientTypography.body,
    color: clientColors.navy,
    height: "100%",
  },
  inputError: {
    borderColor: clientColors.danger,
  },
  icon: {
    marginRight: clientSpacing.sm,
  },
  trailing: {
    marginLeft: clientSpacing.sm,
  },
  errorText: {
    ...clientTypography.caption,
    color: clientColors.danger,
    marginTop: clientSpacing.xs,
  },
});
