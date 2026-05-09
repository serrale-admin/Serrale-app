import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { providerColors, providerTypography } from "../../provider/theme";
import { ProviderScreen } from "../../provider/components/ProviderScreen";

interface ProviderLoadingScreenProps {
  message?: string;
}

export function ProviderLoadingScreen({
  message = "Preparing your workspace..."
}: ProviderLoadingScreenProps) {
  return (
    <ProviderScreen scroll={false} contentContainerStyle={styles.content}>
      <View style={styles.markWrap}>
        <View style={styles.markOuter}>
          <View style={styles.markInner} />
        </View>
      </View>
      <Text style={styles.brand}>SERRALE</Text>
      <ActivityIndicator size="small" color={providerColors.blue} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: providerColors.appBg
  },
  markWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: providerColors.sky,
    alignItems: "center",
    justifyContent: "center"
  },
  markOuter: {
    width: 44,
    height: 60,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: providerColors.navy,
    alignItems: "center",
    justifyContent: "center"
  },
  markInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#5A8AB5"
  },
  brand: {
    ...providerTypography.h2,
    color: providerColors.navy,
    letterSpacing: 4,
    marginTop: 20
  },
  spinner: {
    marginTop: 18
  },
  message: {
    ...providerTypography.body,
    color: providerColors.muted,
    marginTop: 18
  }
});
