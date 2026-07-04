import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useProviders } from '../hooks/queries';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';
import type { Filters, ProviderQuery } from '../types';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Chip from './Chip';

interface Section {
  title: string;
  key: keyof Filters;
  options: string[];
  rating?: boolean;
}

const SECTIONS: Section[] = [
  { title: 'Location', key: 'areas', options: ['Bole', 'Yeka', 'Kirkos', 'Arada', 'Lideta', 'Gullele', 'Kolfe Keranio', 'Nifas Silk-Lafto', 'Akaki Kality', 'Lemi Kura'] },
  { title: 'Availability', key: 'avail', options: ['Available today', 'Open now', 'This week'] },
  { title: 'Trust', key: 'trust', options: ['Verified only', 'Admin reviewed', 'Has past work', 'Has reviews'] },
  { title: 'Rating', key: 'rating', options: ['4.5+', '4.0+', 'Any'], rating: true },
  { title: 'Contact', key: 'contact', options: ['Phone available', 'WhatsApp available'] },
  { title: 'Price level', key: 'price', options: ['Budget', 'Standard', 'Premium'] },
  { title: 'Experience', key: 'exp', options: ['1+ years', '3+ years', '5+ years'] },
];

interface Props {
  visible: boolean;
  onClose(): void;
  onApply(): void;
  /** Category/search context the filters are layered onto for the live count. */
  baseQuery?: ProviderQuery;
}

/** Filter bottom sheet — narrows provider results without leaving the screen. */
export default function FilterSheet({ visible, onClose, onApply, baseQuery }: Props) {
  const { height } = useWindowDimensions();
  const filters = useAppStore((s) => s.filters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);
  const setRating = useAppStore((s) => s.setRating);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const liveCount = useProviders({ ...(baseQuery || {}), filters });

  const count = liveCount.data?.total ?? liveCount.data?.items.length ?? 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} showHandle={false} contentStyle={{ height: height * 0.86, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={resetFilters} hitSlop={8}>
            <Text style={styles.reset}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={{ marginBottom: 20 }}>
            <Text style={styles.secTitle}>{sec.title}</Text>
            <View style={styles.chips}>
              {sec.options.map((o) => {
                const active = sec.rating ? filters.rating === o : (filters[sec.key] as string[]).includes(o);
                return (
                  <Chip
                    key={o}
                    label={o}
                    active={active}
                    height={36}
                    onPress={() => (sec.rating ? setRating(o) : toggleFilter(sec.key, o))}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Clear" variant="secondary" onPress={resetFilters} style={styles.clear} />
        <Button label={`Show ${count} providers`} onPress={onApply} style={styles.apply} />
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
  secTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, marginBottom: 10 },
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
