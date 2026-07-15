import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { CATS, GROUP_NAMES } from '../data/mock';
import type { Category } from '../types';
import { categoryLabel, serviceGroupLabel } from '../lib/directory-display';
import { Icon } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { useAppStore } from '../store/appStore';
import { colors, fonts, layout, radius } from '../lib/theme';
import BottomSheet from './BottomSheet';
import Medallion from './Medallion';

interface SheetProps {
  visible: boolean;
  onClose(): void;
  onSelect(categoryId: string): void;
  /** Highlight the current selection. */
  value?: string;
  title?: string;
  excludeIds?: string[];
}

const frostShadow = {
  shadowColor: '#064734',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
} as const;

function groupLabel(group: string, labels: ReturnType<typeof useLabels>): string {
  return serviceGroupLabel(group, labels);
}

/** Searchable grouped category picker with frosty icon rows. */
export default function CategorySheet({ visible, onClose, onSelect, value, title, excludeIds = [] }: SheetProps) {
  const { height } = useWindowDimensions();
  const labels = useLabels();
  const am = useAppStore((s) => s.lang) === 'am';
  const [query, setQuery] = useState('');

  const categories = useMemo(
    () => CATS.filter((c) => !excludeIds.includes(c.id)),
    [excludeIds],
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = categories.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.am.includes(query.trim()) || c.group.toLowerCase().includes(q),
    );
    return GROUP_NAMES.map((group) => ({
      group,
      items: filtered.filter((c) => c.group === group),
    })).filter((section) => section.items.length > 0);
  }, [categories, query]);

  const sheetTitle = title ?? labels.request.serviceLabel;

  const pick = (id: string) => {
    onSelect(id);
    setQuery('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} contentStyle={{ height: height * 0.82, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>{sheetTitle}</Text>
        <Pressable style={styles.close} onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel={labels.common.cancel}>
          <Icon name="ph-x" size={15} color={colors.muted} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchField}>
          <Icon name="ph-magnifying-glass" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={labels.categories.searchPlaceholder}
            placeholderTextColor={colors.faint}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="ph-x-circle" size={18} color={colors.faint} weight="fill" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {grouped.map(({ group, items }) => (
          <View key={group} style={styles.section}>
            <Text style={styles.sectionTitle}>{groupLabel(group, labels)}</Text>
            {items.map((c) => (
              <CategoryRow key={c.id} category={c} am={am} active={value === c.id} onPress={() => pick(c.id)} />
            ))}
          </View>
        ))}
        {grouped.length === 0 && (
          <Text style={styles.empty}>{labels.search.noMatch.replace('{q}', query)}</Text>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

function CategoryRow({ category, am, active, onPress }: { category: Category; am: boolean; active: boolean; onPress(): void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <View style={styles.rowSheen} pointerEvents="none" />
      <Medallion group={category.group} icon={category.icon} size={42} radius={13} iconSize={20} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowName, active && styles.rowNameActive]} numberOfLines={2}>
          {categoryLabel(category, am)}
        </Text>
        {!!category.subs?.[0] && (
          <Text style={styles.rowSub} numberOfLines={1}>
            {category.subs[0]}
          </Text>
        )}
      </View>
      {active ? (
        <Icon name="ph-check-circle" size={22} color={colors.success} weight="fill" />
      ) : (
        <Icon name="ph-caret-right" size={14} color={colors.faint} weight="bold" />
      )}
    </Pressable>
  );
}

/** Frosted disclosure row — shows selected category medallion or placeholder. */
export function CategoryPickerField({
  categoryId,
  placeholder,
  fieldLabel,
  onPress,
  accessibilityLabel,
}: {
  categoryId?: string;
  placeholder: string;
  fieldLabel?: string;
  onPress(): void;
  accessibilityLabel?: string;
}) {
  const am = useAppStore((s) => s.lang) === 'am';
  const category = categoryId ? CATS.find((c) => c.id === categoryId) : undefined;
  const filled = !!category;

  return (
    <View>
      {!!fieldLabel && <Text style={styles.fieldLabel}>{fieldLabel}</Text>}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
      >
        <View style={styles.pickerSheen} pointerEvents="none" />
        {filled && category ? (
          <Medallion group={category.group} icon={category.icon} size={44} radius={14} iconSize={20} />
        ) : (
          <View style={styles.pickerPlaceholder}>
            <Icon name="ph-wrench" size={20} color={colors.green700} weight="fill" />
          </View>
        )}
        <View style={styles.pickerCopy}>
          <Text style={styles.pickerHint}>{placeholder}</Text>
          <Text style={[styles.pickerValue, !filled && styles.pickerValueMuted]} numberOfLines={1}>
            {filled && category ? categoryLabel(category, am) : placeholder}
          </Text>
        </View>
        <Icon name="ph-caret-down" size={14} color={colors.muted} weight="bold" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingTop: 4,
    paddingBottom: 10,
  },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text },
  close: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: layout.gutter, paddingBottom: 10 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: layout.controlHeight,
    paddingHorizontal: 14,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.xxl,
    ...frostShadow,
  },
  searchInput: { flex: 1, fontSize: 14.5, fontFamily: fonts.regular, color: colors.text, padding: 0 },
  list: { paddingHorizontal: layout.gutter, paddingBottom: 28 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  row: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 7,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.xxl,
    ...frostShadow,
  },
  rowActive: { borderColor: colors.green700, backgroundColor: colors.frostDeep },
  rowPressed: { opacity: 0.78 },
  rowSheen: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: colors.frostHi,
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowName: { fontSize: 14.5, fontFamily: fonts.semibold, color: colors.text, lineHeight: 18 },
  rowNameActive: { color: colors.green900 },
  rowSub: { fontSize: 11.5, fontFamily: fonts.regular, color: colors.muted },
  empty: { fontSize: 13.5, fontFamily: fonts.regular, color: colors.muted, textAlign: 'center', paddingVertical: 32 },
  fieldLabel: { fontFamily: fonts.semibold, color: colors.text, fontSize: 12.5, marginBottom: 5 },
  picker: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    borderRadius: radius.xxl,
    ...frostShadow,
  },
  pickerPressed: { opacity: 0.76 },
  pickerSheen: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: colors.frostHi,
  },
  pickerPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.frostHi,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCopy: { flex: 1, minWidth: 0, gap: 2 },
  pickerHint: { fontSize: 11, fontFamily: fonts.semibold, color: colors.muted, letterSpacing: 0.2 },
  pickerValue: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  pickerValueMuted: { color: colors.faint, fontFamily: fonts.regular },
});
