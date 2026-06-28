import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CATS } from '../data/mock';
import { Icon } from '../lib/icons';
import { useAppStore } from '../store/appStore';
import { colors, fonts, radius } from '../lib/theme';
import BottomSheet from './BottomSheet';
import Medallion from './Medallion';

interface Props {
  visible: boolean;
  onClose(): void;
  onSelect(categoryId: string): void;
}

/** Searchable service picker used by the Request form. */
export default function CategorySheet({ visible, onClose, onSelect }: Props) {
  const { height } = useWindowDimensions();
  const am = useAppStore((s) => s.lang) === 'am';

  return (
    <BottomSheet visible={visible} onClose={onClose} contentStyle={{ height: height * 0.8 }}>
      <View style={styles.header}>
        <Text style={styles.title}>What service do you need?</Text>
        <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
          <Icon name="ph-x" size={15} color={colors.muted} weight="bold" />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {CATS.map((c) => (
          <Pressable
            key={c.id}
            style={styles.cell}
            onPress={() => {
              onSelect(c.id);
              onClose();
            }}
          >
            <Medallion group={c.group} icon={c.icon} size={36} radius={11} iconSize={18} />
            <Text style={styles.label} numberOfLines={2}>
              {am ? c.am : c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 999, backgroundColor: '#F3F0E6', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: 14, paddingBottom: 24 },
  cell: { width: '47.5%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: colors.ivory, borderWidth: 1, borderColor: 'rgba(6,71,52,0.1)', borderRadius: radius.md + 1 },
  label: { flex: 1, fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text, lineHeight: 15 },
});
