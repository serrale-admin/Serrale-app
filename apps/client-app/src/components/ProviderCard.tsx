import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useProviderActions } from '../hooks/useProviderActions';
import { Icon } from '../lib/icons';
import { fill, useLabels } from '../lib/labels';
import { colors, fonts, radius } from '../lib/theme';
import type { Provider } from '../types';
import Avatar from './Avatar';

export type ProviderCardVariant = 'nearby' | 'verified';

interface Props {
  provider: Provider;
  variant?: ProviderCardVariant;
  showDivider?: boolean;
  style?: ViewStyle;
}

/** Compact provider cards based on the supplied Serrale app references. */
export default function ProviderCard({ provider: p, variant = 'nearby', style }: Props) {
  const { open, call, whatsapp } = useProviderActions();
  const labels = useLabels();
  const trusted = p.verified || p.adminReviewed;
  // Rating chrome renders only when review data actually exists (demo/mock).
  // Live rows carry no ratings (contract matrix M-3) — show the provider's area
  // instead, keeping the meta row informative without fabricating stars.
  const hasRating = p.reviewCount > 0 && p.rating > 0;
  const a11y = hasRating
    ? fill(labels.provider.a11yRated, { name: p.name, service: p.service, rating: p.rating.toFixed(1) })
    : fill(labels.provider.a11yArea, { name: p.name, service: p.service, area: p.area });

  const runAction = (event: GestureResponderEvent, action: () => void) => {
    event.stopPropagation();
    action();
  };

  const metaRow = hasRating ? (
    <View style={styles.ratingRow}>
      <Icon name="ph-star" size={11} color={colors.green700} weight="fill" />
      <Text style={styles.ratingValue}>{p.rating.toFixed(1)}</Text>
      <Text style={styles.reviews}>({p.reviewCount})</Text>
    </View>
  ) : (
    <View style={styles.ratingRow}>
      <Icon name="ph-map-pin" size={11} color={colors.green700} weight="fill" />
      <Text style={styles.reviews} numberOfLines={1}>{p.area}</Text>
    </View>
  );

  if (variant === 'verified') {
    return (
      <Pressable
        style={({ pressed }) => [styles.verifiedCard, pressed && styles.pressed, style]}
        onPress={() => open(p.id)}
        accessibilityRole="button"
        accessibilityLabel={a11y}
      >
        <Avatar name={p.name} size={46} radius={13} fontSize={15} imageUrl={p.imageUrl} />
        <View style={styles.verifiedContent}>
          <Text style={styles.verifiedName} numberOfLines={1}>{p.name}</Text>
          <Text style={styles.verifiedService} numberOfLines={1}>{p.service}</Text>
          {metaRow}
        </View>
        {trusted && (
          <View style={styles.verifiedSeal} accessibilityLabel={labels.a11y.verifiedProvider}>
            <Icon name="ph-shield-check" size={12} color="#fff" weight="fill" />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.nearbyCard, pressed && styles.pressed, style]}
      onPress={() => open(p.id)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <View style={styles.avatarWrap}>
        <Avatar name={p.name} size={58} radius={29} fontSize={17} imageUrl={p.imageUrl} />
        {trusted && (
          <View style={styles.seal} accessibilityLabel={labels.a11y.verifiedProvider}>
            <Icon name="ph-seal-check" size={13} color="#fff" weight="fill" />
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
      <Text style={styles.service} numberOfLines={1}>{p.service}</Text>
      {metaRow}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.callButton, pressed && styles.actionPressed]}
          onPress={(event) => runAction(event, () => call(p))}
          accessibilityLabel={fill(labels.a11y.callProvider, { name: p.name })}
        >
          <Icon name="ph-phone-call" size={16} color={colors.green800} weight="fill" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.whatsappButton, pressed && styles.actionPressed]}
          onPress={(event) => runAction(event, () => whatsapp(p))}
          accessibilityLabel={fill(labels.a11y.whatsappProvider, { name: p.name })}
        >
          <Icon name="ph-whatsapp-logo" size={17} color="#fff" weight="fill" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  nearbyCard: {
    width: 94,
    minHeight: 166,
    alignItems: 'center',
    padding: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    shadowColor: colors.green900,
    shadowOpacity: 0.045,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatarWrap: { position: 'relative' },
  seal: {
    position: 'absolute', right: -4, top: -2, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.green700,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { width: '100%', marginTop: 6, fontSize: 11, fontFamily: fonts.bold, color: colors.text, textAlign: 'center' },
  service: { marginTop: 1, fontSize: 9.5, fontFamily: fonts.regular, color: colors.muted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingValue: { fontSize: 10.5, fontFamily: fonts.bold, color: colors.text },
  reviews: { fontSize: 10, fontFamily: fonts.regular, color: colors.muted },
  actions: { width: '100%', flexDirection: 'row', gap: 5, marginTop: 7 },
  callButton: {
    flex: 1, height: 32, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  whatsappButton: {
    flex: 1, height: 32, borderRadius: radius.md, backgroundColor: colors.green700,
    alignItems: 'center', justifyContent: 'center',
  },
  actionPressed: { opacity: 0.7 },
  verifiedCard: {
    width: 130,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
  },
  verifiedContent: { flex: 1, minWidth: 0 },
  verifiedName: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.text },
  verifiedService: { marginTop: 1, fontSize: 10, fontFamily: fonts.regular, color: colors.muted },
  verifiedSeal: {
    position: 'absolute', right: 6, top: 6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.green700, alignItems: 'center', justifyContent: 'center',
  },
});
