import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { providerColors, providerSpacing } from "../theme";

interface ProviderScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function ProviderScreen({
  children,
  scroll = true,
  contentContainerStyle,
  style
}: ProviderScreenProps) {
  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: providerColors.appBg
  },
  scrollContent: {
    paddingHorizontal: providerSpacing.xl,
    paddingBottom: providerSpacing.xxxl,
    gap: providerSpacing.md
  }
});
