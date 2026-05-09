import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";

export function ProviderProfileSettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState("Samuel D.");
  const [title, setTitle] = useState("Brand Designer & Photographer");
  const [bio, setBio] = useState(
    "I help brands in Ethiopia craft clear visual identities and premium campaign assets."
  );

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
        </Pressable>
        <Text style={styles.title}>Profile Settings</Text>
        <View style={styles.spacer} />
      </View>

      <Field label="FULL NAME">
        <TextInput value={name} onChangeText={setName} style={styles.input} />
      </Field>
      <Field label="HEADLINE">
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />
      </Field>
      <Field label="BIO">
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.bioInput]}
        />
      </Field>

      <ProviderButton label="Save Profile" onPress={() => router.back()} />
    </ProviderScreen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
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
  input: {
    minHeight: 50,
    borderRadius: providerRadius.md,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    ...providerTypography.body,
    color: providerColors.title
  },
  bioInput: {
    minHeight: 140,
    paddingTop: providerSpacing.md
  }
});
