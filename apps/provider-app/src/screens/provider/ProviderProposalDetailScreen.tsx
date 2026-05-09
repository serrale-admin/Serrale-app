import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { providerProposals } from "../../provider/data";
import type { ProviderProposal } from "../../provider/types";
import { ProposalStatusBadge } from "../../provider/components/ProviderBadges";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { ProviderButton } from "../../provider/components/ProviderButton";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

interface ProviderProposalDetailScreenProps {
  proposalId: string;
}

export function ProviderProposalDetailScreen({ proposalId }: ProviderProposalDetailScreenProps) {
  const router = useRouter();
  const proposal: ProviderProposal = useMemo(
    () => providerProposals.find((entry) => entry.id === proposalId) ?? providerProposals[0],
    [proposalId]
  );

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={18} color={providerColors.title} />
        </Pressable>
        <Text style={styles.title}>Proposal Details</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.mainCard}>
        <View style={styles.rowHead}>
          <View style={styles.titleWrap}>
            <Text style={styles.projectTitle}>{proposal.project}</Text>
            <Text style={styles.clientText}>{proposal.client}</Text>
          </View>
          <ProposalStatusBadge status={proposal.status} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Budget</Text>
          <Text style={styles.metaValue}>{proposal.budget}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Submitted</Text>
          <Text style={styles.metaValue}>{proposal.submitted}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Latest update</Text>
          <Text style={styles.metaValue}>{proposal.update}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Conversation status</Text>
        <Text style={styles.body}>
          Keep your response time quick and send a concise follow-up message to improve conversion.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <ProviderButton
          label="Message Client"
          variant="secondary"
          full={false}
          style={styles.actionButton}
          onPress={() => router.push({ pathname: "/messages/[chatId]", params: { chatId: "m1" } })}
        />
        <ProviderButton
          label="Edit Proposal"
          full={false}
          style={styles.actionButton}
          onPress={() => router.push("/proposals/edit")}
        />
      </View>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
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
  mainCard: {
    borderRadius: providerRadius.xl,
    backgroundColor: providerColors.white,
    padding: providerSpacing.lg,
    gap: providerSpacing.md,
    ...providerShadows.card
  },
  rowHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: providerSpacing.sm
  },
  titleWrap: {
    flex: 1,
    gap: providerSpacing.xxs
  },
  projectTitle: {
    ...providerTypography.h3,
    color: providerColors.navy
  },
  clientText: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  metaLabel: {
    ...providerTypography.body,
    color: providerColors.body
  },
  metaValue: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  sectionCard: {
    borderRadius: providerRadius.lg,
    backgroundColor: providerColors.softCard,
    padding: providerSpacing.md,
    gap: providerSpacing.xs
  },
  sectionTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  body: {
    ...providerTypography.body,
    color: providerColors.body
  },
  actionRow: {
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  actionButton: {
    flex: 1
  }
});
