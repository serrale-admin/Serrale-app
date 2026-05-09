import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { clientColors, clientTypography } from "../theme";
import { useTranslation } from "../i18n";

export const LoadingScreen = ({ message }: { message?: string }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoMark}>S</Text>
        </View>
        <Text style={styles.wordmark}>SERRALE</Text>
        <ActivityIndicator size="small" color={clientColors.primary} style={styles.loader} />
        <Text style={styles.message}>{message || t("preparing_workspace")}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.tagline}>{t("find_hire_grow")}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clientColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: clientColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoMark: {
    fontSize: 48,
    fontWeight: "900",
    color: clientColors.white,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: "900",
    color: clientColors.navy,
    letterSpacing: 2,
  },
  loader: {
    marginTop: 32,
    marginBottom: 16,
  },
  message: {
    ...clientTypography.body,
    color: clientColors.muted,
  },
  footer: {
    position: "absolute",
    bottom: 60,
  },
  tagline: {
    ...clientTypography.label,
    color: clientColors.primary,
    letterSpacing: 1.5,
  },
});
