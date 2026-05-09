import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

export type IconName = ComponentProps<typeof Ionicons>["name"];

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function IconSymbol({ name, size = 18, color = "#64748B" }: IconSymbolProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
