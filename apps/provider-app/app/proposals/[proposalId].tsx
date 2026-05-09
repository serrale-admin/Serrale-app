import { useLocalSearchParams } from "expo-router";

import { ProviderProposalDetailScreen } from "../../src/screens/provider/ProviderProposalDetailScreen";

export default function ProposalDetailRoute() {
  const params = useLocalSearchParams<{ proposalId?: string }>();
  const proposalId = Array.isArray(params.proposalId) ? params.proposalId[0] : params.proposalId;
  return <ProviderProposalDetailScreen proposalId={proposalId ?? "p1"} />;
}
