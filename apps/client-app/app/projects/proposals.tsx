import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getProjectProposals } from "@serrale/api";
import { LoadingScreen, ProposalCard, colors, spacing, typography } from "@serrale/ui";
import { ScrollView, StyleSheet, Text } from "react-native";
import { formatCurrency } from "@serrale/utils";

export default function ProjectProposalsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const proposalsQuery = useQuery({
    queryKey: ["project-proposals", projectId],
    queryFn: () => getProjectProposals(projectId),
    enabled: Boolean(projectId)
  });

  if (proposalsQuery.isPending) {
    return <LoadingScreen message="Loading proposals..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Project Proposals</Text>
      {(proposalsQuery.data ?? []).map((proposal) => (
        <ProposalCard
          key={proposal.id}
          title={`Proposal #${proposal.id.slice(0, 6)}`}
          status={proposal.status}
          amountLabel={
            proposal.amount !== undefined
              ? formatCurrency(proposal.amount)
              : undefined
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background
  },
  title: {
    ...typography.h2,
    color: colors.primaryDark
  }
});
