import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { providerProposals } from "../../provider/data";
import { ProposalCard } from "../../provider/components/ProviderCards";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

const filters = ["All", "Pending", "Viewed", "Shortlisted", "Won"] as const;

export function ProviderProposalsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const proposals = useMemo(() => [...providerProposals, ...providerProposals], []);

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <ProviderHeader title="Proposals" />

      <View style={styles.statGrid}>
        <StatPill label="Active" value="4" color={providerColors.blue} />
        <StatPill label="Viewed" value="7" color={providerColors.successGreen} />
        <StatPill label="Shortlist" value="2" color={providerColors.purple} />
        <StatPill label="Won" value="12" color={providerColors.successGreen} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
        {filters.map((filter) => {
          const active = activeFilter === filter;

          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, active ? styles.activeChip : null]}
            >
              <Text style={[styles.filterLabel, active ? styles.activeLabel : null]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.stack}>
        {proposals.map((proposal, index) => (
          <ProposalCard
            key={`${proposal.id}-${index}`}
            proposal={proposal}
            onView={() =>
              router.push({
                pathname: "/proposals/[proposalId]",
                params: { proposalId: proposal.id }
              })
            }
          />
        ))}
      </View>
    </ProviderScreen>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  statGrid: {
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  statCard: {
    flex: 1,
    borderRadius: providerRadius.md,
    backgroundColor: providerColors.white,
    paddingVertical: providerSpacing.md,
    alignItems: "center",
    ...providerShadows.card
  },
  statValue: {
    ...providerTypography.h2
  },
  statLabel: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  filterList: {
    gap: providerSpacing.sm
  },
  filterChip: {
    borderRadius: providerRadius.full,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm
  },
  activeChip: {
    borderColor: providerColors.blue,
    backgroundColor: providerColors.blue
  },
  filterLabel: {
    ...providerTypography.caption,
    color: providerColors.body
  },
  activeLabel: {
    color: providerColors.white
  },
  stack: {
    gap: providerSpacing.sm
  }
});
