import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, pressedOpacity, radius, shadowCard } from '../lib/theme';

export type CardVariant = 'surface' | 'group' | 'flat';

interface Props {
  children: ReactNode;
  variant?: CardVariant;
  /** When provided the whole card is pressable with touch feedback. */
  onPress?(): void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * White surface container shared by list groups, detail sections, and info
 * blocks. `group` clips its children (rounded corners over divided rows);
 * `flat` drops the shadow for nested/quieter surfaces.
 */
export default function Card({ children, variant = 'surface', onPress, style, accessibilityLabel }: Props) {
  const base = [
    styles.card,
    variant === 'group' && styles.group,
    variant === 'flat' && styles.flat,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [...base, pressed && { opacity: pressedOpacity }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    ...shadowCard,
    shadowOpacity: 0.04,
  },
  group: { overflow: 'hidden', borderColor: 'rgba(6,71,52,0.09)' },
  flat: { shadowOpacity: 0, elevation: 0 },
});
