import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ProviderJob, ProviderProposal } from "../types";
import { formatEtbRange } from "../format";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../theme";
import { MatchBadge, ProposalStatusBadge } from "./ProviderBadges";
import { IconSymbol } from "./IconSymbol";
import { ProviderButton } from "./ProviderButton";

export function SummaryCard({
  icon,
  number,
  label,
  hint,
  iconBg
}: {
  icon: "briefcase-outline" | "document-text-outline" | "chatbubble-ellipses-outline" | "rocket-outline";
  number: string;
  label: string;
  hint: string;
  iconBg: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: iconBg }]}>
        <IconSymbol name={icon} size={18} color={providerColors.blueDark} />
      </View>
      <Text style={styles.summaryNumber}>{number}</Text>
      <View>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryHint}>{hint}</Text>
      </View>
    </View>
  );
}

export function JobCard({
  job,
  saved,
  onToggleSave,
  onOpen,
  ctaLabel = "View Job"
}: {
  job: ProviderJob;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
  ctaLabel?: string;
}) {
  return (
    <View style={styles.jobCard}>
      <View style={styles.jobTopRow}>
        <View style={[styles.catBubble, { backgroundColor: job.catBg }]}>
          <IconSymbol
            name={job.category === "Development" ? "code-slash-outline" : "image-outline"}
            size={18}
            color={job.catColor}
          />
        </View>
        <View style={styles.jobTextWrap}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobSubline}>
            {job.client}
            {job.clientVerified ? " - Verified" : ""}
            {" - "}
            {job.category}
          </Text>
        </View>
        <Pressable onPress={onToggleSave} style={styles.iconPress}>
          <IconSymbol
            name={saved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={saved ? providerColors.blue : providerColors.muted}
          />
        </Pressable>
      </View>

      <Text style={styles.priceText}>{formatEtbRange(job.budgetMin, job.budgetMax)}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <IconSymbol name="location-outline" size={12} color={providerColors.muted} />
          <Text style={styles.metaText}>{job.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <IconSymbol name="time-outline" size={12} color={providerColors.muted} />
          <Text style={styles.metaText}>{job.posted}</Text>
        </View>
      </View>

      <View style={styles.jobFooter}>
        <MatchBadge percentage={job.match} />
        <ProviderButton label={ctaLabel} full={false} onPress={onOpen} style={styles.smallCta} />
      </View>
    </View>
  );
}

export function ProposalCard({
  proposal,
  onView
}: {
  proposal: ProviderProposal;
  onView?: () => void;
}) {
  return (
    <View style={styles.proposalCard}>
      <View style={styles.proposalHead}>
        <View style={styles.proposalTitleWrap}>
          <Text style={styles.proposalTitle}>{proposal.project}</Text>
          <Text style={styles.proposalSub}>{proposal.client}</Text>
        </View>
        <ProposalStatusBadge status={proposal.status} />
      </View>

      <View style={styles.proposalBottom}>
        <View style={styles.proposalMetaWrap}>
          <Text style={styles.proposalBudget}>{proposal.budget}</Text>
          <Text style={styles.proposalDate}>Submitted {proposal.submitted}</Text>
        </View>
        {onView ? <ProviderButton label="View" full={false} onPress={onView} style={styles.smallCta} /> : null}
      </View>
      <Text style={styles.proposalUpdate}>{proposal.update}</Text>
    </View>
  );
}

export function ProfileMenuRow({
  icon,
  title,
  subtitle,
  danger = false,
  onPress
}: {
  icon: "person-outline" | "images-outline" | "construct-outline" | "calendar-outline" | "wallet-outline" | "document-text-outline" | "notifications-outline" | "shield-outline" | "help-circle-outline" | "settings-outline" | "log-out-outline";
  title: string;
  subtitle?: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <View
        style={[
          styles.menuIconWrap,
          { backgroundColor: danger ? providerColors.dangerSoft : providerColors.softCard }
        ]}
      >
        <IconSymbol
          name={icon}
          size={18}
          color={danger ? providerColors.dangerRed : providerColors.blue}
        />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuTitle, danger ? styles.menuDangerText : null]}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {!danger ? <IconSymbol name="chevron-forward" size={16} color={providerColors.light} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: providerColors.cardBg,
    borderRadius: providerRadius.lg,
    padding: providerSpacing.md,
    gap: providerSpacing.sm,
    minHeight: 116,
    ...providerShadows.card
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: providerRadius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryNumber: {
    ...providerTypography.h2,
    color: providerColors.navy
  },
  summaryLabel: {
    ...providerTypography.label,
    color: providerColors.title
  },
  summaryHint: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  jobCard: {
    backgroundColor: providerColors.cardBg,
    borderRadius: providerRadius.xl,
    padding: providerSpacing.md,
    gap: providerSpacing.sm,
    ...providerShadows.card
  },
  jobTopRow: {
    flexDirection: "row",
    gap: providerSpacing.sm
  },
  catBubble: {
    width: 44,
    height: 44,
    borderRadius: providerRadius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  jobTextWrap: {
    flex: 1,
    gap: providerSpacing.xxs
  },
  jobTitle: {
    ...providerTypography.title,
    color: providerColors.navy,
    lineHeight: 21
  },
  jobSubline: {
    ...providerTypography.caption,
    color: providerColors.body
  },
  iconPress: {
    padding: providerSpacing.xs
  },
  priceText: {
    ...providerTypography.title,
    color: providerColors.blue
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.md
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.xxs
  },
  metaText: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  jobFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  smallCta: {
    minHeight: 40,
    borderRadius: providerRadius.sm,
    paddingHorizontal: providerSpacing.md
  },
  proposalCard: {
    backgroundColor: providerColors.cardBg,
    borderRadius: providerRadius.lg,
    padding: providerSpacing.md,
    gap: providerSpacing.sm,
    ...providerShadows.card
  },
  proposalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: providerSpacing.sm
  },
  proposalTitleWrap: {
    flex: 1,
    gap: providerSpacing.xxs
  },
  proposalTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  proposalSub: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  proposalBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  proposalMetaWrap: {
    gap: providerSpacing.xxs
  },
  proposalBudget: {
    ...providerTypography.label,
    color: providerColors.blue
  },
  proposalDate: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  proposalUpdate: {
    ...providerTypography.caption,
    color: providerColors.body
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm,
    paddingVertical: providerSpacing.sm
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: providerRadius.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  menuTextWrap: {
    flex: 1
  },
  menuTitle: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  menuSubtitle: {
    ...providerTypography.caption,
    color: providerColors.muted,
    marginTop: 1
  },
  menuDangerText: {
    color: providerColors.dangerRed
  }
});
