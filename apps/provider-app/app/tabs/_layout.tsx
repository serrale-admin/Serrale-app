import { Tabs, type Href, useRouter } from "expo-router";

import {
  ProviderBottomTabBar,
  type ProviderTabKey
} from "../../src/provider/components/ProviderBottomTabBar";

const keyByRoute: Record<string, ProviderTabKey> = {
  home: "home",
  jobs: "jobs",
  proposals: "proposals",
  messages: "messages",
  profile: "profile"
};

const hrefByKey: Record<ProviderTabKey, Href> = {
  home: "/tabs/home",
  jobs: "/tabs/jobs",
  proposals: "/tabs/proposals",
  messages: "/tabs/messages",
  profile: "/tabs/profile"
};

export default function ProviderTabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state }) => (
        <ProviderBottomTabBar
          activeKey={keyByRoute[state.routes[state.index]?.name] ?? "home"}
          onSelect={(key) => router.push(hrefByKey[key])}
        />
      )}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs" }} />
      <Tabs.Screen name="proposals" options={{ title: "Proposals" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
