import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { createMobileSession, fetchMe } from "@serrale/api";
import { clearSession, setSession } from "@serrale/auth";

import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderInput } from "../../provider/components/ProviderInput";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

interface LoginValues {
  email: string;
  password: string;
}

export function ProviderLoginScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);
      setError(null);

      // Attempt actual login
      try {
        const session = await createMobileSession({ ...values, intent: "login" });
        await setSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token
        });

        const me = await fetchMe();
        if (me.user.role !== "service_provider") {
          await clearSession();
          setError("This account belongs to a client. Please use the client app.");
          return;
        }
      } catch (e) {
        console.warn("Backend login failed, proceeding to home for UI testing:", e);
      }

      // Always proceed to home for UI testing as requested
      router.replace("/tabs/home");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Unable to sign in right now."
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.markBadge}>
          <Text style={styles.brandBadgeText}>SERRALE</Text>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroTag}>FOR PROVIDERS</Text>
          <Text style={styles.heroTitle}>Welcome back</Text>
          <Text style={styles.heroSubtitle}>
            Find work, manage proposals, and grow your profile.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <ProviderInput
              label="Email"
              icon="mail-outline"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="you@email.com"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <ProviderInput
              label="Password"
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="********"
              trailing={
                <Pressable onPress={() => setShowPassword((open) => !open)} hitSlop={8}>
                  <Text style={styles.trailingAction}>{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              }
            />
          )}
        />

        <Pressable>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <ProviderButton
          label={loading ? "Logging In..." : "Log In"}
          onPress={onSubmit}
          disabled={loading}
        />

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <ProviderButton
          label="Continue with Google"
          variant="secondary"
          icon="logo-google"
          onPress={() => setError("Google sign-in will be connected in a later backend pass.")}
        />

        <ProviderButton
          label="Skip Login (Development)"
          variant="secondary"
          onPress={() => router.replace("/tabs/home")}
          style={{ marginTop: providerSpacing.xs, borderStyle: 'dashed' }}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to SERRALE? </Text>
          <Pressable onPress={() => router.push("/auth/signup")}>
            <Text style={styles.footerLink}>Register as a Provider</Text>
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
  hero: {
    height: 280,
    borderRadius: providerRadius.xxl,
    overflow: "hidden",
    backgroundColor: providerColors.blueDark,
    justifyContent: "space-between",
    padding: providerSpacing.lg,
    ...providerShadows.elevated
  },
  markBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: providerRadius.sm,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.xs
  },
  brandBadgeText: {
    ...providerTypography.label,
    color: providerColors.navy,
    letterSpacing: 1
  },
  heroBottom: {
    gap: providerSpacing.xs
  },
  heroTag: {
    ...providerTypography.caption,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.4
  },
  heroTitle: {
    ...providerTypography.h1,
    color: providerColors.white
  },
  heroSubtitle: {
    ...providerTypography.body,
    color: "rgba(255,255,255,0.92)"
  },
  form: {
    gap: providerSpacing.md,
    paddingTop: providerSpacing.xl
  },
  trailingAction: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  forgot: {
    ...providerTypography.caption,
    color: providerColors.blue,
    textAlign: "right"
  },
  error: {
    ...providerTypography.caption,
    color: providerColors.dangerRed
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: providerColors.border
  },
  orText: {
    ...providerTypography.caption,
    color: providerColors.muted
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
