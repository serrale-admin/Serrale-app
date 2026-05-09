import { StyleSheet, Text, View } from "react-native";

import { providerColors, providerRadius, providerSpacing, providerTypography } from "../theme";

export function MatchBadge({ percentage }: { percentage: number }) {
  return (
    <View style={styles.matchPill}>
      <View style={styles.matchDot} />
      <Text style={styles.matchText}>{percentage}% Match</Text>
    </View>
  );
}

const statusColorMap = {
  Submitted: {
    bg: providerColors.sky,
    fg: providerColors.blue
  },
  Viewed: {
    bg: providerColors.successSoft,
    fg: providerColors.successGreen
  },
  Shortlisted: {
    bg: providerColors.purpleSoft,
    fg: providerColors.purple
  },
  Interview: {
    bg: providerColors.warningSoft,
    fg: providerColors.warningOrange
  },
  Won: {
    bg: providerColors.successSoft,
    fg: providerColors.successGreen
  },
  Rejected: {
    bg: providerColors.dangerSoft,
    fg: providerColors.dangerRed
  }
} as const;

export function ProposalStatusBadge({
  status
}: {
  status: "Submitted" | "Viewed" | "Shortlisted" | "Interview" | "Won" | "Rejected";
}) {
  const tone = statusColorMap[status];

  return (
    <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.statusText, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  matchPill: {
    backgroundColor: providerColors.successSoft,
    borderRadius: providerRadius.full,
    paddingHorizontal: providerSpacing.sm,
    paddingVertical: providerSpacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.xs
  },
  matchDot: {
    width: 6,
    height: 6,
    borderRadius: providerRadius.full,
    backgroundColor: providerColors.successGreen
  },
  matchText: {
    ...providerTypography.caption,
    color: providerColors.successGreen
  },
  statusPill: {
    borderRadius: providerRadius.full,
    paddingHorizontal: providerSpacing.sm,
    paddingVertical: providerSpacing.xs
  },
  statusText: {
    ...providerTypography.caption,
    letterSpacing: 0.3
  }
});
