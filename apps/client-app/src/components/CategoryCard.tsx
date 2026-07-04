import { Image, ImageBackground, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { categoryImage } from '../lib/category-images';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  name: string;
  icon: string;
  imageKey?: string;
  count?: string;
  variant?: 'shortcut' | 'tile' | 'row';
  onPress(): void;
  style?: ViewStyle;
}

/** Category treatments: compact icon pills plus photographic discovery cards. */
export default function CategoryCard({ name, icon, imageKey, count, variant = 'tile', onPress, style }: Props) {
  if (variant === 'shortcut') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.shortcut, pressed && styles.pressed, style]}
        accessibilityRole="button"
        accessibilityLabel={name}
      >
        <Icon name={icon} size={17} color={colors.green700} weight="fill" />
        <Text style={styles.shortcutName} numberOfLines={1}>{name}</Text>
      </Pressable>
    );
  }

  if (variant === 'row') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
        accessibilityRole="button"
        accessibilityLabel={name}
      >
        <Image source={categoryImage(imageKey)} style={styles.rowImage} resizeMode="cover" />
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={2}>{name}</Text>
          {!!count && <Text style={styles.count} numberOfLines={1}>{count}</Text>}
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
      <Text style={styles.tileName} numberOfLines={2}>{name}</Text>
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
    borderColor: colors.borderSoft,
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
  tileName: {
    flex: 1,
    minHeight: 28,
    paddingHorizontal: 7,
    paddingVertical: 5,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 10.5,
    lineHeight: 13,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
  },
  rowImage: { width: 58, height: 54, borderRadius: radius.md, backgroundColor: colors.soft },
  rowText: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, lineHeight: 16 },
  count: { marginTop: 3, fontSize: 10.5, fontFamily: fonts.regular, color: colors.muted },
});
