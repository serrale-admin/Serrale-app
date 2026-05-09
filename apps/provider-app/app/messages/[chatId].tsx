import { useLocalSearchParams } from "expo-router";

import { ProviderChatScreen } from "../../src/screens/provider/ProviderChatScreen";

export default function ChatRoute() {
  const params = useLocalSearchParams<{ chatId?: string }>();
  const chatId = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;
  return <ProviderChatScreen chatId={chatId ?? "m1"} />;
}
