import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@serrale/api";
import { clearSession } from "@serrale/auth";
import { clientColors, clientSpacing, clientTypography } from "../../src/client/theme";
import { AppButton } from "../../src/client/components/AppButton";
import { LoadingScreen } from "../../src/client/screens/LoadingScreen";
import { StyleSheet, Text, View } from "react-native";

export default function RoleValidationScreen() {
  const router = useRouter();
  const roleCheck = useQuery({
    queryKey: ["role-validation"],
    queryFn: fetchMe,
    retry: false,
  });

  useEffect(() => {
    if (roleCheck.data && roleCheck.data.user.role === "client") {
      router.replace("/tabs/home");
    }
  }, [roleCheck.data, router]);

  if (roleCheck.isPending) {
    return <LoadingScreen message="Verifying account..." />;
  }

  if (roleCheck.isError) {
    return (
      <View style={styles.screen}>
        <Text style={clientTypography.h1}>Unable to verify account</Text>
        <Text style={clientTypography.body}>Please sign in again to continue.</Text>
        <AppButton
          label="Try Another Account"
          onPress={async () => {
            await clearSession();
            router.replace("/auth/login");
          }}
          style={styles.button}
        />
      </View>
    );
  }

  if (roleCheck.data.user.role === "service_provider") {
    return (
      <View style={styles.screen}>
        <View style={styles.iconContainer}>
          <Text style={styles.errorIcon}>!</Text>
        </View>
        <Text style={clientTypography.h1}>Wrong App</Text>
        <Text style={clientTypography.body}>
          This account is registered as a Service Provider. Please use the SERRALE Provider app.
        </Text>
        <View style={styles.actions}>
          <AppButton
            label="Log Out"
            onPress={async () => {
              await clearSession();
              router.replace("/auth/login");
            }}
          />
        </View>
      </View>
    );
  }

  return <LoadingScreen message="Preparing your workspace..." />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: clientColors.background,
    paddingHorizontal: clientSpacing.screenPadding,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: clientColors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 32,
    fontWeight: "900",
    color: clientColors.danger,
  },
  button: {
    marginTop: 24,
  },
  actions: {
    width: "100%",
    marginTop: 32,
  },
});
