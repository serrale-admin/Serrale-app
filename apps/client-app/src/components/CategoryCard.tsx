import { Image, ImageBackground, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { categoryImage } from '../lib/category-images';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

type ShortcutTone = 'default' | 'temporary' | 'permanent';

interface Props {
  name: string;
  icon: string;
  imageKey?: string;
  count?: string;
  variant?: 'shortcut' | 'tile' | 'row';
  /** Tint for engagement filter chips in the home shortcut row. */
  tone?: ShortcutTone;
  /** Selected state for toggleable shortcut chips (engagement filters). */
  active?: boolean;
  onPress(): void;
  style?: ViewStyle;
}

const SHORTCUT_TONE = {
  default: {
    icon: colors.green700,
    text: colors.text,
    chip: undefined as ViewStyle | undefined,
    chipActive: undefined as ViewStyle | undefined,
    textActive: undefined as { color: string } | undefined,
  },
  temporary: {
    icon: colors.goldText,
    text: colors.goldSoftText,
    chip: { backgroundColor: colors.goldSoft, borderColor: 'rgba(246,185,59,0.35)' } as ViewStyle,
    chipActive: { backgroundColor: '#FFE9B0', borderColor: colors.gold } as ViewStyle,
    textActive: { color: colors.onGold },
  },
  permanent: {
    icon: colors.success,
    text: colors.green800,
    chip: { backgroundColor: colors.soft, borderColor: 'rgba(21,127,89,0.28)' } as ViewStyle,
    chipActive: { backgroundColor: colors.frostDeep, borderColor: colors.success } as ViewStyle,
    textActive: { color: colors.green900 },
  },
} as const;

/** Category treatments: compact icon pills plus photographic discovery cards. */
export default function CategoryCard({
  name,
  icon,
  imageKey,
  count,
  variant = 'tile',
  tone = 'default',
  active = false,
  onPress,
  style,
}: Props) {
  if (variant === 'shortcut') {
    const tint = SHORTCUT_TONE[tone];
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.shortcut,
          tint.chip,
          active && tint.chipActive,
          pressed && styles.pressed,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityState={tone !== 'default' ? { selected: active } : undefined}
      >
        <Icon name={icon} size={17} color={active && tint.textActive ? tint.textActive.color : tint.icon} weight="fill" />
        <Text
          style={[styles.shortcutName, { color: tint.text }, active && tint.textActive]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'row') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
        accessibilityRole="button"
        accessibilityLabel={count ? `${name}, ${count}` : name}
      >
        <View style={styles.rowThumb}>
          <Image source={categoryImage(imageKey)} style={styles.rowImage} resizeMode="cover" />
          <View style={styles.rowThumbIcon}>
            <Icon name={icon} size={12} color={colors.gold} weight="fill" />
          </View>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={2} ellipsizeMode="tail">
            {name}
          </Text>
          {!!count && (
            <Text style={styles.count} numberOfLines={1} ellipsizeMode="tail">
              {count}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <ImageBackground source={categoryImage(imageKey)} style={styles.tileImage} imageStyle={styles.tileImageShape} resizeMode="contain">
        <View style={styles.tileIcon}>
          <Icon name={icon} size={14} color="#fff" weight="fill" />
        </View>
      </ImageBackground>
      <View style={styles.tileBody}>
        <View style={styles.tileAccent} />
        <Text style={styles.tileName} numberOfLines={2}>{name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  shortcut: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    shadowColor: colors.green900,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  shortcutName: { fontSize: 10.5, fontFamily: fonts.semibold, color: colors.text },
  tile: {
    height: 94,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#064734',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tileImage: { height: 65, width: '100%', backgroundColor: '#F3F6F4' },
  tileImageShape: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  tileIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: 'rgba(0,77,57,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBody: {
    flex: 1,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.sage,
  },
  tileAccent: {
    width: 16,
    height: 2,
    borderRadius: 1,
    marginBottom: 3,
    backgroundColor: colors.gold,
  },
  tileName: {
    color: colors.green800,
    fontSize: 10.5,
    lineHeight: 13,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
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
  rowThumb: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#edf2ee',
  },
  rowImage: { width: '100%', height: '100%' },
  rowThumbIcon: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green800,
    borderWidth: 1,
    borderColor: 'rgba(246,185,59,0.28)',
  },
  rowText: { flex: 1, minWidth: 0, justifyContent: 'center' },
  rowName: { fontSize: 12, fontFamily: fonts.bold, color: colors.green900, lineHeight: 15 },
  count: { marginTop: 2, fontSize: 10, fontFamily: fonts.semibold, color: colors.green700 },
});
