import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { providerJobs } from "../../provider/data";
import type { ProviderJob } from "../../provider/types";
import { formatEtbRange } from "../../provider/format";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerSpacing, providerTypography } from "../../provider/theme";

interface ProviderSendProposalScreenProps {
  jobId: string;
}

export function ProviderSendProposalScreen({ jobId }: ProviderSendProposalScreenProps) {
  const router = useRouter();
  const job: ProviderJob = useMemo(
    () => providerJobs.find((entry) => entry.id === jobId) ?? providerJobs[0],
    [jobId]
  );

  const [message, setMessage] = useState(
    "Hello Buna House team,\n\nI'd love to bring your coffee brand to life. I've worked on hospitality identities with strong local storytelling.\n\nMy proposal includes:\n- Logo system + 2 concepts\n- Color & typography guide\n- Packaging mockups\n\nLooking forward to chatting,\nSamuel"
  );
  const [price, setPrice] = useState("10000");
  const [days, setDays] = useState("14");

  return (
    <View style={styles.root}>
      <ProviderScreen contentContainerStyle={styles.content}>
        <View style={styles.headRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
          </Pressable>
          <View style={styles.headTextWrap}>
            <Text style={styles.title}>Send Proposal</Text>
            <Text style={styles.subtitle}>Tell the client why you're the right fit</Text>
          </View>
        </View>

        <View style={styles.jobMiniCard}>
          <Text style={styles.cardTag}>APPLYING TO</Text>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobMeta}>
            {job.client} - {formatEtbRange(job.budgetMin, job.budgetMax)}
          </Text>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>COVER MESSAGE</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            style={styles.textarea}
          />
          <Text style={styles.counter}>{message.length} / 1000</Text>
        </View>

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>YOUR PRICE (ETB)</Text>
            <View style={styles.inlineField}>
              <IconSymbol name="wallet-outline" size={16} color={providerColors.muted} />
              <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.inlineInput} />
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>DELIVERY (DAYS)</Text>
            <View style={styles.inlineField}>
              <IconSymbol name="time-outline" size={16} color={providerColors.muted} />
              <TextInput value={days} onChangeText={setDays} keyboardType="numeric" style={styles.inlineInput} />
            </View>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>ATTACHMENTS (OPTIONAL)</Text>
          <Pressable style={styles.attachmentButton}>
            <IconSymbol name="attach-outline" size={16} color={providerColors.blue} />
            <Text style={styles.attachmentText}>Attach portfolio samples or brief</Text>
          </Pressable>
        </View>

        <View style={styles.tipCard}>
          <IconSymbol name="sparkles-outline" size={16} color={providerColors.successGreen} />
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>Pro tip</Text>
            <Text style={styles.tipText}>
              Mention 1-2 similar projects you've completed to build instant trust.
            </Text>
          </View>
        </View>
      </ProviderScreen>

      <View style={styles.stickyBar}>
        <ProviderButton label="Review" variant="secondary" full={false} style={styles.reviewBtn} />
        <ProviderButton
          label="Send Proposal"
          icon="paper-plane-outline"
          onPress={() => router.replace("/tabs/proposals")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: providerColors.appBg
  },
  content: {
    paddingTop: providerSpacing.md,
    paddingBottom: 126
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: providerRadius.md,
    borderWidth: 1,
    borderColor: providerColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: providerColors.white
  },
  headTextWrap: {
    flex: 1
  },
  title: {
    ...providerTypography.h3,
    color: providerColors.navy
  },
  subtitle: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  jobMiniCard: {
    borderRadius: providerRadius.lg,
    backgroundColor: providerColors.softCard,
    borderWidth: 1,
    borderColor: providerColors.border,
    padding: providerSpacing.md,
    gap: providerSpacing.xxs
  },
  cardTag: {
    ...providerTypography.caption,
    color: providerColors.muted,
    letterSpacing: 0.5
  },
  jobTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  jobMeta: {
    ...providerTypography.caption,
    color: providerColors.body
  },
  fieldWrap: {
    gap: providerSpacing.xs
  },
  fieldLabel: {
    ...providerTypography.caption,
    color: providerColors.muted,
    letterSpacing: 0.4
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
  counter: {
    ...providerTypography.caption,
    color: providerColors.muted,
    textAlign: "right"
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
  inlineInput: {
    flex: 1,
    ...providerTypography.title,
    color: providerColors.title
  },
  attachmentButton: {
    borderRadius: providerRadius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: providerColors.border,
    backgroundColor: providerColors.softCard,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: providerSpacing.sm
  },
  attachmentText: {
    ...providerTypography.label,
    color: providerColors.blue
  },
  tipCard: {
    borderRadius: providerRadius.md,
    backgroundColor: providerColors.successSoft,
    padding: providerSpacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: providerSpacing.sm
  },
  tipTextWrap: {
    flex: 1
  },
  tipTitle: {
    ...providerTypography.label,
    color: providerColors.successGreen
  },
  tipText: {
    ...providerTypography.caption,
    color: providerColors.body,
    marginTop: 2
  },
  stickyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: providerColors.border,
    paddingHorizontal: providerSpacing.xl,
    paddingTop: providerSpacing.sm,
    paddingBottom: providerSpacing.xxl,
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  reviewBtn: {
    minHeight: 50
  }
});
