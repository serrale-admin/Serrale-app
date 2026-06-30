import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';
import IconBubble from './IconBubble';

interface Props {
  name: string;
  icon: string;
  /** Optional provider count line (row variant). */
  count?: string;
  /** 'tile' = compact, icon bubble on top (Home). 'row' = icon bubble left + count (Categories). */
  variant?: 'tile' | 'row';
  onPress(): void;
  style?: ViewStyle;
}

/**
 * Premium frosted-green category card. Light green glass surface, subtle green
 * border, soft shadow, white icon bubble with a deep-green glyph. Flexible
 * height so longer Amharic labels wrap without clipping.
 */
export default function CategoryCard({ name, icon, count, variant = 'tile', onPress, style }: Props) {
  const isRow = variant === 'row';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, isRow ? styles.row : styles.tile, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Inner glass highlight */}
      <LinearGradient
        colors={[colors.frostHi, 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.glaze}
        pointerEvents="none"
      />
      <IconBubble icon={icon} size={isRow ? 42 : 44} iconSize={isRow ? 21 : 22} />
      <View style={isRow ? styles.rowText : styles.tileText}>
        <Text style={isRow ? styles.rowName : styles.tileName} numberOfLines={2}>
          {name}
        </Text>
        {isRow && !!count && (
          <View style={styles.metaRow}>
            <Icon name="ph-users-three" size={11} color={colors.success} weight="fill" />
            <Text style={styles.count} numberOfLines={1}>
              {count}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    shadowColor: '#064734',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
  glaze: { position: 'absolute', top: 0, left: 0, right: 0, height: '60%' },
  // Home tile: icon bubble centered on top, label below.
  tile: { flex: 1, alignItems: 'center', gap: 9, paddingVertical: 14, paddingHorizontal: 4, minHeight: 104 },
  tileText: { width: '100%' },
  tileName: { fontSize: 11, fontFamily: fonts.bold, color: colors.green900, textAlign: 'center', lineHeight: 14, letterSpacing: -0.2 },
  // Categories row: icon bubble left, name + count stacked right.
  row: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, minHeight: 82 },
  rowText: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 14.5, fontFamily: fonts.bold, color: colors.green900, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  count: { fontSize: 10.5, fontFamily: fonts.semibold, color: colors.muted, flexShrink: 1 },
});
