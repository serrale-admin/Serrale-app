import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useProviderActions } from '../hooks/useProviderActions';
import { Icon } from '../lib/icons';
import { colors, fonts, radius, shadowCard } from '../lib/theme';
import type { Provider } from '../types';
import Avatar from './Avatar';

/**
 * Compact horizontal provider card for the Home "Verified providers" rail.
 * Avatar left, name + verified seal, service type, and rating with count.
 */
export default function ProviderMini({ provider: p }: { provider: Provider }) {
  const { open } = useProviderActions();
  const trusted = p.verified || p.adminReviewed;

  return (
    <Pressable style={styles.card} onPress={() => open(p.id)} accessibilityRole="button" accessibilityLabel={p.name}>
      <Avatar name={p.name} size={46} radius={23} fontSize={17} imageUrl={p.imageUrl} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {p.name}
          </Text>
          {trusted && <Icon name="ph-seal-check" size={14} color={colors.success} weight="fill" />}
        </View>
        <Text style={styles.service} numberOfLines={1}>
          {p.service}
        </Text>
        <View style={styles.rating}>
          <Icon name="ph-star" size={11} color={colors.gold} weight="fill" />
          <Text style={styles.ratingVal}>{p.rating.toFixed(1)}</Text>
          <Text style={styles.reviews} numberOfLines={1}>
            ({p.reviewCount})
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 244,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.10)',
    borderRadius: radius.xl,
    ...shadowCard,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 14, fontFamily: fonts.bold, color: colors.text, flexShrink: 1 },
  service: { fontSize: 12, fontFamily: fonts.medium, color: colors.muted, marginTop: 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  ratingVal: { fontSize: 12, fontFamily: fonts.bold, color: colors.text },
  reviews: { fontSize: 11.5, fontFamily: fonts.regular, color: colors.muted },
});
