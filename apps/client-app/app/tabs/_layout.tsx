import { Tabs, type Href, useRouter } from "expo-router";
import { BottomTabBar, type ClientTabKey } from "../../src/client/components/BottomTabBar";

const keyByRoute: Record<string, ClientTabKey> = {
  home: "home",
  categories: "categories",
  "post-project": "post",
  messages: "messages",
  profile: "profile"
};

const hrefByKey: Record<ClientTabKey, Href> = {
  home: "/tabs/home",
  categories: "/tabs/categories",
  post: "/projects/create",
  messages: "/tabs/messages",
  profile: "/tabs/profile"
};

export default function ClientTabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state }) => (
        <BottomTabBar
          activeKey={keyByRoute[state.routes[state.index]?.name] ?? "home"}
          onSelect={(key) => router.push(hrefByKey[key])}
        />
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="post-project" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
