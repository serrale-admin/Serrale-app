import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Category } from '../types';
import { GROUP_NAMES } from '../data/mock';
import { fill, useLabels } from '../lib/labels';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Chip from './Chip';

export type CategorySort = 'popular' | 'alphabetical';

interface Props {
  visible: boolean;
  categories: Category[];
  selectedGroup: string;
  sort: CategorySort;
  onClose(): void;
  onApply(group: string, sort: CategorySort): void;
}

const GROUP_ICONS: Record<string, string> = {
  'Home Services': 'ph-house',
  'Repairs & Maintenance': 'ph-wrench',
  'Moving & Transport': 'ph-truck',
  'Health & Wellness': 'ph-heartbeat',
};

function groupLabel(group: string, labels: ReturnType<typeof useLabels>): string {
  if (group === 'Home Services') return labels.categories.homeServices;
  if (group === 'Repairs & Maintenance') return labels.categories.repairsMaintenance;
  if (group === 'Moving & Transport') return labels.categories.movingTransport;
  if (group === 'Health & Wellness') return labels.categories.healthWellness;
  return group;
}

/** Mobile counterpart of the web Services page group filter and sort controls. */
export default function CategoryFilterSheet({
  visible,
  categories,
  selectedGroup,
  sort,
  onClose,
  onApply,
}: Props) {
  const { height } = useWindowDimensions();
  const labels = useLabels();
  const [draftGroup, setDraftGroup] = useState(selectedGroup);
  const [draftSort, setDraftSort] = useState<CategorySort>(sort);

  useEffect(() => {
    if (!visible) return;
    setDraftGroup(selectedGroup);
    setDraftSort(sort);
  }, [selectedGroup, sort, visible]);

  const groupCounts = useMemo(
    () =>
      Object.fromEntries(
        GROUP_NAMES.map((group) => [
          group,
          categories
            .filter((category) => category.group === group)
            .reduce((total, category) => total + category.count, 0),
        ]),
      ) as Record<string, number>,
    [categories],
  );

  const resultCount = draftGroup
    ? categories.filter((category) => category.group === draftGroup).length
    : categories.length;

  const reset = () => {
    setDraftGroup('');
    setDraftSort('popular');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      showHandle={false}
      contentStyle={{ maxHeight: height * 0.86, backgroundColor: colors.bg }}
    >
      <View style={styles.header}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{labels.categories.filterTitle}</Text>
            <Text style={styles.subtitle}>{labels.categories.serviceGroups}</Text>
          </View>
          <Pressable onPress={reset} hitSlop={8}>
            <Text style={styles.reset}>{labels.common.reset}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.groupList}>
          <Pressable
            style={[styles.groupRow, draftGroup === '' && styles.groupRowActive]}
            onPress={() => setDraftGroup('')}
            accessibilityRole="radio"
            accessibilityState={{ selected: draftGroup === '' }}
          >
            <View style={[styles.iconBox, draftGroup === '' && styles.iconBoxActive]}>
              <Icon name="ph-squares-four" size={18} color={draftGroup === '' ? colors.gold : colors.green700} weight="fill" />
            </View>
            <Text style={[styles.groupName, draftGroup === '' && styles.groupNameActive]}>
              {labels.categories.allServices}
            </Text>
            <Text style={styles.count}>{categories.reduce((total, category) => total + category.count, 0)}+</Text>
            {draftGroup === '' ? <Icon name="ph-check-circle" size={19} color={colors.green700} weight="fill" /> : null}
          </Pressable>

          {GROUP_NAMES.map((group) => {
            const active = draftGroup === group;
            return (
              <Pressable
                key={group}
                style={[styles.groupRow, active && styles.groupRowActive]}
                onPress={() => setDraftGroup(group)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                  <Icon name={GROUP_ICONS[group]} size={18} color={active ? colors.gold : colors.green700} weight="fill" />
                </View>
                <Text style={[styles.groupName, active && styles.groupNameActive]}>{groupLabel(group, labels)}</Text>
                <Text style={styles.count}>{groupCounts[group]}+</Text>
                {active ? <Icon name="ph-check-circle" size={19} color={colors.green700} weight="fill" /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>{labels.categories.sortBy}</Text>
        <View style={styles.sortRow}>
          <Chip
            label={labels.categories.mostProviders}
            iconName="ph-trend-up"
            active={draftSort === 'popular'}
            onPress={() => setDraftSort('popular')}
          />
          <Chip
            label={labels.categories.alphabetical}
            iconName="ph-sort-ascending"
            active={draftSort === 'alphabetical'}
            onPress={() => setDraftSort('alphabetical')}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={labels.common.clear} variant="secondary" onPress={reset} style={styles.clear} />
        <Button
          label={fill(labels.categories.showCategories, { count: resultCount })}
          onPress={() => onApply(draftGroup, draftSort)}
          style={styles.apply}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 38, height: 4, borderRadius: 999, backgroundColor: 'rgba(6,71,52,0.16)' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  title: { fontSize: 18, fontFamily: fonts.bold, color: colors.green900 },
  subtitle: { marginTop: 3, fontSize: 12, fontFamily: fonts.regular, color: colors.muted },
  reset: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.green700 },
  scroll: { padding: 18, paddingBottom: 22 },
  groupList: { gap: 8 },
  groupRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.xl,
    backgroundColor: colors.frost,
    borderWidth: 1,
    borderColor: colors.frostBorder,
  },
  groupRowActive: { backgroundColor: colors.frostDeep, borderColor: colors.green700 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.frostHi,
    borderWidth: 1,
    borderColor: colors.frostBorder,
  },
  iconBoxActive: { backgroundColor: colors.green800, borderColor: 'rgba(246,185,59,0.28)' },
  groupName: { flex: 1, fontSize: 13.5, lineHeight: 18, fontFamily: fonts.semibold, color: colors.text },
  groupNameActive: { fontFamily: fonts.bold, color: colors.green900 },
  count: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.green700 },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 18 },
  sectionTitle: { marginBottom: 10, fontSize: 13, fontFamily: fonts.bold, color: colors.green900 },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clear: { paddingHorizontal: 20 },
  apply: { flex: 1 },
});
