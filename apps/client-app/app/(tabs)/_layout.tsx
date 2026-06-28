import { Tabs } from 'expo-router';
import TabBar from '../../src/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="request" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
