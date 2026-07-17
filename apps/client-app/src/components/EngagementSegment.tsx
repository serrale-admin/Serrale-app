import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useLabels } from '../lib/labels';
import { colors, fonts, radius } from '../lib/theme';
import { useAppStore } from '../store/appStore';

type EngagementValue = '' | 'temporary' | 'permanent';

interface Props {
  /** Optional style for the outer track wrapper. */
  style?: ViewStyle;
  /** Called after the store filter updates (e.g. navigate to results). */
  onChange?(value: EngagementValue): void;
}

/**
 * Compact All / Temporary / Permanent segment. Writes `filters.engagement`
 * in the shared store so home rails, category lists, and FilterSheet stay in sync.
 */
export default function EngagementSegment({ style, onChange }: Props) {
  const labels = useLabels();
  const engagement = useAppStore((s) => s.filters.engagement);
  const setEngagementFilter = useAppStore((s) => s.setEngagementFilter);

  const options: { value: EngagementValue; label: string }[] = [
    { value: '', label: labels.filter.engagementAll },
    { value: 'temporary', label: labels.filter.engagementTemporary },
    { value: 'permanent', label: labels.filter.engagementPermanent },
  ];

  const current = (engagement === 'temporary' || engagement === 'permanent' ? engagement : '') as EngagementValue;

  return (
    <View style={[styles.track, style]} accessibilityRole="tablist" accessibilityLabel={labels.filter.engagement}>
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <Pressable
            key={opt.value || 'all'}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              setEngagementFilter(opt.value);
              onChange?.(opt.value);
            }}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.soft,
    borderRadius: radius.md,
    padding: 3,
  },
  btn: {
    flex: 1,
    minHeight: 32,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  btnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
  },
  textActive: {
    color: colors.green900,
    fontFamily: fonts.bold,
  },
});
