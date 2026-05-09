export const providerColors = {
  blue: "#1769F2",
  blueDark: "#0B2A5B",
  navy: "#071D3C",
  sky: "#EAF3FF",
  softBlue: "#F3F8FF",
  white: "#FFFFFF",
  successGreen: "#12A66A",
  successSoft: "#E9F8F1",
  warningOrange: "#F59E0B",
  warningSoft: "#FFF4E2",
  purple: "#7C3AED",
  purpleSoft: "#F2EAFF",
  teal: "#0F766E",
  tealSoft: "#E7FAF6",
  dangerRed: "#EF4444",
  dangerSoft: "#FEECEC",
  title: "#071D3C",
  body: "#40506A",
  muted: "#64748B",
  light: "#94A3B8",
  border: "#DDE8F6",
  appBg: "#F8FBFF",
  cardBg: "#FFFFFF",
  softCard: "#F3F8FF",
  blueCard: "#EAF3FF"
} as const;

export const providerSpacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

export const providerRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 999
} as const;

export const providerTypography = {
  display: {
    fontSize: 30,
    fontWeight: "900" as const
  },
  h1: {
    fontSize: 28,
    fontWeight: "900" as const
  },
  h2: {
    fontSize: 22,
    fontWeight: "800" as const
  },
  h3: {
    fontSize: 18,
    fontWeight: "800" as const
  },
  title: {
    fontSize: 15,
    fontWeight: "700" as const
  },
  body: {
    fontSize: 14,
    fontWeight: "500" as const
  },
  label: {
    fontSize: 12,
    fontWeight: "700" as const
  },
  caption: {
    fontSize: 11,
    fontWeight: "600" as const
  }
} as const;

export const providerShadows = {
  card: {
    shadowColor: "#0B2A5B",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  elevated: {
    shadowColor: "#0B2A5B",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  },
  button: {
    shadowColor: "#1769F2",
    shadowOpacity: 0.26,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  }
} as const;
