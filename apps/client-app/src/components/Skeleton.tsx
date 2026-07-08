import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { useLabels } from '../lib/labels';
import { colors, radius, shadowCard } from '../lib/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** A single neutral placeholder block. Compose these into loading rows. */
export function Skeleton({ width = '100%', height = 12, radius: r = 6, style }: SkeletonProps) {
  return <View style={[styles.block, { width, height, borderRadius: r }, style]} />;
}

/** One provider-card-shaped placeholder (avatar + three text lines). */
export function SkeletonProviderRow() {
  return (
    <View style={styles.card}>
      <Skeleton width={48} height={48} radius={12} />
      <View style={styles.body}>
        <Skeleton width="55%" height={13} />
        <Skeleton width="80%" height={11} style={styles.gap} />
        <Skeleton width="40%" height={11} style={styles.gap} />
      </View>
    </View>
  );
}

/** A vertical stack of provider placeholders for list loading states. */
export function SkeletonProviderList({ count = 5 }: { count?: number }) {
  const labels = useLabels();
  return (
    <View style={styles.list} accessibilityLabel={labels.a11y.loadingProviders} accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProviderRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.soft },
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 11,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg + 1,
    ...shadowCard,
  },
  body: { flex: 1, justifyContent: 'center' },
  gap: { marginTop: 8 },
});
