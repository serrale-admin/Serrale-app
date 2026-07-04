import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

export type BadgeTone = 'count' | 'trust' | 'gold';

interface Props {
  label: string | number;
  tone?: BadgeTone;
  /** Optional leading Phosphor icon (ph-*). Ignored for the count tone. */
  icon?: string;
  iconWeight?: IconWeight;
}

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  count: { bg: colors.gold, fg: colors.onGold },
  trust: { bg: colors.soft, fg: colors.success },
  gold: { bg: colors.goldSoft, fg: colors.goldSoftText },
};

/**
 * Compact pill badge. `count` renders the small gold number chip used on filter
 * buttons; `trust`/`gold` render an icon+label chip used for verification and
 * price signals. Consolidates the badge blocks previously copied per screen.
 */
export default function Badge({ label, tone = 'trust', icon, iconWeight = 'fill' }: Props) {
  const { bg, fg } = TONES[tone];
  const isCount = tone === 'count';

  return (
    <View style={[styles.base, isCount ? styles.count : styles.label, { backgroundColor: bg }]}>
      {icon && !isCount ? <Icon name={icon} size={11} color={fg} weight={iconWeight} /> : null}
      <Text style={[isCount ? styles.countText : styles.labelText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill },
  count: { minWidth: 17, height: 17, paddingHorizontal: 4, justifyContent: 'center' },
  label: { gap: 3, paddingHorizontal: 7, paddingVertical: 2 },
  countText: { fontSize: 10, fontFamily: fonts.bold, textAlign: 'center' },
  labelText: { fontSize: 10.5, fontFamily: fonts.bold },
});
