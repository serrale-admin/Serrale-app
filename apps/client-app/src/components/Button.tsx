import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { colors, fonts, layout, pressedOpacity, radius } from '../lib/theme';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress(): void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to fill the parent's width. */
  fullWidth?: boolean;
  /** Show a spinner and block presses. */
  loading?: boolean;
  disabled?: boolean;
  /** Optional leading Phosphor icon name (ph-*). */
  icon?: string;
  iconWeight?: IconWeight;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const HEIGHTS: Record<ButtonSize, number> = { sm: 40, md: 46, lg: 50 };
const FONT_SIZES: Record<ButtonSize, number> = { sm: 13, md: 14, lg: 15 };
const ICON_SIZES: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 17 };

const FILL: Record<ButtonVariant, string> = {
  primary: colors.green800,
  gold: colors.gold,
  secondary: colors.surface,
  whatsapp: colors.soft,
};

const CONTENT: Record<ButtonVariant, string> = {
  primary: colors.onDark,
  gold: colors.text,
  secondary: colors.green800,
  whatsapp: colors.whatsapp,
};

/**
 * The single shared action button for the product. Variants cover the deep-green
 * primary, gold accent, bordered secondary, and WhatsApp actions. `loading` and
 * `disabled` both prevent onPress from firing so callers never double-submit.
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  fullWidth,
  loading = false,
  disabled = false,
  icon,
  iconWeight = 'bold',
  style,
  accessibilityLabel,
}: Props) {
  const inert = disabled || loading;
  const bordered = variant === 'secondary' || variant === 'whatsapp';
  const contentColor = CONTENT[variant];

  return (
    <Pressable
      onPress={inert ? undefined : onPress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inert, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHTS[size], backgroundColor: FILL[variant] },
        fullWidth && styles.fullWidth,
        bordered && {
          borderWidth: 1,
          borderColor: variant === 'whatsapp' ? colors.whatsappSoft : colors.borderStrong,
        },
        pressed && !inert && styles.pressed,
        inert && styles.inert,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={ICON_SIZES[size]} color={contentColor} weight={iconWeight} /> : null}
          <Text style={[styles.label, { fontSize: FONT_SIZES[size], color: contentColor }]} numberOfLines={2}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.touchTarget,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: fonts.bold },
  pressed: { opacity: pressedOpacity },
  inert: { opacity: 0.55 },
});
