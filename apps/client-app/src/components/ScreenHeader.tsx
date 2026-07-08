import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { colors, fonts, layout } from '../lib/theme';

interface Props {
  title?: string;
  /** Optional second line under the title (e.g. "126 providers near Bole"). */
  subtitle?: string;
  right?: ReactNode;
  /** Hide the back button (top-level screens that shouldn't pop). */
  showBack?: boolean;
  onBack?(): void;
}

/**
 * Back-button header used by detail / settings-style screens. Optional subtitle
 * and a right slot cover the category/provider/results headers so they share one
 * layout instead of re-implementing the row per screen.
 */
export default function ScreenHeader({ title, subtitle, right, showBack = true, onBack }: Props) {
  const router = useRouter();
  const labels = useLabels();
  const back = onBack || (() => router.back());
  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable style={styles.backBtn} onPress={back} accessibilityRole="button" accessibilityLabel={labels.common.back} hitSlop={6}>
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
      ) : null}
      {title ? (
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.spacer} />
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 8, paddingRight: 12, paddingBottom: 8, paddingTop: 2 },
  backBtn: { width: 40, height: layout.touchTarget, alignItems: 'center', justifyContent: 'center' },
  titleCol: { flex: 1, minWidth: 0 },
  spacer: { flex: 1 },
  title: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, fontFamily: fonts.regular, marginTop: 1 },
});
