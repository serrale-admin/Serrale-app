import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useProviderActions } from '../hooks/useProviderActions';
import { Icon } from '../lib/icons';
import { colors, fonts, radius, shadowCard } from '../lib/theme';
import type { Provider } from '../types';
import Avatar from './Avatar';

/**
 * Vertical provider card for the Home "Nearby providers" horizontal rail.
 * Centered avatar, verified seal badge, name + service, rating with review
 * count, and Call / WhatsApp actions. Real provider data + existing actions.
 */
export default function ProviderCard({ provider: p }: { provider: Provider }) {
  const { open, call, whatsapp } = useProviderActions();
  const trusted = p.verified || p.adminReviewed;

  return (
    <Pressable style={styles.card} onPress={() => open(p.id)} accessibilityRole="button" accessibilityLabel={p.name}>
      {trusted && (
        <View style={styles.seal} accessibilityLabel="Verified">
          <Icon name="ph-seal-check" size={15} color="#fff" weight="fill" />
        </View>
      )}

      <Avatar name={p.name} size={62} radius={31} fontSize={22} imageUrl={p.imageUrl} />

      <Text style={styles.name} numberOfLines={1}>
        {p.name}
      </Text>
      <Text style={styles.service} numberOfLines={1}>
        {p.service}
      </Text>

      <View style={styles.rating}>
        <Icon name="ph-star" size={12} color={colors.gold} weight="fill" />
        <Text style={styles.ratingVal}>{p.rating.toFixed(1)}</Text>
        <Text style={styles.reviews} numberOfLines={1}>
          ({p.reviewCount})
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.callBtn} onPress={() => call(p)} accessibilityLabel={`Call ${p.name}`} hitSlop={4}>
          <Icon name="ph-phone-call" size={16} color={colors.green800} weight="fill" />
        </Pressable>
        <Pressable style={styles.waBtn} onPress={() => whatsapp(p)} accessibilityLabel={`WhatsApp ${p.name}`} hitSlop={4}>
          <Icon name="ph-whatsapp-logo" size={16} color="#fff" weight="fill" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 156,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 13,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.10)',
    borderRadius: radius.xxl,
    ...shadowCard,
  },
  seal: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginTop: 11, fontSize: 14.5, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  service: { marginTop: 2, fontSize: 12, fontFamily: fonts.medium, color: colors.muted, textAlign: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  ratingVal: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.text },
  reviews: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 13, alignSelf: 'stretch', justifyContent: 'center' },
  callBtn: {
    flex: 1,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBtn: {
    flex: 1,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.green800,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
