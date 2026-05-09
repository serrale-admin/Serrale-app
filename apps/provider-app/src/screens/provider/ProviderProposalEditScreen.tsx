import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ProviderButton } from "../../provider/components/ProviderButton";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderProposalEditScreen() {
  const router = useRouter();
  const [coverMessage, setCoverMessage] = useState(
    "Updated proposal draft focused on delivery scope and revision rounds."
  );
  const [budget, setBudget] = useState("18000");
  const [timeline, setTimeline] = useState("14");

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
        </Pressable>
        <Text style={styles.title}>Edit Proposal</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>COVER MESSAGE</Text>
        <TextInput
          multiline
          textAlignVertical="top"
          value={coverMessage}
          onChangeText={setCoverMessage}
          style={styles.textarea}
        />
      </View>

      <View style={styles.twoCols}>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>BUDGET (ETB)</Text>
          <View style={styles.inlineField}>
            <IconSymbol name="wallet-outline" size={16} color={providerColors.muted} />
            <TextInput
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              style={styles.inlineInput}
            />
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.fieldLabel}>TIMELINE (DAYS)</Text>
          <View style={styles.inlineField}>
            <IconSymbol name="calendar-outline" size={16} color={providerColors.muted} />
            <TextInput
              value={timeline}
              onChangeText={setTimeline}
              keyboardType="numeric"
              style={styles.inlineInput}
            />
          </View>
        </View>
      </View>

      <ProviderButton label="Save Changes" onPress={() => router.back()} />
      <ProviderButton label="Discard" variant="secondary" onPress={() => router.back()} />
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
  fieldWrap: {
    gap: providerSpacing.xs
  },
  fieldLabel: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  textarea: {
    minHeight: 180,
    borderRadius: providerRadius.md,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    padding: providerSpacing.md,
    ...providerTypography.body,
    color: providerColors.title
  },
  twoCols: {
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  col: {
    flex: 1,
    gap: providerSpacing.xs
  },
  inlineField: {
    minHeight: 48,
    borderRadius: providerRadius.md,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm,
    paddingHorizontal: providerSpacing.md
  },
  inlineInput: {
    flex: 1,
    ...providerTypography.body,
    color: providerColors.title
  }
});
