import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderPricingScreen() {
  const router = useRouter();
  const [hourlyRate, setHourlyRate] = useState("1200");
  const [basicPackage, setBasicPackage] = useState("8000");
  const [premiumPackage, setPremiumPackage] = useState("15000");

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
        </Pressable>
        <Text style={styles.title}>Pricing</Text>
        <View style={styles.spacer} />
      </View>

      <PriceField label="HOURLY RATE (ETB)" value={hourlyRate} onChangeText={setHourlyRate} />
      <PriceField
        label="BASIC PACKAGE STARTING PRICE"
        value={basicPackage}
        onChangeText={setBasicPackage}
      />
      <PriceField
        label="PREMIUM PACKAGE STARTING PRICE"
        value={premiumPackage}
        onChangeText={setPremiumPackage}
      />

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Pricing guidance</Text>
        <Text style={styles.tipText}>
          Keep your baseline competitive and clearly scope revisions to avoid rework.
        </Text>
      </View>

      <ProviderButton label="Save Pricing" onPress={() => router.back()} />
    </ProviderScreen>
  );
}

function PriceField({
  label,
  value,
  onChangeText
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <IconSymbol name="wallet-outline" size={16} color={providerColors.muted} />
        <TextInput
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  spacer: {
    width: 40,
    height: 40
  },
  title: {
    ...providerTypography.h3,
    color: providerColors.navy
  },
  fieldWrap: {
    gap: providerSpacing.xs
  },
  label: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  inputWrap: {
    minHeight: 50,
    borderRadius: providerRadius.md,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  input: {
    flex: 1,
    ...providerTypography.body,
    color: providerColors.title
  },
  tipCard: {
    borderRadius: providerRadius.lg,
    backgroundColor: providerColors.softCard,
    padding: providerSpacing.md
  },
  tipTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  tipText: {
    ...providerTypography.caption,
    color: providerColors.body,
    marginTop: 4
  }
});
