import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { providerPortfolio } from "../../provider/data";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderPortfolioScreen() {
  const router = useRouter();

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
        </Pressable>
        <Text style={styles.title}>Portfolio</Text>
        <View style={styles.spacer} />
      </View>

      <Text style={styles.subtitle}>Showcase your strongest client outcomes and craft quality.</Text>

      <View style={styles.stack}>
        {providerPortfolio.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardPeriod}>{item.period}</Text>
            </View>
            <Text style={styles.cardService}>{item.service}</Text>
            <Text style={styles.cardSummary}>{item.summary}</Text>
            <View style={styles.resultPill}>
              <Text style={styles.resultText}>{item.result}</Text>
            </View>
          </View>
        ))}
      </View>

      <ProviderButton
        label="Add Portfolio Item"
        icon="add-outline"
        onPress={() => router.push("/settings/profile")}
      />
    </ProviderScreen>
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
  subtitle: {
    ...providerTypography.body,
    color: providerColors.body
  },
  stack: {
    gap: providerSpacing.sm
  },
  card: {
    borderRadius: providerRadius.lg,
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    gap: providerSpacing.xs,
    ...providerShadows.card
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: providerSpacing.sm
  },
  cardTitle: {
    ...providerTypography.title,
    color: providerColors.navy,
    flex: 1
  },
  cardPeriod: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  cardService: {
    ...providerTypography.label,
    color: providerColors.blue
  },
  cardSummary: {
    ...providerTypography.body,
    color: providerColors.body
  },
  resultPill: {
    alignSelf: "flex-start",
    borderRadius: providerRadius.full,
    backgroundColor: providerColors.successSoft,
    paddingHorizontal: providerSpacing.sm,
    paddingVertical: providerSpacing.xs
  },
  resultText: {
    ...providerTypography.caption,
    color: providerColors.successGreen
  }
});
