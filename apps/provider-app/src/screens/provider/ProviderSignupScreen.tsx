import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderInput } from "../../provider/components/ProviderInput";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderSignupScreen() {
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{"<"}</Text>
      </Pressable>

      <View style={styles.topBlock}>
        <Text style={styles.title}>Start growing{"\n"}with SERRALE</Text>
        <Text style={styles.subtitle}>
          Create your provider profile and get discovered by clients across Ethiopia.
        </Text>
      </View>

      <View style={styles.form}>
        <ProviderInput
          label="Full name"
          icon="person-outline"
          placeholder="Samuel Desta"
          defaultValue="Samuel Desta"
        />
        <ProviderInput
          label="Phone number"
          icon="call-outline"
          keyboardType="phone-pad"
          placeholder="+251 ..."
          defaultValue="+251 911 234 567"
        />
        <ProviderInput
          label="Email"
          icon="mail-outline"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@email.com"
          defaultValue="samuel.d@example.et"
        />
        <ProviderInput
          label="Primary service"
          icon="construct-outline"
          placeholder="e.g. Brand designer"
          defaultValue="Brand designer & photographer"
        />
        <ProviderInput
          label="Password"
          icon="lock-closed-outline"
          secureTextEntry
          placeholder="********"
        />

        <Pressable style={styles.termsCard} onPress={() => setAcceptedTerms((value) => !value)}>
          <View style={[styles.checkbox, acceptedTerms ? styles.checkboxActive : null]}>
            <Text style={styles.checkboxMark}>x</Text>
          </View>
          <Text style={styles.termsText}>
            I agree to SERRALE's <Text style={styles.linkText}>Terms</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </Pressable>

        <ProviderButton
          label="Register as a Provider"
          onPress={() => router.replace("/tabs/home")}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/auth/login")}>
            <Text style={styles.footerLink}>Log In</Text>
          </Pressable>
        </View>
      </View>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.xl
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: providerSpacing.md
  },
  backText: {
    fontSize: 24,
    lineHeight: 24,
    color: providerColors.title
  },
  topBlock: {
    gap: providerSpacing.sm
  },
  title: {
    ...providerTypography.h1,
    color: providerColors.navy,
    lineHeight: 34
  },
  subtitle: {
    ...providerTypography.body,
    color: providerColors.body,
    lineHeight: 22
  },
  form: {
    paddingTop: providerSpacing.xl,
    gap: providerSpacing.md
  },
  termsCard: {
    borderRadius: providerRadius.md,
    backgroundColor: providerColors.softCard,
    padding: providerSpacing.md,
    flexDirection: "row",
    gap: providerSpacing.sm,
    alignItems: "flex-start"
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: providerRadius.sm,
    borderWidth: 1,
    borderColor: providerColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: providerColors.white
  },
  checkboxActive: {
    backgroundColor: providerColors.blue,
    borderColor: providerColors.blue
  },
  checkboxMark: {
    fontSize: 12,
    color: providerColors.white,
    fontWeight: "800"
  },
  termsText: {
    flex: 1,
    ...providerTypography.caption,
    color: providerColors.body,
    lineHeight: 18
  },
  linkText: {
    color: providerColors.blue
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  footerText: {
    ...providerTypography.body,
    color: providerColors.body
  },
  footerLink: {
    ...providerTypography.title,
    color: providerColors.blue
  }
});
