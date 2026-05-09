import { useLocalSearchParams } from "expo-router";

import { ProviderSendProposalScreen } from "../../src/screens/provider/ProviderSendProposalScreen";

export default function SendProposalRoute() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  return <ProviderSendProposalScreen jobId={jobId ?? "j1"} />;
}
