import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { colors, fonts } from '../lib/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress(): void;
  iconName?: string;
  iconWeight?: IconWeight;
  /** Icon color when inactive. Defaults to text. Pass a brand green for premium pills. */
  iconColor?: string;
  iconSize?: number;
  height?: number;
  style?: ViewStyle;
}

/** Pill chip with active (filled green) and inactive (white) states. */
export default function Chip({ label, active, onPress, iconName, iconWeight, iconColor, iconSize = 12, height = 32, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { height, backgroundColor: active ? colors.green800 : colors.surface, borderColor: active ? colors.green800 : colors.border },
        style,
      ]}
    >
      {iconName && (
        <Icon
          name={iconName}
          size={iconSize}
          color={active ? '#fff' : iconColor || colors.text}
          weight={iconWeight || (active ? 'fill' : 'regular')}
        />
      )}
      <Text style={[styles.label, { color: active ? '#fff' : colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: { fontSize: 11.5, fontFamily: fonts.semibold },
});
