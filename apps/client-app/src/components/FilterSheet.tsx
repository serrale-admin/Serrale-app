import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AREA_ALL, AREAS } from '../data/mock';
import { useProviders } from '../hooks/queries';
import { fill, useLabels } from '../lib/labels';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';
import type { ProviderQuery } from '../types';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Chip from './Chip';

interface Props {
  visible: boolean;
  onClose(): void;
  onApply(): void;
  /** Category/search context the filters are layered onto for the live count. */
  baseQuery?: ProviderQuery;
}

/** Selectable areas: the canonical list minus the city-wide sentinel. */
const AREA_OPTIONS = AREAS.filter((a) => a !== AREA_ALL);

/**
 * Filter bottom sheet. Only surfaces dimensions the backend can actually filter
 * by — today that is Location (`?area=`, single value). Rating/availability/
 * price/experience controls were removed because the live API has no such
 * columns or params (contract matrix M-3/M-4); showing them implied filtering
 * that never happened.
 */
export default function FilterSheet({ visible, onClose, onApply, baseQuery }: Props) {
  const { height } = useWindowDimensions();
  const labels = useLabels();
  const filters = useAppStore((s) => s.filters);
  const selectAreaFilter = useAppStore((s) => s.selectAreaFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const liveCount = useProviders({ ...(baseQuery || {}), filters });

  const count = liveCount.data?.total ?? liveCount.data?.items.length ?? 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} showHandle={false} contentStyle={{ maxHeight: height * 0.86, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{labels.common.filters}</Text>
          <Pressable onPress={resetFilters} hitSlop={8}>
            <Text style={styles.reset}>{labels.common.reset}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.secTitle}>{labels.filter.location}</Text>
          <Text style={styles.secHint}>{labels.filter.locationHint}</Text>
          <View style={styles.chips}>
            {AREA_OPTIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                active={filters.areas[0] === o}
                height={36}
                onPress={() => selectAreaFilter(o)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={labels.common.clear} variant="secondary" onPress={resetFilters} style={styles.clear} />
        <Button label={liveCount.isLoading ? labels.common.loading : fill(labels.filter.showCount, { count })} onPress={onApply} style={styles.apply} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 38, height: 4, borderRadius: 999, backgroundColor: 'rgba(6,71,52,0.16)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 14, paddingTop: 6 },
  title: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
  reset: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.success },
  scroll: { padding: 18, paddingTop: 16 },
  secTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, marginBottom: 4 },
  secHint: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6,71,52,0.09)',
  },
  clear: { paddingHorizontal: 20 },
  apply: { flex: 1 },
});
