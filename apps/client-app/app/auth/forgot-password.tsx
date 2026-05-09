import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { clientColors, clientSpacing, clientTypography } from "../../src/client/theme";
import { AppButton } from "../../src/client/components/AppButton";
import { AppInput } from "../../src/client/components/AppInput";
import { useTranslation } from "../../src/client/i18n";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={clientTypography.h1}>{t("forgot_password")}</Text>
        <Text style={clientTypography.body}>
          Enter your email address and we&apos;ll send reset instructions.
        </Text>
      </View>
      
      <AppInput 
        label={t("email")} 
        placeholder="name@email.com"
        keyboardType="email-address" 
        autoCapitalize="none" 
        icon="mail-outline"
      />
      
      <AppButton 
        label="Send Reset Link" 
        onPress={() => {}} 
        style={styles.button}
      />
      
      <AppButton 
        label="Back to Login" 
        onPress={() => router.back()} 
        variant="outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: clientColors.background,
    padding: clientSpacing.screenPadding,
    paddingTop: 80,
  },
  header: {
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
    marginBottom: 12,
  },
});
