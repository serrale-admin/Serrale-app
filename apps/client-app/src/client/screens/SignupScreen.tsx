import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { clientColors, clientRadius, clientSpacing, clientTypography } from "../theme";
import { useTranslation, useLanguageStore } from "../i18n";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";

export const SignupScreen = () => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    }
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    // Simulate signup and go to onboarding step 2 (preferences)
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "am" : "en");
  };

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Text style={clientTypography.h1}>What do you need help with?</Text>
          <Text style={clientTypography.body}>Select your interests to personalize your experience.</Text>
        </View>
        <View style={styles.preferencesGrid}>
          {["Design", "Development", "Marketing", "Repairs", "Cleaning", "IT Support"].map((pref) => (
            <Pressable key={pref} style={styles.prefChip}>
              <Text style={styles.prefText}>{pref}</Text>
            </Pressable>
          ))}
        </View>
        <AppButton 
          label="Complete Registration" 
          onPress={() => router.replace("/tabs/home")} 
          style={styles.completeButton}
        />
      </View>
    );
  }

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
        <Text style={clientTypography.h1}>Create Account</Text>
        <Text style={clientTypography.body}>Join the premium marketplace for services in Ethiopia.</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Full Name"
              placeholder="Abebe Balcha"
              value={value}
              onChangeText={onChange}
              icon="person-outline"
            />
          )}
        />
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
          name="phone"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Phone Number"
              placeholder="+251 911..."
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              icon="call-outline"
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
            />
          )}
        />

        <AppButton
          label="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/auth/login")}>
            <Text style={styles.linkText}>{t("log_in")}</Text>
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
  submitButton: {
    marginTop: 8,
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
  preferencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  prefChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: clientColors.white,
    borderWidth: 1,
    borderColor: clientColors.border,
  },
  prefText: {
    ...clientTypography.body,
    color: clientColors.navy,
    fontWeight: "600",
  },
  completeButton: {
    marginTop: "auto",
    marginBottom: 40,
  },
});
