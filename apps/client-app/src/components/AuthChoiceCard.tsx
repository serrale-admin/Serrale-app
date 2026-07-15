import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  title: string;
  subtitle: string;
  cta: string;
  icon: string;
  photo: ImageSourcePropType;
  variant?: 'customer' | 'provider';
  onPress(): void;
}

/** Category row-card pattern adapted for auth path selection. */
export default function AuthChoiceCard({
  title,
  subtitle,
  cta,
  icon,
  photo,
  variant = 'customer',
  onPress,
}: Props) {
  const isProvider = variant === 'provider';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isProvider && styles.rowProvider,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <Image source={photo} style={styles.rowImage} resizeMode="cover" accessibilityIgnoresInvertColors />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={2}>
          {subtitle}
        </Text>
        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, isProvider && styles.ctaTextProvider]}>{cta}</Text>
          <Icon name="ph-arrow-right" size={11} color={isProvider ? colors.goldText : colors.green800} weight="bold" />
        </View>
      </View>
      <View style={[styles.rowIconBadge, isProvider && styles.rowIconBadgeProvider]}>
        <Icon name={icon} size={15} color={colors.gold} weight="fill" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  row: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.lg,
    shadowColor: '#064734',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rowProvider: {
    backgroundColor: colors.goldSoft,
    borderColor: 'rgba(246,185,59,0.35)',
  },
  rowImage: { width: 72, height: 76, borderRadius: radius.md, backgroundColor: '#edf2ee' },
  rowIconBadge: {
    position: 'absolute',
    top: 8,
    left: 52,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green800,
    borderWidth: 1,
    borderColor: 'rgba(246,185,59,0.28)',
    shadowColor: '#042820',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowIconBadgeProvider: { backgroundColor: colors.goldText },
  rowText: { flex: 1, minWidth: 0, paddingRight: 4 },
  rowName: { fontSize: 15, fontFamily: fonts.bold, color: colors.green900, lineHeight: 19 },
  rowSub: { marginTop: 4, fontSize: 12, fontFamily: fonts.regular, color: colors.muted, lineHeight: 17 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  ctaText: { fontSize: 12, fontFamily: fonts.bold, color: colors.green800 },
  ctaTextProvider: { color: colors.goldText },
});
