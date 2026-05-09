import { StyleSheet } from "react-native";

export const clientColors = {
  primary: "#1769F2",
  primaryDark: "#0B2A5B",
  navy: "#071D3C",
  background: "#F8FBFF",
  softBlue: "#EAF3FF",
  surface: "#FFFFFF",
  
  success: "#12A66A",
  successSoft: "#E9F8F1",
  warning: "#F59E0B",
  warningSoft: "#FFF4E2",
  purple: "#7C3AED",
  purpleSoft: "#F2EAFF",
  teal: "#0F766E",
  tealSoft: "#E7FAF6",
  danger: "#EF4444",
  dangerSoft: "#FEECEC",

  title: "#071D3C",
  body: "#40506A",
  muted: "#64748B",
  light: "#94A3B8",
  border: "#DDE8F6",
  white: "#FFFFFF",
};

export const clientRadius = {
  small: 10,
  medium: 16,
  large: 22,
  card: 24,
  hero: 30,
  pill: 999,
};

export const clientSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenPadding: 20,
};

export const clientShadows = {
  card: {
    shadowColor: "#0B2A5B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4,
  },
  elevated: {
    shadowColor: "#0B2A5B",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 45,
    elevation: 8,
  },
  button: {
    shadowColor: "#1769F2",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 6,
  },
};

export const clientTypography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: "900",
    color: clientColors.navy,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 20,
    fontWeight: "800",
    color: clientColors.navy,
  },
  h3: {
    fontSize: 18,
    fontWeight: "800",
    color: clientColors.navy,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: clientColors.title,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: clientColors.body,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: clientColors.muted,
  },
  caption: {
    fontSize: 12,
    fontWeight: "600",
    color: clientColors.light,
  },
  button: {
    fontSize: 16,
    fontWeight: "800",
    color: clientColors.white,
  },
});
