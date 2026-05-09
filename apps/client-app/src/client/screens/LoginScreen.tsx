import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { clientColors, clientSpacing, clientTypography } from "../theme";
import { useTranslation, useLanguageStore } from "../i18n";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";

export const LoginScreen = () => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    // Simulate login and redirect to role validation or home
    setTimeout(() => {
      setLoading(false);
      router.replace("/tabs/home");
    }, 1500);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "am" : "en");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.brandName}>SERRALE</Text>
        </View>
        <Pressable onPress={toggleLanguage} style={styles.langSwitch}>
          <Text style={styles.langText}>{language === "en" ? "አማርኛ" : "English"}</Text>
        </Pressable>
      </View>

      <View style={styles.heroSection}>
        <Text style={clientTypography.h1}>{t("welcome_back")}</Text>
        <Text style={clientTypography.body}>{t("hire_trusted")}</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={t("email")}
              placeholder="name@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              icon="mail-outline"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={t("password")}
              placeholder="••••••••"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              icon="lock-closed-outline"
              trailing={
                <Pressable>
                  <Text style={styles.forgotText}>{t("forgot_password")}</Text>
                </Pressable>
              }
            />
          )}
        />

        <AppButton
          label={t("log_in")}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <AppButton
          label={t("continue_google")}
          onPress={() => {}}
          variant="secondary"
          icon="logo-google"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("new_to_serrale")} </Text>
          <Pressable onPress={() => router.push("/auth/signup")}>
            <Text style={styles.linkText}>{t("create_account_link")}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: clientColors.background,
    padding: clientSpacing.screenPadding,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    backgroundColor: clientColors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: clientColors.white,
    fontWeight: "900",
    fontSize: 20,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: clientColors.navy,
    letterSpacing: 1,
  },
  langSwitch: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: clientColors.softBlue,
  },
  langText: {
    ...clientTypography.label,
    color: clientColors.primary,
  },
  heroSection: {
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  forgotText: {
    ...clientTypography.caption,
    color: clientColors.primary,
  },
  submitButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: clientColors.border,
  },
  orText: {
    ...clientTypography.caption,
    color: clientColors.light,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    ...clientTypography.body,
    color: clientColors.muted,
  },
  linkText: {
    ...clientTypography.body,
    fontWeight: "700",
    color: clientColors.primary,
  },
});
