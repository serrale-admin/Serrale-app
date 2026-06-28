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
        <Pressable style={styles.action} onPress={onAction} hitSlop={8}>
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
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 9,
  },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.success },
});
