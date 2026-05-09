import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderAvailabilityScreen() {
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [weekendOpen, setWeekendOpen] = useState(false);
  const [urgentReady, setUrgentReady] = useState(true);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
        </Pressable>
        <Text style={styles.title}>Availability</Text>
        <View style={styles.spacer} />
      </View>

      <OptionCard
        title="Open for new projects"
        subtitle="Visible to clients in search and recommendations."
        value={available}
        onValueChange={setAvailable}
      />
      <OptionCard
        title="Available on weekends"
        subtitle="Allow weekend client bookings for delivery support."
        value={weekendOpen}
        onValueChange={setWeekendOpen}
      />
      <OptionCard
        title="Accept urgent requests"
        subtitle="Clients can request fast-turnaround work."
        value={urgentReady}
        onValueChange={setUrgentReady}
      />

      <ProviderButton label="Save Availability" onPress={() => router.back()} />
    </ProviderScreen>
  );
}

function OptionCard({
  title,
  subtitle,
  value,
  onValueChange
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.optionCard}>
      <View style={styles.optionTextWrap}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#CBD5E1", true: providerColors.blue }}
        thumbColor={providerColors.white}
      />
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
  optionCard: {
    borderRadius: providerRadius.lg,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  optionTextWrap: {
    flex: 1
  },
  optionTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  optionSubtitle: {
    ...providerTypography.caption,
    color: providerColors.muted,
    marginTop: 2
  }
});
