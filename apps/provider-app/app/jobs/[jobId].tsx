import { useLocalSearchParams } from "expo-router";

import { ProviderJobDetailScreen } from "../../src/screens/provider/ProviderJobDetailScreen";

export default function JobDetailRoute() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  return <ProviderJobDetailScreen jobId={jobId ?? "j1"} />;
}
