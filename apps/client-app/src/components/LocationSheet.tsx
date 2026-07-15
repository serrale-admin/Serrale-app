import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AREAS } from '../data/mock';
import { areaLabel } from '../lib/directory-display';
import { Icon } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { useAppStore } from '../store/appStore';
import { colors, fonts, radius } from '../lib/theme';
import BottomSheet from './BottomSheet';

interface Props {
  visible: boolean;
  onClose(): void;
  value: string;
  onSelect(area: string): void;
  /** Override the default canonical area list (e.g. provider join omits city-wide). */
  areas?: string[];
  title?: string;
}

/** Area picker bottom sheet (used for global location and request area). */
export default function LocationSheet({ visible, onClose, value, onSelect, areas = AREAS, title }: Props) {
  const labels = useLabels();
  const am = useAppStore((s) => s.lang) === 'am';
  const sheetTitle = title ?? labels.location.title;
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>{sheetTitle}</Text>
        <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
          <Icon name="ph-x" size={15} color={colors.muted} weight="bold" />
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {areas.map((a, i) => {
          const active = a === value;
          const cityWide = a === AREAS[0];
          return (
            <Pressable
              key={a}
              style={[styles.row, active && styles.rowActive]}
              onPress={() => {
                onSelect(a);
                onClose();
              }}
            >
              <Icon
                name={cityWide ? 'ph-buildings' : 'ph-map-pin'}
                size={18}
                color={cityWide ? colors.goldText : colors.success}
                weight={cityWide ? 'fill' : 'regular'}
              />
              <Text style={[styles.label, active && styles.labelActive]}>{areaLabel(a, am)}</Text>
              {active && <Icon name="ph-check-circle" size={21} color={colors.success} weight="fill" />}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 999, backgroundColor: '#F3F0E6', alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 14, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13, paddingHorizontal: 12, borderRadius: radius.lg, marginBottom: 3 },
  rowActive: { backgroundColor: colors.soft },
  label: { flex: 1, fontSize: 14.5, fontFamily: fonts.medium, color: colors.text },
  labelActive: { fontFamily: fonts.bold },
});
