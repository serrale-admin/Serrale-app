import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { colors, fonts, layout, pressedOpacity } from '../lib/theme';

interface Props {
  label: string;
  onPress(): void;
  /** Leading Phosphor icon (ph-*). Omit for a text-only settings row. */
  icon?: string;
  iconColor?: string;
  iconWeight?: IconWeight;
  /** Tint behind the leading icon bubble. */
  iconTint?: string;
  /** Secondary line under the label. */
  sub?: string;
  /** Right-aligned value text (settings style). */
  value?: string;
  labelColor?: string;
  /** Show the trailing chevron. Defaults to true. */
  chevron?: boolean;
  /** Adds a hairline top divider (for rows after the first inside a group). */
  divided?: boolean;
}

/**
 * One tappable row inside a Card group: optional icon bubble, label (+ optional
 * sub line), optional right-aligned value, and a chevron. Replaces the row/
 * rowIcon/divider style blocks duplicated across profile, settings, help.
 */
export default function ListRow({
  label,
  onPress,
  icon,
  iconColor = colors.success,
  iconWeight = 'fill',
  iconTint = colors.soft,
  sub,
  value,
  labelColor = colors.text,
  chevron = true,
  divided = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, divided && styles.divided, pressed && { opacity: pressedOpacity }]}
    >
      {icon ? (
        <View style={[styles.iconBubble, { backgroundColor: iconTint }]}>
          <Icon name={icon} size={17} color={iconColor} weight={iconWeight} />
        </View>
      ) : null}
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        {sub ? (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {chevron ? <Icon name="ph-caret-right" size={14} color="#cdd5cf" weight="bold" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  divided: { borderTopWidth: 1, borderTopColor: colors.divider },
  iconBubble: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1, minWidth: 0 },
  label: { fontSize: 14, fontFamily: fonts.semibold },
  sub: { fontSize: 11.5, color: colors.faint, marginTop: 1, fontFamily: fonts.regular },
  value: { fontSize: 13, color: colors.faint, fontFamily: fonts.regular, maxWidth: 150, marginRight: 2 },
});
