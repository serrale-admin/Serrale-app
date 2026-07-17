import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

type Kind = 'temporary' | 'permanent';

interface Props {
  kind: Kind;
  label: string;
  active?: boolean;
  onPress(): void;
  style?: ViewStyle;
}

const KIND = {
  temporary: {
    icon: 'ph-calendar-check',
    idle: {
      backgroundColor: 'transparent',
      borderColor: 'rgba(246,185,59,0.55)',
    } as ViewStyle,
    active: {
      backgroundColor: colors.goldSoft,
      borderColor: colors.gold,
    } as ViewStyle,
    iconIdle: colors.goldText,
    iconActive: colors.onGold,
    textIdle: colors.goldSoftText,
    textActive: colors.onGold,
  },
  permanent: {
    icon: 'ph-shield-check',
    idle: {
      backgroundColor: 'transparent',
      borderColor: 'rgba(21,127,89,0.45)',
    } as ViewStyle,
    active: {
      backgroundColor: colors.soft,
      borderColor: colors.success,
    } as ViewStyle,
    iconIdle: colors.success,
    iconActive: colors.green800,
    textIdle: colors.green700,
    textActive: colors.green900,
  },
} as const;

/**
 * Compact engagement filter toggle for the home category row.
 * Intentionally not a CategoryCard shortcut — outlined, shorter, squared radius.
 */
export default function EngagementFilterChip({ kind, label, active = false, onPress, style }: Props) {
  const tone = KIND[kind];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? tone.active : tone.idle,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Icon
        name={tone.icon}
        size={13}
        color={active ? tone.iconActive : tone.iconIdle}
        weight={active ? 'fill' : 'regular'}
      />
      <Text style={[styles.label, { color: active ? tone.textActive : tone.textIdle }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  chip: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  label: { fontSize: 10, fontFamily: fonts.semibold, letterSpacing: 0.1 },
});
