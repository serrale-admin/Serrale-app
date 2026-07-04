import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts } from '../lib/theme';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?(): void;
}

/** Section title with an optional "View all" style action on the right. */
export default function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && (
        <Pressable style={styles.action} onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="ph-caret-right" size={11} color={colors.success} weight="bold" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 15.5, lineHeight: 20, fontFamily: fonts.bold, color: colors.text, letterSpacing: -0.18 },
  action: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionText: { fontSize: 11.5, fontFamily: fonts.semibold, color: colors.success },
});
