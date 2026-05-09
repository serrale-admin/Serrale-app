import { BottomTabBar } from "@serrale/ui";

interface ClientBottomTabBarProps {
  activeKey: "home" | "categories" | "post" | "messages" | "profile";
  onSelect?: (key: "home" | "categories" | "post" | "messages" | "profile") => void;
}

export function ClientBottomTabBar({ activeKey, onSelect }: ClientBottomTabBarProps) {
  return (
    <BottomTabBar
      items={[
        { key: "home", label: "Home", active: activeKey === "home", onPress: () => onSelect?.("home") },
        {
          key: "categories",
          label: "Categories",
          active: activeKey === "categories",
          onPress: () => onSelect?.("categories")
        },
        {
          key: "post",
          label: "Post",
          active: activeKey === "post",
          centerAction: true,
          onPress: () => onSelect?.("post")
        },
        {
          key: "messages",
          label: "Messages",
          active: activeKey === "messages",
          onPress: () => onSelect?.("messages")
        },
        {
          key: "profile",
          label: "Profile",
          active: activeKey === "profile",
          onPress: () => onSelect?.("profile")
        }
      ]}
    />
  );
}
